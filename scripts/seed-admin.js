// Admin Account Seeder Script
// Run with: node scripts/seed-admin.js

import bcrypt from 'bcryptjs';
import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/database.db');

// Admin credentials - CHANGE THESE OR USE ENVIRONMENT VARIABLES
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Anth-Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Anth@StructuredForGrowth.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Secure!813Bowl420!';

async function seedAdmin() {
    console.log('🔐 Admin Account Seeder\n');
    
    const SQL = await initSqlJs();
    let db;
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load or create database
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
        db = new SQL.Database();
        console.log('✅ Created fresh database');
    }
    
    // Ensure users table exists
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            client_id INTEGER,
            is_active INTEGER DEFAULT 1,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Check if admin user exists
    const existingUser = db.exec(`SELECT id FROM users WHERE username = '${ADMIN_USERNAME}' OR email = '${ADMIN_EMAIL}'`);
    
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
        // Update existing admin
        const userId = existingUser[0].values[0][0];
        db.run(`
            UPDATE users 
            SET password = ?, role = 'admin', is_active = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [hashedPassword, userId]);
        console.log(`✅ Updated existing admin account (ID: ${userId})`);
    } else {
        // Create new admin
        db.run(`
            INSERT INTO users (username, email, password, role, is_active)
            VALUES (?, ?, ?, 'admin', 1)
        `, [ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword]);
        console.log('✅ Created new admin account');
    }
    
    // Save database
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('💾 Database saved\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${'*'.repeat(ADMIN_PASSWORD.length)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Admin account ready! Go to /dashboard to login.\n');
    
    db.close();
}

seedAdmin().catch(err => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
});
