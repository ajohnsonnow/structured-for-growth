import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;
let isInitialized = false;

// Save database to disk
function saveDatabase() {
    if (db) {
        try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbPath, buffer);
            console.log('💾 Database saved to disk');
        } catch (err) {
            console.error('Failed to save database:', err);
        }
    }
}

// Initialize and return database (singleton pattern)
export async function initializeDatabase() {
    if (isInitialized && db) {
        return db;
    }

    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    try {
        if (fs.existsSync(dbPath)) {
            const buffer = fs.readFileSync(dbPath);
            db = new SQL.Database(buffer);
            console.log('✅ Loaded existing database');
        } else {
            db = new SQL.Database();
            console.log('✅ Created new database');
        }
    } catch (err) {
        console.log('Creating fresh database:', err.message);
        db = new SQL.Database();
    }
    
    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            company TEXT,
            website TEXT,
            address TEXT,
            status TEXT DEFAULT 'active',
            notes TEXT,
            contract_start DATE,
            contract_end DATE,
            monthly_retainer DECIMAL(10, 2),
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'planning',
            priority TEXT DEFAULT 'medium',
            budget DECIMAL(10, 2),
            hours_estimated INTEGER,
            hours_actual INTEGER DEFAULT 0,
            start_date DATE,
            end_date DATE,
            completion_date DATE,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            hours_estimated INTEGER,
            hours_actual INTEGER DEFAULT 0,
            assigned_to INTEGER,
            due_date DATE,
            completed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            task_id INTEGER,
            user_id INTEGER NOT NULL,
            hours DECIMAL(5, 2) NOT NULL,
            description TEXT,
            entry_date DATE NOT NULL,
            billable INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            responded_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    saveDatabase();
    isInitialized = true;
    console.log('✅ Database tables initialized');
    
    return db;
}

// Get database instance (synchronous after init)
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

// Helper to run queries and return results
export function query(sql, params = []) {
    const database = getDatabase();
    try {
        const stmt = database.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    } catch (err) {
        console.error('Query error:', sql, err);
        throw err;
    }
}

// Helper to run a query and get first result
export function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
}

// Helper to run INSERT/UPDATE/DELETE and get result
export function execute(sql, params = []) {
    const database = getDatabase();
    try {
        database.run(sql, params);
        const changes = database.getRowsModified();
        const lastId = query('SELECT last_insert_rowid() as id')[0]?.id;
        saveDatabase(); // Save after writes
        return { changes, lastInsertRowid: lastId };
    } catch (err) {
        console.error('Execute error:', sql, err);
        throw err;
    }
}

// Log activity
export function logActivity(userId, action, entityType = null, entityId = null, details = null, ipAddress = null) {
    try {
        execute(
            `INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, action, entityType, entityId, details, ipAddress]
        );
    } catch (err) {
        console.error('Activity log error:', err);
    }
}

// Auto-save on process exit
process.on('exit', saveDatabase);
process.on('SIGINT', () => {
    saveDatabase();
    process.exit();
});
process.on('SIGTERM', () => {
    saveDatabase();
    process.exit();
});

export default { initializeDatabase, getDatabase, query, queryOne, execute, logActivity };
