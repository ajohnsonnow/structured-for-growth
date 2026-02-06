import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, execute, getDatabase, logActivity } from '../models/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default backup directory (can be overridden by env var)
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

// Ensure backup directory exists
function ensureBackupDir(customPath = null) {
    const dir = customPath || BACKUP_DIR;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

// Get all tables in the database
function getAllTables() {
    return query(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
}

// Export entire database as JSON
function exportDatabase() {
    const tables = getAllTables();
    const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        tables: {}
    };
    
    for (const table of tables) {
        data.tables[table.name] = query(`SELECT * FROM ${table.name}`);
    }
    
    return data;
}

// List all backups
router.get('/list', authenticateToken, (req, res) => {
    try {
        const dir = ensureBackupDir();
        const files = fs.readdirSync(dir)
            .filter(f => f.endsWith('.json'))
            .map(f => {
                const stats = fs.statSync(path.join(dir, f));
                return {
                    filename: f,
                    size: stats.size,
                    sizeFormatted: formatBytes(stats.size),
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ success: true, backups: files, backupDir: dir });
    } catch (error) {
        console.error('List backups error:', error);
        res.status(500).json({ success: false, message: 'Failed to list backups' });
    }
});

// Create a backup
router.post('/create', authenticateToken, (req, res) => {
    try {
        const { name, customPath } = req.body;
        const dir = ensureBackupDir(customPath);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = name ? `${name}-${timestamp}.json` : `backup-${timestamp}.json`;
        const filepath = path.join(dir, filename);
        
        const data = exportDatabase();
        data.backupName = name || 'Manual Backup';
        data.createdBy = req.user.username;
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        
        logActivity(req.user.userId, 'BACKUP_CREATE', 'backup', null, `Created backup: ${filename}`);
        
        res.json({ 
            success: true, 
            message: 'Backup created successfully',
            filename,
            filepath,
            size: formatBytes(fs.statSync(filepath).size),
            tables: Object.keys(data.tables).length,
            records: Object.values(data.tables).reduce((sum, arr) => sum + arr.length, 0)
        });
    } catch (error) {
        console.error('Create backup error:', error);
        res.status(500).json({ success: false, message: 'Failed to create backup' });
    }
});

// Download a backup
router.get('/download/:filename', authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(ensureBackupDir(), filename);
        
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ success: false, message: 'Backup not found' });
        }
        
        res.download(filepath, filename);
    } catch (error) {
        console.error('Download backup error:', error);
        res.status(500).json({ success: false, message: 'Failed to download backup' });
    }
});

// Export current database (direct download without saving to file)
router.get('/export', authenticateToken, (req, res) => {
    try {
        const data = exportDatabase();
        data.backupName = 'Direct Export';
        data.createdBy = req.user.username;
        
        const filename = `sfg-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(JSON.stringify(data, null, 2));
        
        logActivity(req.user.userId, 'BACKUP_EXPORT', 'backup', null, 'Exported database');
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Failed to export database' });
    }
});

// Restore from backup
router.post('/restore', authenticateToken, async (req, res) => {
    try {
        const { filename, data: jsonData } = req.body;
        let backupData;
        
        if (filename) {
            // Restore from file
            const filepath = path.join(ensureBackupDir(), filename);
            if (!fs.existsSync(filepath)) {
                return res.status(404).json({ success: false, message: 'Backup file not found' });
            }
            backupData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        } else if (jsonData) {
            // Restore from uploaded JSON
            backupData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        } else {
            return res.status(400).json({ success: false, message: 'No backup source provided' });
        }
        
        // Create a backup before restoring
        const preRestoreBackup = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const preRestoreData = exportDatabase();
        preRestoreData.backupName = 'Pre-Restore Automatic Backup';
        fs.writeFileSync(path.join(ensureBackupDir(), preRestoreBackup), JSON.stringify(preRestoreData, null, 2));
        
        const db = getDatabase();
        
        // Restore each table
        const restoredTables = [];
        for (const [tableName, records] of Object.entries(backupData.tables)) {
            // Skip if no records
            if (!records || records.length === 0) continue;
            
            // Clear existing data
            db.run(`DELETE FROM ${tableName}`);
            
            // Insert records
            for (const record of records) {
                const columns = Object.keys(record);
                const placeholders = columns.map(() => '?').join(', ');
                const values = columns.map(col => record[col]);
                
                try {
                    db.run(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`, values);
                } catch (insertErr) {
                    console.warn(`Skipped record in ${tableName}:`, insertErr.message);
                }
            }
            
            restoredTables.push({ table: tableName, records: records.length });
        }
        
        // Save the database
        const data = db.export();
        const buffer = Buffer.from(data);
        const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.db');
        fs.writeFileSync(dbPath, buffer);
        
        logActivity(req.user.userId, 'BACKUP_RESTORE', 'backup', null, `Restored from: ${filename || 'uploaded data'}`);
        
        res.json({
            success: true,
            message: 'Database restored successfully',
            preRestoreBackup,
            restored: restoredTables,
            totalRecords: restoredTables.reduce((sum, t) => sum + t.records, 0)
        });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ success: false, message: 'Failed to restore database: ' + error.message });
    }
});

// Delete a backup
router.delete('/:filename', authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(ensureBackupDir(), filename);
        
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ success: false, message: 'Backup not found' });
        }
        
        fs.unlinkSync(filepath);
        logActivity(req.user.userId, 'BACKUP_DELETE', 'backup', null, `Deleted backup: ${filename}`);
        
        res.json({ success: true, message: 'Backup deleted successfully' });
    } catch (error) {
        console.error('Delete backup error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete backup' });
    }
});

// Get/set backup settings
router.get('/settings', authenticateToken, (req, res) => {
    const settings = {
        backupDir: BACKUP_DIR,
        autoBackupEnabled: process.env.AUTO_BACKUP === 'true',
        autoBackupInterval: process.env.AUTO_BACKUP_INTERVAL || '24h',
        maxBackups: parseInt(process.env.MAX_BACKUPS || '10')
    };
    res.json({ success: true, settings });
});

// Get database statistics
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const tables = getAllTables();
        const stats = {
            tables: [],
            totalRecords: 0,
            databaseSize: 'N/A'
        };
        
        for (const table of tables) {
            const count = query(`SELECT COUNT(*) as count FROM ${table.name}`)[0]?.count || 0;
            stats.tables.push({ name: table.name, records: count });
            stats.totalRecords += count;
        }
        
        // Get database file size
        const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.db');
        if (fs.existsSync(dbPath)) {
            stats.databaseSize = formatBytes(fs.statSync(dbPath).size);
        }
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

// Utility function
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Auto-backup function (called from database.js on changes)
export function triggerAutoBackup(action, userId = null, details = null) {
    try {
        if (process.env.AUTO_BACKUP !== 'true') return;
        
        const dir = ensureBackupDir();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `auto-${action.toLowerCase()}-${timestamp}.json`;
        const filepath = path.join(dir, filename);
        
        const data = exportDatabase();
        data.backupName = `Auto-backup: ${action}`;
        data.trigger = { action, userId, details };
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`🔄 Auto-backup created: ${filename}`);
        
        // Clean old auto-backups (keep last N)
        cleanOldBackups(dir, parseInt(process.env.MAX_BACKUPS || '20'));
    } catch (err) {
        console.error('Auto-backup failed:', err);
    }
}

function cleanOldBackups(dir, maxBackups) {
    try {
        const files = fs.readdirSync(dir)
            .filter(f => f.startsWith('auto-') && f.endsWith('.json'))
            .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime }))
            .sort((a, b) => b.time - a.time);
        
        if (files.length > maxBackups) {
            for (const file of files.slice(maxBackups)) {
                fs.unlinkSync(path.join(dir, file.name));
                console.log(`🗑️ Removed old backup: ${file.name}`);
            }
        }
    } catch (err) {
        console.error('Clean old backups error:', err);
    }
}

export default router;
