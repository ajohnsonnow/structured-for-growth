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
            client_id INTEGER,
            is_active INTEGER DEFAULT 1,
            is_demo INTEGER DEFAULT 0,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
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
            is_demo INTEGER DEFAULT 0,
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
            is_demo INTEGER DEFAULT 0,
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
            is_demo INTEGER DEFAULT 0,
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
            is_demo INTEGER DEFAULT 0,
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
            is_demo INTEGER DEFAULT 0,
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
            is_demo INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Messages table for client communication
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            user_id INTEGER,
            direction TEXT NOT NULL DEFAULT 'outbound',
            subject TEXT,
            content TEXT NOT NULL,
            sent_via TEXT DEFAULT 'email',
            read_at DATETIME,
            is_demo INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Campaigns table for email marketing
    db.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            segment_id INTEGER,
            sent_count INTEGER DEFAULT 0,
            open_count INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            scheduled_at DATETIME,
            sent_at DATETIME,
            is_demo INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (segment_id) REFERENCES segments(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Segments table for client grouping
    db.run(`
        CREATE TABLE IF NOT EXISTS segments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            filter_rules TEXT,
            client_count INTEGER DEFAULT 0,
            is_demo INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Campaign recipients tracking
    db.run(`
        CREATE TABLE IF NOT EXISTS campaign_recipients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            client_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            sent_at DATETIME,
            opened_at DATETIME,
            clicked_at DATETIME,
            is_demo INTEGER DEFAULT 0,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        )
    `);

    // Email templates
    db.run(`
        CREATE TABLE IF NOT EXISTS email_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            is_demo INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Migration: Add is_demo column to existing tables if missing
    const tablesToMigrate = [
        'users', 'clients', 'projects', 'tasks', 'time_entries', 
        'contact_submissions', 'activity_log', 'messages', 
        'campaigns', 'segments', 'campaign_recipients', 'email_templates'
    ];
    
    for (const table of tablesToMigrate) {
        try {
            // Check if column exists by trying to select it
            db.exec(`SELECT is_demo FROM ${table} LIMIT 1`);
        } catch (e) {
            // Column doesn't exist, add it
            try {
                db.run(`ALTER TABLE ${table} ADD COLUMN is_demo INTEGER DEFAULT 0`);
                console.log(`🔧 Added is_demo column to ${table}`);
            } catch (alterErr) {
                // Ignore if already exists or other error
            }
        }
    }

    // Seed test data if database is empty
    await seedTestData();

    saveDatabase();
    isInitialized = true;
    console.log('✅ Database tables initialized');
    
    return db;
}

// Seed test data for development
async function seedTestData() {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default;
    
    // Admin credentials from environment or defaults
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Anth-Admin';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Anth@StructuredForGrowth.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Secure!813Bowl420!';
    const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'DemoPass2026!';
    
    // Check if we have users
    const userCount = query('SELECT COUNT(*) as count FROM users')[0]?.count || 0;
    
    if (userCount === 0) {
        // Create admin user with configured credentials
        const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        execute(`
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `, [ADMIN_USERNAME, ADMIN_EMAIL, adminPassword, 'admin']);
        console.log(`👤 Created admin user: ${ADMIN_USERNAME}`);
    } else {
        // Ensure admin user exists and update password if using env vars
        const existingAdmin = query(`SELECT id FROM users WHERE username = ? OR email = ?`, [ADMIN_USERNAME, ADMIN_EMAIL]);
        if (existingAdmin.length === 0) {
            // Create the configured admin if they don't exist
            const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            execute(`
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `, [ADMIN_USERNAME, ADMIN_EMAIL, adminPassword, 'admin']);
            console.log(`👤 Created configured admin user: ${ADMIN_USERNAME}`);
        }
    }
    
    // Check if we have clients
    const clientCount = query('SELECT COUNT(*) as count FROM clients')[0]?.count || 0;
    
    if (clientCount === 0) {
        // Create sample clients
        const sampleClients = [
            { name: 'Acme Corporation', email: 'contact@acme.com', company: 'Acme Corp', phone: '555-0101', status: 'active', monthly_retainer: 2500 },
            { name: 'TechStart Inc', email: 'hello@techstart.io', company: 'TechStart Inc', phone: '555-0102', status: 'active', monthly_retainer: 1500 },
            { name: 'Green Valley Farms', email: 'info@greenvalley.com', company: 'Green Valley Farms', phone: '555-0103', status: 'active', monthly_retainer: 1000 },
            { name: 'Urban Design Studio', email: 'studio@urbandesign.co', company: 'Urban Design Studio', phone: '555-0104', status: 'inactive' },
            { name: 'Sarah Johnson', email: 'sarah@freelancer.com', company: null, phone: '555-0105', status: 'active', monthly_retainer: 500 }
        ];
        
        for (const client of sampleClients) {
            execute(`
                INSERT INTO clients (name, email, company, phone, status, monthly_retainer, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [client.name, client.email, client.company, client.phone, client.status, client.monthly_retainer || null, 1]);
        }
        console.log('👥 Created 5 sample clients');
        
        // Create demo users linked to clients
        const demoPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
        const clientUserMappings = [
            { username: 'john_acme', email: 'john@acme.com', client_id: 1 },
            { username: 'alex_techstart', email: 'alex@techstart.io', client_id: 2 },
            { username: 'mike_greenvalley', email: 'mike@greenvalley.com', client_id: 3 },
            { username: 'lisa_urban', email: 'lisa@urbandesign.co', client_id: 4 },
            { username: 'sarah_freelance', email: 'sarah@freelancer.com', client_id: 5 }
        ];
        
        for (const mapping of clientUserMappings) {
            execute(`
                INSERT INTO users (username, email, password, role, client_id)
                VALUES (?, ?, ?, ?, ?)
            `, [mapping.username, mapping.email, demoPassword, 'user', mapping.client_id]);
        }
        console.log(`👥 Created demo users for all clients (password from DEMO_USER_PASSWORD env)`);
    }
    
    // Check if we have segments
    const segmentCount = query('SELECT COUNT(*) as count FROM segments')[0]?.count || 0;
    
    if (segmentCount === 0) {
        const segments = [
            { name: 'All Clients', description: 'All active and inactive clients', filter_rules: '{}' },
            { name: 'Active Retainers', description: 'Clients with active monthly retainers', filter_rules: '{"status":"active","has_retainer":true}' },
            { name: 'Inactive Clients', description: 'Clients marked as inactive', filter_rules: '{"status":"inactive"}' }
        ];
        
        for (const seg of segments) {
            execute(`
                INSERT INTO segments (name, description, filter_rules, created_by)
                VALUES (?, ?, ?, ?)
            `, [seg.name, seg.description, seg.filter_rules, 1]);
        }
        console.log('📊 Created default segments');
    }
    
    // Check if we have email templates
    const templateCount = query('SELECT COUNT(*) as count FROM email_templates')[0]?.count || 0;
    
    if (templateCount === 0) {
        const templates = [
            {
                name: 'Welcome Email',
                subject: 'Welcome to Structured For Growth!',
                content: `<h1>Welcome, {{clientName}}!</h1>
<p>Thank you for choosing Structured For Growth for your web development needs.</p>
<p>We're excited to work with you on building something amazing together.</p>
<p>Best regards,<br>The SFG Team</p>`,
                category: 'onboarding'
            },
            {
                name: 'Project Update',
                subject: 'Project Update - {{projectName}}',
                content: `<h1>Project Update</h1>
<p>Hi {{clientName}},</p>
<p>Here's the latest update on your project:</p>
<p>{{updateContent}}</p>
<p>Let us know if you have any questions!</p>`,
                category: 'updates'
            },
            {
                name: 'Monthly Newsletter',
                subject: 'SFG Monthly Update - {{month}}',
                content: `<h1>Monthly Newsletter</h1>
<p>Hi {{clientName}},</p>
<p>Here's what's new this month at Structured For Growth:</p>
<ul>
<li>New template releases</li>
<li>Tips & tricks</li>
<li>Industry insights</li>
</ul>`,
                category: 'newsletter'
            },
            {
                name: 'Project Completion',
                subject: 'Your Project is Complete! 🎉',
                content: `<h1>Congratulations, {{clientName}}!</h1>
<p>We're thrilled to let you know that your project <strong>{{projectName}}</strong> is now complete!</p>
<p>You can access your project at: {{projectUrl}}</p>
<p>Thank you for trusting us with your vision. We look forward to working with you again!</p>
<p>Best regards,<br>The SFG Team</p>`,
                category: 'milestone'
            },
            {
                name: 'Invoice Reminder',
                subject: 'Invoice Reminder - {{invoiceNumber}}',
                content: `<h2>Invoice Reminder</h2>
<p>Hi {{clientName}},</p>
<p>This is a friendly reminder that invoice <strong>{{invoiceNumber}}</strong> is due on {{dueDate}}.</p>
<p><strong>Amount Due:</strong> {{amount}}</p>
<p>You can view and pay your invoice here: {{invoiceLink}}</p>
<p>If you've already made payment, please disregard this message.</p>
<p>Thank you!<br>SFG Billing Team</p>`,
                category: 'billing'
            },
            {
                name: 'Meeting Confirmation',
                subject: 'Meeting Confirmed - {{meetingDate}}',
                content: `<h2>Meeting Confirmation</h2>
<p>Hi {{clientName}},</p>
<p>Your meeting has been confirmed for:</p>
<ul>
<li><strong>Date:</strong> {{meetingDate}}</li>
<li><strong>Time:</strong> {{meetingTime}}</li>
<li><strong>Duration:</strong> {{duration}}</li>
<li><strong>Meeting Link:</strong> {{meetingLink}}</li>
</ul>
<p>We look forward to speaking with you!</p>`,
                category: 'meetings'
            },
            {
                name: 'Follow Up',
                subject: 'Following Up - {{subject}}',
                content: `<h2>Following Up</h2>
<p>Hi {{clientName}},</p>
<p>I wanted to follow up regarding {{subject}}.</p>
<p>{{message}}</p>
<p>Please let us know if you have any questions or concerns.</p>
<p>Best regards,<br>{{senderName}}</p>`,
                category: 'general'
            },
            {
                name: 'Feedback Request',
                subject: 'We\'d Love Your Feedback!',
                content: `<h2>How Did We Do?</h2>
<p>Hi {{clientName}},</p>
<p>We hope you're enjoying your new {{projectType}}! Your feedback is incredibly valuable to us.</p>
<p>Could you take a moment to share your experience?</p>
<p><a href="{{feedbackLink}}" style="display: inline-block; padding: 12px 24px; background: #3d7a5f; color: white; text-decoration: none; border-radius: 6px;">Leave Feedback</a></p>
<p>Thank you for your time!</p>`,
                category: 'feedback'
            },
            {
                name: 'Service Renewal',
                subject: 'Your Service Renewal is Coming Up',
                content: `<h2>Service Renewal Notice</h2>
<p>Hi {{clientName}},</p>
<p>Your {{serviceName}} subscription will renew on {{renewalDate}}.</p>
<p><strong>Renewal Amount:</strong> {{amount}}</p>
<p>If you'd like to make any changes to your service, please let us know before {{renewalDate}}.</p>
<p>Thank you for your continued trust in Structured For Growth!</p>`,
                category: 'billing'
            },
            {
                name: 'Security Alert',
                subject: 'Important: Security Update Required',
                content: `<h2>Security Update Notice</h2>
<p>Hi {{clientName}},</p>
<p>We've identified a security update that needs to be applied to your project.</p>
<p><strong>What you need to know:</strong></p>
<ul>
<li>Update will be completed by: {{completionDate}}</li>
<li>Estimated downtime: {{downtime}}</li>
<li>Your site/application will be more secure after this update</li>
</ul>
<p>If you have any concerns, please reach out immediately.</p>
<p>Security Team<br>Structured For Growth</p>`,
                category: 'urgent'
            }
        ];
        
        for (const tmpl of templates) {
            execute(`
                INSERT INTO email_templates (name, subject, content, category, created_by)
                VALUES (?, ?, ?, ?, ?)
            `, [tmpl.name, tmpl.subject, tmpl.content, tmpl.category, 1]);
        }
        console.log('📧 Created 10 email templates');
    }
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
