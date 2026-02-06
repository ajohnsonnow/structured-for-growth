import express from 'express';
import bcrypt from 'bcryptjs';
import { query, execute, logActivity } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { triggerAutoBackup } from './backup.js';

const router = express.Router();

// Generate comprehensive demo data
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { clearExisting = false } = req.body;
        const results = { created: {}, errors: [] };
        
        // Create backup before generating demo data
        triggerAutoBackup('DEMO_DATA_GENERATE', req.user.userId, 'Before demo data generation');
        
        if (clearExisting) {
            // Clear existing demo data only
            const tablesToClear = [
                'campaign_recipients', 'campaigns', 'messages', 'time_entries', 
                'tasks', 'projects', 'contact_submissions', 'activity_log', 
                'email_templates', 'segments'
            ];
            for (const table of tablesToClear) {
                try {
                    execute(`DELETE FROM ${table} WHERE is_demo = 1`);
                } catch (e) {
                    results.errors.push(`Failed to clear demo data from ${table}: ${e.message}`);
                }
            }
            // Clear demo users and demo clients
            execute(`DELETE FROM users WHERE is_demo = 1`);
            execute(`DELETE FROM clients WHERE is_demo = 1`);
        }
        
        // 1. Create diverse clients
        const clients = [
            { name: 'Acme Corporation', email: 'contact@acme.com', company: 'Acme Corp', phone: '555-0101', website: 'https://acme.com', address: '123 Business Ave, New York, NY 10001', status: 'active', monthly_retainer: 5000, notes: 'Enterprise client, high priority' },
            { name: 'TechStart Inc', email: 'hello@techstart.io', company: 'TechStart Inc', phone: '555-0102', website: 'https://techstart.io', address: '456 Startup Blvd, San Francisco, CA 94102', status: 'active', monthly_retainer: 2500, notes: 'Growing SaaS startup' },
            { name: 'Green Valley Farms', email: 'info@greenvalley.com', company: 'Green Valley Farms', phone: '555-0103', website: 'https://greenvalleyfarms.com', address: '789 Country Rd, Austin, TX 78701', status: 'active', monthly_retainer: 1500, notes: 'Organic farm with e-commerce needs' },
            { name: 'Urban Design Studio', email: 'studio@urbandesign.co', company: 'Urban Design Studio', phone: '555-0104', website: 'https://urbandesign.co', address: '321 Creative Lane, Portland, OR 97201', status: 'active', monthly_retainer: 2000, notes: 'Architecture and design firm' },
            { name: 'Sarah Johnson Consulting', email: 'sarah@sjconsulting.com', company: 'SJ Consulting', phone: '555-0105', website: 'https://sjconsulting.com', address: '654 Professional Dr, Denver, CO 80202', status: 'active', monthly_retainer: 1000, notes: 'Business consultant, needs portfolio site' },
            { name: 'Bright Future Academy', email: 'admin@brightfuture.edu', company: 'Bright Future Academy', phone: '555-0106', website: 'https://brightfuture.edu', address: '987 Education Way, Chicago, IL 60601', status: 'active', monthly_retainer: 3000, notes: 'Private school, LMS integration' },
            { name: 'Pacific Marine Services', email: 'ops@pacificmarine.com', company: 'Pacific Marine Services', phone: '555-0107', website: 'https://pacificmarine.com', address: '159 Harbor View, Seattle, WA 98101', status: 'active', monthly_retainer: 4000, notes: 'Marine logistics company' },
            { name: 'Old Town Bakery', email: 'hello@oldtownbakery.com', company: 'Old Town Bakery', phone: '555-0108', website: null, address: '753 Main Street, Boston, MA 02101', status: 'inactive', monthly_retainer: null, notes: 'Paused services, seasonal business' },
            { name: 'NextGen Fitness', email: 'team@nextgenfitness.com', company: 'NextGen Fitness', phone: '555-0109', website: 'https://nextgenfitness.com', address: '852 Wellness Blvd, Miami, FL 33101', status: 'active', monthly_retainer: 1800, notes: 'Gym chain with booking system' },
            { name: 'Mountain View Properties', email: 'sales@mvproperties.com', company: 'Mountain View Properties', phone: '555-0110', website: 'https://mvproperties.com', address: '951 Real Estate Row, Phoenix, AZ 85001', status: 'lead', monthly_retainer: null, notes: 'Potential client - real estate CRM needed' }
        ];
        
        const clientIds = [];
        for (const client of clients) {
            try {
                const result = execute(`
                    INSERT INTO clients (name, email, company, phone, website, address, status, monthly_retainer, notes, is_demo, created_by, contract_start)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, date('now', '-' || abs(random() % 365) || ' days'))
                `, [client.name, client.email, client.company, client.phone, client.website, client.address, client.status, client.monthly_retainer, client.notes, 1]);
                clientIds.push(result.lastInsertRowid);
            } catch (e) {
                results.errors.push(`Client ${client.name}: ${e.message}`);
            }
        }
        results.created.clients = clientIds.length;
        
        // 2. Create client users
        const demoPassword = await bcrypt.hash('demo123!', 10);
        const clientUsers = [
            { username: 'john_acme', email: 'john@acme.com', client_id: clientIds[0] },
            { username: 'alex_techstart', email: 'alex@techstart.io', client_id: clientIds[1] },
            { username: 'mike_greenvalley', email: 'mike@greenvalley.com', client_id: clientIds[2] },
            { username: 'lisa_urban', email: 'lisa@urbandesign.co', client_id: clientIds[3] },
            { username: 'sarah_consulting', email: 'sarah@sjconsulting.com', client_id: clientIds[4] },
            { username: 'admin_brightfuture', email: 'admin@brightfuture.edu', client_id: clientIds[5] },
            { username: 'ops_pacific', email: 'ops@pacificmarine.com', client_id: clientIds[6] },
            { username: 'owner_bakery', email: 'owner@oldtownbakery.com', client_id: clientIds[7] },
            { username: 'manager_fitness', email: 'manager@nextgenfitness.com', client_id: clientIds[8] },
            { username: 'sales_mvp', email: 'sales@mvproperties.com', client_id: clientIds[9] }
        ];
        
        let userCount = 0;
        for (const user of clientUsers) {
            try {
                execute(`INSERT INTO users (username, email, password, role, client_id, is_demo) VALUES (?, ?, ?, 'user', ?, 1)`,
                    [user.username, user.email, demoPassword, user.client_id]);
                userCount++;
            } catch (e) {
                results.errors.push(`User ${user.username}: ${e.message}`);
            }
        }
        results.created.users = userCount;
        
        // 3. Create projects with various statuses
        const projects = [
            { client_id: clientIds[0], title: 'Corporate Website Redesign', description: 'Complete overhaul of main website with modern design', status: 'in-progress', priority: 'high', budget: 25000, hours_estimated: 200, start_date: "date('now', '-30 days')", end_date: "date('now', '+60 days')" },
            { client_id: clientIds[0], title: 'Employee Portal Development', description: 'Internal portal for HR and employee management', status: 'planning', priority: 'medium', budget: 15000, hours_estimated: 120, start_date: "date('now', '+30 days')", end_date: "date('now', '+120 days')" },
            { client_id: clientIds[1], title: 'SaaS Landing Page', description: 'High-converting landing page for new product launch', status: 'completed', priority: 'high', budget: 5000, hours_estimated: 40, hours_actual: 38, start_date: "date('now', '-60 days')", end_date: "date('now', '-30 days')", completion_date: "date('now', '-32 days')" },
            { client_id: clientIds[1], title: 'Dashboard UI/UX', description: 'User dashboard design and implementation', status: 'in-progress', priority: 'high', budget: 12000, hours_estimated: 100, hours_actual: 45, start_date: "date('now', '-20 days')", end_date: "date('now', '+40 days')" },
            { client_id: clientIds[2], title: 'E-commerce Store', description: 'Online store for farm products with delivery scheduling', status: 'in-progress', priority: 'medium', budget: 8000, hours_estimated: 80, hours_actual: 30, start_date: "date('now', '-15 days')", end_date: "date('now', '+45 days')" },
            { client_id: clientIds[3], title: 'Portfolio Website', description: 'Showcase portfolio with project galleries', status: 'completed', priority: 'medium', budget: 6000, hours_estimated: 50, hours_actual: 52, start_date: "date('now', '-90 days')", completion_date: "date('now', '-45 days')" },
            { client_id: clientIds[4], title: 'Consulting Services Site', description: 'Professional services website with booking', status: 'review', priority: 'medium', budget: 4000, hours_estimated: 35, hours_actual: 33, start_date: "date('now', '-25 days')", end_date: "date('now', '+5 days')" },
            { client_id: clientIds[5], title: 'School Website + LMS', description: 'Main website with integrated learning management', status: 'in-progress', priority: 'high', budget: 35000, hours_estimated: 300, hours_actual: 120, start_date: "date('now', '-45 days')", end_date: "date('now', '+90 days')" },
            { client_id: clientIds[6], title: 'Fleet Tracking Dashboard', description: 'Real-time vessel tracking and management', status: 'planning', priority: 'high', budget: 20000, hours_estimated: 180, start_date: "date('now', '+15 days')", end_date: "date('now', '+120 days')" },
            { client_id: clientIds[8], title: 'Fitness App Landing', description: 'Mobile app promotional website', status: 'in-progress', priority: 'medium', budget: 3500, hours_estimated: 30, hours_actual: 15, start_date: "date('now', '-10 days')", end_date: "date('now', '+20 days')" },
            { client_id: clientIds[8], title: 'Member Portal', description: 'Member dashboard with class booking', status: 'on-hold', priority: 'low', budget: 10000, hours_estimated: 90, start_date: "date('now', '+60 days')", end_date: "date('now', '+150 days')" }
        ];
        
        const projectIds = [];
        for (const proj of projects) {
            try {
                const sql = `
                    INSERT INTO projects (client_id, title, description, status, priority, budget, hours_estimated, hours_actual, start_date, end_date, completion_date, created_by, is_demo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${proj.start_date || 'NULL'}, ${proj.end_date || 'NULL'}, ${proj.completion_date || 'NULL'}, 1, 1)
                `;
                const result = execute(sql, [proj.client_id, proj.title, proj.description, proj.status, proj.priority, proj.budget, proj.hours_estimated, proj.hours_actual || 0]);
                projectIds.push(result.lastInsertRowid);
            } catch (e) {
                results.errors.push(`Project ${proj.title}: ${e.message}`);
            }
        }
        results.created.projects = projectIds.length;
        
        // 4. Create tasks for projects
        const taskTemplates = [
            { title: 'Initial Planning & Discovery', status: 'completed', priority: 'high', hours_estimated: 8 },
            { title: 'Wireframe Design', status: 'completed', priority: 'high', hours_estimated: 12 },
            { title: 'UI Design Mockups', status: 'in-progress', priority: 'high', hours_estimated: 20 },
            { title: 'Frontend Development', status: 'pending', priority: 'medium', hours_estimated: 40 },
            { title: 'Backend API Development', status: 'pending', priority: 'medium', hours_estimated: 35 },
            { title: 'Database Setup', status: 'pending', priority: 'medium', hours_estimated: 8 },
            { title: 'Integration Testing', status: 'pending', priority: 'medium', hours_estimated: 15 },
            { title: 'Performance Optimization', status: 'pending', priority: 'low', hours_estimated: 10 },
            { title: 'Client Review & Feedback', status: 'pending', priority: 'high', hours_estimated: 5 },
            { title: 'Final QA & Launch', status: 'pending', priority: 'high', hours_estimated: 12 }
        ];
        
        let taskCount = 0;
        for (let i = 0; i < Math.min(projectIds.length, 8); i++) {
            const numTasks = 3 + Math.floor(Math.random() * 5);
            for (let j = 0; j < numTasks; j++) {
                const template = taskTemplates[j % taskTemplates.length];
                try {
                    execute(`
                        INSERT INTO tasks (project_id, title, description, status, priority, hours_estimated, due_date, is_demo)
                        VALUES (?, ?, ?, ?, ?, ?, date('now', '+' || ? || ' days'), 1)
                    `, [projectIds[i], template.title, `Task for project ${i+1}`, template.status, template.priority, template.hours_estimated, (j + 1) * 7]);
                    taskCount++;
                } catch (e) {
                    results.errors.push(`Task: ${e.message}`);
                }
            }
        }
        results.created.tasks = taskCount;
        
        // 5. Create time entries
        let timeEntryCount = 0;
        for (let i = 0; i < Math.min(projectIds.length, 6); i++) {
            const numEntries = 5 + Math.floor(Math.random() * 10);
            for (let j = 0; j < numEntries; j++) {
                try {
                    const hours = 1 + Math.floor(Math.random() * 6);
                    const descriptions = [
                        'Development work', 'Design iterations', 'Client meeting', 
                        'Code review', 'Bug fixes', 'Documentation', 'Testing'
                    ];
                    execute(`
                        INSERT INTO time_entries (project_id, user_id, hours, description, entry_date, billable, is_demo)
                        VALUES (?, 1, ?, ?, date('now', '-' || ? || ' days'), ?, 1)
                    `, [projectIds[i], hours, descriptions[j % descriptions.length], j * 2, Math.random() > 0.1 ? 1 : 0]);
                    timeEntryCount++;
                } catch (e) {
                    results.errors.push(`Time entry: ${e.message}`);
                }
            }
        }
        results.created.timeEntries = timeEntryCount;
        
        // 6. Create messages
        const messageTemplates = [
            { subject: 'Project Kickoff', content: 'Hi! Excited to get started on your project. Here\'s what we\'ll need to begin...', direction: 'outbound' },
            { subject: 'Re: Project Kickoff', content: 'Thanks for reaching out! We\'re looking forward to working with you. Here\'s the information you requested...', direction: 'inbound' },
            { subject: 'Weekly Update', content: 'Here\'s your weekly project progress update. We\'ve completed the following milestones...', direction: 'outbound' },
            { subject: 'Design Approval', content: 'Please review the attached mockups and let us know your feedback.', direction: 'outbound' },
            { subject: 'Re: Design Approval', content: 'The designs look great! Just a few minor tweaks needed...', direction: 'inbound' },
            { subject: 'Invoice #1001', content: 'Please find attached your invoice for this month\'s work.', direction: 'outbound' },
            { subject: 'Meeting Reminder', content: 'Just a reminder about our call tomorrow at 2 PM.', direction: 'outbound' },
            { subject: 'Feature Request', content: 'We\'d like to add a new feature to the project...', direction: 'inbound' }
        ];
        
        let messageCount = 0;
        for (let i = 0; i < Math.min(clientIds.length, 8); i++) {
            const numMessages = 2 + Math.floor(Math.random() * 5);
            for (let j = 0; j < numMessages; j++) {
                const template = messageTemplates[j % messageTemplates.length];
                try {
                    execute(`
                        INSERT INTO messages (client_id, user_id, direction, subject, content, created_at, is_demo)
                        VALUES (?, 1, ?, ?, ?, datetime('now', '-' || ? || ' hours'), 1)
                    `, [clientIds[i], template.direction, template.subject, template.content, j * 24 + Math.floor(Math.random() * 12)]);
                    messageCount++;
                } catch (e) {
                    results.errors.push(`Message: ${e.message}`);
                }
            }
        }
        results.created.messages = messageCount;
        
        // 7. Create contact submissions
        const contactSubmissions = [
            { name: 'James Wilson', email: 'james@startup.io', company: 'Startup.io', subject: 'Website Development', message: 'We need a new website for our startup. Can you provide a quote?' },
            { name: 'Emily Chen', email: 'emily@designco.com', company: 'DesignCo', subject: 'Portfolio Site', message: 'Looking for someone to build our design portfolio. Love your work!' },
            { name: 'Robert Brown', email: 'robert@lawfirm.com', company: 'Brown & Associates', subject: 'Law Firm Website', message: 'Our law firm needs a professional website with client portal.' },
            { name: 'Maria Garcia', email: 'maria@restaurant.com', company: 'Casa Maria', subject: 'Restaurant Website', message: 'We need a website with online ordering capabilities.' },
            { name: 'David Lee', email: 'david@realestate.com', company: 'Lee Realty', subject: 'Real Estate Platform', message: 'Looking for a property listing website with search functionality.' },
            { name: 'Jennifer Smith', email: 'jen@nonprofit.org', company: 'Helping Hands', subject: 'Non-profit Website', message: 'We need a website with donation functionality for our charity.' },
            { name: 'Michael Johnson', email: 'mike@techcorp.com', company: 'TechCorp', subject: 'E-commerce Development', message: 'Need help building an e-commerce platform with inventory management.' },
            { name: 'Amanda White', email: 'amanda@fitness.com', company: null, subject: 'Personal Training Site', message: 'I\'m a personal trainer looking for a website to book clients.' }
        ];
        
        let submissionCount = 0;
        const statuses = ['new', 'new', 'new', 'read', 'read', 'responded', 'responded', 'archived'];
        for (let i = 0; i < contactSubmissions.length; i++) {
            const sub = contactSubmissions[i];
            try {
                execute(`
                    INSERT INTO contact_submissions (name, email, company, subject, message, status, created_at, is_demo)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), 1)
                `, [sub.name, sub.email, sub.company, sub.subject, sub.message, statuses[i], i * 3]);
                submissionCount++;
            } catch (e) {
                results.errors.push(`Contact submission: ${e.message}`);
            }
        }
        results.created.contactSubmissions = submissionCount;
        
        // 8. Create segments
        const segments = [
            { name: 'All Clients', description: 'All clients in the system', filter_rules: '{}' },
            { name: 'Active Retainers', description: 'Clients with active monthly retainers', filter_rules: '{"status":"active","has_retainer":true}' },
            { name: 'High Value', description: 'Clients with retainers over $2000/month', filter_rules: '{"min_retainer":2000}' },
            { name: 'Inactive', description: 'Clients marked as inactive', filter_rules: '{"status":"inactive"}' },
            { name: 'New Leads', description: 'Potential clients (leads)', filter_rules: '{"status":"lead"}' },
            { name: 'Enterprise', description: 'Enterprise-level clients', filter_rules: '{"min_retainer":4000}' }
        ];
        
        let segmentCount = 0;
        for (const seg of segments) {
            try {
                execute(`INSERT INTO segments (name, description, filter_rules, created_by, is_demo) VALUES (?, ?, ?, 1, 1)`,
                    [seg.name, seg.description, seg.filter_rules]);
                segmentCount++;
            } catch (e) {
                results.errors.push(`Segment ${seg.name}: ${e.message}`);
            }
        }
        results.created.segments = segmentCount;
        
        // 9. Create campaigns
        const campaigns = [
            { name: 'Welcome Series', subject: 'Welcome to Structured For Growth!', content: '<h1>Welcome!</h1><p>Thank you for joining us.</p>', status: 'sent', segment_id: 1 },
            { name: 'Monthly Newsletter - Feb', subject: 'February Updates from SFG', content: '<h1>Monthly Newsletter</h1><p>Here\'s what\'s new...</p>', status: 'sent', segment_id: 2 },
            { name: 'Service Upgrade Offer', subject: 'Exclusive Upgrade Opportunity', content: '<h1>Special Offer</h1><p>Upgrade your plan today!</p>', status: 'draft', segment_id: 3 },
            { name: 'Re-engagement Campaign', subject: 'We Miss You!', content: '<h1>It\'s Been a While</h1><p>Let\'s catch up...</p>', status: 'scheduled', segment_id: 4 },
            { name: 'New Features Announcement', subject: 'Exciting New Features!', content: '<h1>New Features</h1><p>Check out what\'s new...</p>', status: 'draft', segment_id: 1 }
        ];
        
        let campaignCount = 0;
        for (const camp of campaigns) {
            try {
                execute(`
                    INSERT INTO campaigns (name, subject, content, status, segment_id, sent_count, open_count, click_count, created_by, is_demo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
                `, [camp.name, camp.subject, camp.content, camp.status, camp.segment_id, 
                    camp.status === 'sent' ? Math.floor(Math.random() * 50) + 10 : 0,
                    camp.status === 'sent' ? Math.floor(Math.random() * 30) + 5 : 0,
                    camp.status === 'sent' ? Math.floor(Math.random() * 15) : 0]);
                campaignCount++;
            } catch (e) {
                results.errors.push(`Campaign ${camp.name}: ${e.message}`);
            }
        }
        results.created.campaigns = campaignCount;
        
        // 10. Create email templates
        const emailTemplates = [
            { name: 'Welcome Email', subject: 'Welcome to Structured For Growth!', content: '<h1>Welcome, {{clientName}}!</h1><p>We\'re excited to work with you.</p>', category: 'onboarding' },
            { name: 'Project Kickoff', subject: 'Let\'s Get Started - {{projectName}}', content: '<h1>Project Kickoff</h1><p>Hi {{clientName}}, we\'re ready to begin your project.</p>', category: 'projects' },
            { name: 'Weekly Update', subject: 'Weekly Progress Update', content: '<h1>Progress Update</h1><p>Here\'s what we accomplished this week...</p>', category: 'updates' },
            { name: 'Invoice', subject: 'Invoice #{{invoiceNumber}}', content: '<h1>Invoice</h1><p>Please find your invoice attached.</p>', category: 'billing' },
            { name: 'Project Complete', subject: 'Your Project is Complete! 🎉', content: '<h1>Congratulations!</h1><p>Your project {{projectName}} is now live.</p>', category: 'milestone' },
            { name: 'Meeting Request', subject: 'Meeting Request - {{topic}}', content: '<h1>Let\'s Meet</h1><p>I\'d like to schedule a meeting to discuss {{topic}}.</p>', category: 'meetings' },
            { name: 'Thank You', subject: 'Thank You!', content: '<h1>Thank You</h1><p>We appreciate your business!</p>', category: 'general' },
            { name: 'Feedback Request', subject: 'How Did We Do?', content: '<h1>Feedback</h1><p>We\'d love to hear about your experience.</p>', category: 'feedback' },
            { name: 'Holiday Greeting', subject: 'Happy Holidays from SFG!', content: '<h1>Happy Holidays!</h1><p>Wishing you a wonderful holiday season.</p>', category: 'seasonal' },
            { name: 'Renewal Reminder', subject: 'Your Service is Up for Renewal', content: '<h1>Renewal Time</h1><p>Your service will renew on {{renewalDate}}.</p>', category: 'billing' }
        ];
        
        let templateCount = 0;
        for (const tmpl of emailTemplates) {
            try {
                execute(`INSERT INTO email_templates (name, subject, content, category, created_by, is_demo) VALUES (?, ?, ?, ?, 1, 1)`,
                    [tmpl.name, tmpl.subject, tmpl.content, tmpl.category]);
                templateCount++;
            } catch (e) {
                results.errors.push(`Template ${tmpl.name}: ${e.message}`);
            }
        }
        results.created.emailTemplates = templateCount;
        
        // 11. Create activity log entries
        const activities = [
            { action: 'LOGIN', details: 'Admin logged in' },
            { action: 'CREATE_CLIENT', entity_type: 'client', details: 'Created new client: Acme Corporation' },
            { action: 'CREATE_PROJECT', entity_type: 'project', details: 'Created project: Corporate Website Redesign' },
            { action: 'UPDATE_PROJECT', entity_type: 'project', details: 'Updated project status to in-progress' },
            { action: 'SEND_MESSAGE', entity_type: 'message', details: 'Sent message to client' },
            { action: 'CREATE_CAMPAIGN', entity_type: 'campaign', details: 'Created campaign: Welcome Series' },
            { action: 'EXPORT_DATA', details: 'Exported client data' },
            { action: 'BACKUP_CREATE', entity_type: 'backup', details: 'Created system backup' }
        ];
        
        let activityCount = 0;
        for (let i = 0; i < 20; i++) {
            const activity = activities[i % activities.length];
            try {
                execute(`
                    INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, created_at, is_demo)
                    VALUES (1, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'), 1)
                `, [activity.action, activity.entity_type || null, activity.entity_id || null, activity.details, i * 4]);
                activityCount++;
            } catch (e) {
                results.errors.push(`Activity: ${e.message}`);
            }
        }
        results.created.activityLog = activityCount;
        
        logActivity(req.user.userId, 'DEMO_DATA_GENERATED', null, null, JSON.stringify(results.created));
        
        res.json({
            success: true,
            message: 'Demo data generated successfully',
            results
        });
        
    } catch (error) {
        console.error('Generate demo data error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate demo data: ' + error.message });
    }
});

// Get demo data statistics
router.get('/stats', authenticateToken, (req, res) => {
    try {
        // Get total counts
        const total = {
            users: query('SELECT COUNT(*) as count FROM users')[0]?.count || 0,
            clients: query('SELECT COUNT(*) as count FROM clients')[0]?.count || 0,
            projects: query('SELECT COUNT(*) as count FROM projects')[0]?.count || 0,
            tasks: query('SELECT COUNT(*) as count FROM tasks')[0]?.count || 0,
            timeEntries: query('SELECT COUNT(*) as count FROM time_entries')[0]?.count || 0,
            messages: query('SELECT COUNT(*) as count FROM messages')[0]?.count || 0,
            campaigns: query('SELECT COUNT(*) as count FROM campaigns')[0]?.count || 0,
            contactSubmissions: query('SELECT COUNT(*) as count FROM contact_submissions')[0]?.count || 0,
            segments: query('SELECT COUNT(*) as count FROM segments')[0]?.count || 0,
            emailTemplates: query('SELECT COUNT(*) as count FROM email_templates')[0]?.count || 0,
            activityLog: query('SELECT COUNT(*) as count FROM activity_log')[0]?.count || 0
        };
        
        // Get demo-only counts
        const demo = {
            users: query('SELECT COUNT(*) as count FROM users WHERE is_demo = 1')[0]?.count || 0,
            clients: query('SELECT COUNT(*) as count FROM clients WHERE is_demo = 1')[0]?.count || 0,
            projects: query('SELECT COUNT(*) as count FROM projects WHERE is_demo = 1')[0]?.count || 0,
            tasks: query('SELECT COUNT(*) as count FROM tasks WHERE is_demo = 1')[0]?.count || 0,
            timeEntries: query('SELECT COUNT(*) as count FROM time_entries WHERE is_demo = 1')[0]?.count || 0,
            messages: query('SELECT COUNT(*) as count FROM messages WHERE is_demo = 1')[0]?.count || 0,
            campaigns: query('SELECT COUNT(*) as count FROM campaigns WHERE is_demo = 1')[0]?.count || 0,
            contactSubmissions: query('SELECT COUNT(*) as count FROM contact_submissions WHERE is_demo = 1')[0]?.count || 0,
            segments: query('SELECT COUNT(*) as count FROM segments WHERE is_demo = 1')[0]?.count || 0,
            emailTemplates: query('SELECT COUNT(*) as count FROM email_templates WHERE is_demo = 1')[0]?.count || 0,
            activityLog: query('SELECT COUNT(*) as count FROM activity_log WHERE is_demo = 1')[0]?.count || 0
        };
        
        // Compute real counts
        const real = {};
        for (const key of Object.keys(total)) {
            real[key] = total[key] - demo[key];
        }
        
        const stats = {
            total,
            demo,
            real,
            totalRecords: Object.values(total).reduce((a, b) => a + b, 0),
            demoRecords: Object.values(demo).reduce((a, b) => a + b, 0),
            realRecords: Object.values(real).reduce((a, b) => a + b, 0)
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

// Clear demo data only (WHERE is_demo = 1)
router.post('/clear', authenticateToken, async (req, res) => {
    try {
        const { clearAll } = req.body; // If true, clear everything; otherwise only demo data
        
        // Create backup first
        triggerAutoBackup('DEMO_DATA_CLEAR', req.user.userId, clearAll ? 'Before clearing ALL data' : 'Before clearing demo data');
        
        const tablesToClear = [
            'campaign_recipients', 'campaigns', 'messages', 'time_entries', 
            'tasks', 'projects', 'contact_submissions', 'activity_log', 
            'email_templates', 'segments', 'clients', 'users'
        ];
        
        let clearedCount = 0;
        for (const table of tablesToClear) {
            if (clearAll) {
                // Clear everything except admin users
                if (table === 'users') {
                    const result = execute(`DELETE FROM ${table} WHERE role != 'admin'`);
                    clearedCount += result.changes || 0;
                } else {
                    const result = execute(`DELETE FROM ${table}`);
                    clearedCount += result.changes || 0;
                }
            } else {
                // Only clear demo data
                const result = execute(`DELETE FROM ${table} WHERE is_demo = 1`);
                clearedCount += result.changes || 0;
            }
        }
        
        const action = clearAll ? 'ALL_DATA_CLEARED' : 'DEMO_DATA_CLEARED';
        logActivity(req.user.userId, action, null, null, `Cleared ${clearedCount} records`);
        
        res.json({ 
            success: true, 
            message: clearAll ? 'All data cleared successfully' : 'Demo data cleared successfully',
            clearedCount
        });
    } catch (error) {
        console.error('Clear demo data error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear data: ' + error.message });
    }
});

export default router;
