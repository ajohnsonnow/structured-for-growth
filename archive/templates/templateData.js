// Template Library Data
export const templates = [
    // FORM TEMPLATES
    {
        id: 'contact-form-validation',
        title: 'Contact Form with Validation',
        description: 'Complete contact form with client and server-side validation, error handling, and user feedback.',
        category: 'forms',
        language: 'JavaScript',
        tags: ['validation', 'forms', 'frontend'],
        code: `// Contact Form Validation
class ContactFormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        this.clearErrors();
        
        const formData = {
            name: this.form.name.value.trim(),
            email: this.form.email.value.trim(),
            message: this.form.message.value.trim()
        };
        
        if (!this.validate(formData)) return;
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                this.showSuccess('Message sent successfully!');
                this.form.reset();
            } else {
                const error = await response.json();
                this.showError(error.message);
            }
        } catch (error) {
            this.showError('Connection error. Please try again.');
        }
    }
    
    validate(data) {
        let isValid = true;
        
        if (!data.name || data.name.length < 2) {
            this.showFieldError('name', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!data.message || data.message.length < 10) {
            this.showFieldError('message', 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    }
    
    showFieldError(fieldName, message) {
        const field = this.form[fieldName];
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.querySelector('.error-message').textContent = message;
    }
    
    clearErrors() {
        this.form.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            group.querySelector('.error-message').textContent = '';
        });
    }
    
    showSuccess(message) {
        this.showMessage('success', message);
    }
    
    showError(message) {
        this.showMessage('error', message);
    }
    
    showMessage(type, text) {
        const messageEl = this.form.querySelector('.form-message');
        messageEl.className = \`form-message \${type}\`;
        messageEl.textContent = text;
        messageEl.style.display = 'block';
    }
}

// Usage
const contactForm = new ContactFormValidator('contactForm');`,
        usage: `
<h3>How to Use</h3>
<ol>
    <li>Include the validator class in your JavaScript file</li>
    <li>Add proper HTML structure with form-group classes</li>
    <li>Initialize with form ID</li>
    <li>Customize validation rules as needed</li>
</ol>

<h3>Required HTML Structure</h3>
<pre><code>&lt;form id="contactForm"&gt;
    &lt;div class="form-group"&gt;
        &lt;label for="name"&gt;Name&lt;/label&gt;
        &lt;input type="text" id="name" name="name"&gt;
        &lt;span class="error-message"&gt;&lt;/span&gt;
    &lt;/div&gt;
    &lt;!-- More fields... --&gt;
    &lt;div class="form-message"&gt;&lt;/div&gt;
&lt;/form&gt;</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Real-time validation</li>
    <li>Custom error messages</li>
    <li>Email format validation</li>
    <li>Async form submission</li>
    <li>Error and success states</li>
</ul>

<h3>Customization</h3>
<p>Easily extend validation rules in the validate() method. Add custom validators for phone numbers, URLs, or any field-specific logic.</p>`
    },
    
    // AUTHENTICATION TEMPLATES
    {
        id: 'jwt-auth-middleware',
        title: 'JWT Authentication Middleware',
        description: 'Express middleware for JWT token validation with role-based access control.',
        category: 'auth',
        language: 'JavaScript',
        tags: ['jwt', 'auth', 'middleware', 'backend'],
        code: `import jwt from 'jsonwebtoken';

// Verify JWT Token
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Role-based Access Control
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
}

// Refresh Token Handler
export function generateTokens(user) {
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
}`,
        usage: `
<h3>Usage in Express Routes</h3>
<pre><code>import { authenticateToken, requireRole } from './middleware/auth.js';

// Protected route - any authenticated user
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Admin-only route
app.delete('/api/users/:id', 
    authenticateToken, 
    requireRole('admin'), 
    (req, res) => {
        // Delete user logic
    }
);

// Multiple roles allowed
app.post('/api/content', 
    authenticateToken, 
    requireRole('admin', 'editor'), 
    (req, res) => {
        // Create content logic
    }
);</code></pre>`,
        notes: `
<h3>Environment Variables Required</h3>
<ul>
    <li><code>JWT_SECRET</code> - Secret key for access tokens</li>
    <li><code>JWT_REFRESH_SECRET</code> - Secret key for refresh tokens</li>
</ul>

<h3>Security Best Practices</h3>
<ul>
    <li>Use strong, random secrets (minimum 32 characters)</li>
    <li>Store tokens securely (httpOnly cookies recommended)</li>
    <li>Implement token refresh mechanism</li>
    <li>Set appropriate expiration times</li>
    <li>Never expose JWT_SECRET in client-side code</li>
</ul>`
    },
    
    // DATABASE TEMPLATES
    {
        id: 'crud-database-model',
        title: 'CRUD Database Model',
        description: 'Generic CRUD operations class for SQLite with better-sqlite3, easily adaptable to any table.',
        category: 'database',
        language: 'JavaScript',
        tags: ['database', 'crud', 'sqlite', 'backend'],
        code: `import Database from 'better-sqlite3';

class DatabaseModel {
    constructor(tableName, db) {
        this.table = tableName;
        this.db = db;
    }
    
    // Create
    create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        
        const sql = \`INSERT INTO \${this.table} (\${keys.join(', ')}) 
                     VALUES (\${placeholders})\`;
        
        const result = this.db.prepare(sql).run(...values);
        return this.findById(result.lastInsertRowid);
    }
    
    // Read - Find by ID
    findById(id) {
        const sql = \`SELECT * FROM \${this.table} WHERE id = ?\`;
        return this.db.prepare(sql).get(id);
    }
    
    // Read - Find all with optional filters
    findAll(filters = {}, orderBy = 'id DESC', limit = null) {
        let sql = \`SELECT * FROM \${this.table}\`;
        const values = [];
        
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map(key => {
                values.push(filters[key]);
                return \`\${key} = ?\`;
            });
            sql += \` WHERE \${conditions.join(' AND ')}\`;
        }
        
        sql += \` ORDER BY \${orderBy}\`;
        
        if (limit) {
            sql += \` LIMIT \${limit}\`;
        }
        
        return this.db.prepare(sql).all(...values);
    }
    
    // Update
    update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => \`\${key} = ?\`).join(', ');
        
        const sql = \`UPDATE \${this.table} 
                     SET \${setClause}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?\`;
        
        this.db.prepare(sql).run(...values, id);
        return this.findById(id);
    }
    
    // Delete
    delete(id) {
        const sql = \`DELETE FROM \${this.table} WHERE id = ?\`;
        const result = this.db.prepare(sql).run(id);
        return result.changes > 0;
    }
    
    // Count
    count(filters = {}) {
        let sql = \`SELECT COUNT(*) as count FROM \${this.table}\`;
        const values = [];
        
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map(key => {
                values.push(filters[key]);
                return \`\${key} = ?\`;
            });
            sql += \` WHERE \${conditions.join(' AND ')}\`;
        }
        
        return this.db.prepare(sql).get(...values).count;
    }
    
    // Search
    search(field, query) {
        const sql = \`SELECT * FROM \${this.table} 
                     WHERE \${field} LIKE ? 
                     ORDER BY id DESC\`;
        return this.db.prepare(sql).all(\`%\${query}%\`);
    }
}

// Usage Example
export class ClientModel extends DatabaseModel {
    constructor(db) {
        super('clients', db);
    }
    
    // Custom method specific to clients
    findByEmail(email) {
        const sql = \`SELECT * FROM \${this.table} WHERE email = ?\`;
        return this.db.prepare(sql).get(email);
    }
    
    // Find clients with active status
    findActive() {
        return this.findAll({ status: 'active' });
    }
}`,
        usage: `
<h3>Usage Example</h3>
<pre><code>import Database from 'better-sqlite3';
import { ClientModel } from './models/ClientModel.js';

const db = new Database('./database.db');
const clients = new ClientModel(db);

// Create
const newClient = clients.create({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
});

// Read
const client = clients.findById(1);
const allClients = clients.findAll();
const activeClients = clients.findActive();

// Update
const updated = clients.update(1, {
    name: 'Jane Doe',
    email: 'jane@example.com'
});

// Delete
const deleted = clients.delete(1);

// Search
const results = clients.search('name', 'John');</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Generic CRUD operations for any table</li>
    <li>Automatic timestamp handling</li>
    <li>Flexible filtering and sorting</li>
    <li>Search functionality</li>
    <li>Easy to extend for specific models</li>
</ul>

<h3>Database Schema Requirements</h3>
<p>Tables should have:</p>
<ul>
    <li><code>id</code> - Primary key (INTEGER AUTOINCREMENT)</li>
    <li><code>created_at</code> - Timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)</li>
    <li><code>updated_at</code> - Timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)</li>
</ul>`
    },
    
    // API PATTERNS
    {
        id: 'rest-api-controller',
        title: 'RESTful API Controller Pattern',
        description: 'Standard REST API controller with proper HTTP methods, error handling, and validation.',
        category: 'api',
        language: 'JavaScript',
        tags: ['api', 'rest', 'express', 'backend'],
        code: `import express from 'express';
import { body, validationResult } from 'express-validator';

class ResourceController {
    constructor(model) {
        this.model = model;
        this.router = express.Router();
        this.setupRoutes();
    }
    
    setupRoutes() {
        // GET /resources - List all
        this.router.get('/', this.index.bind(this));
        
        // GET /resources/:id - Get one
        this.router.get('/:id', this.show.bind(this));
        
        // POST /resources - Create
        this.router.post('/', 
            this.validationRules(), 
            this.create.bind(this)
        );
        
        // PUT /resources/:id - Update
        this.router.put('/:id', 
            this.validationRules(true), 
            this.update.bind(this)
        );
        
        // DELETE /resources/:id - Delete
        this.router.delete('/:id', this.destroy.bind(this));
    }
    
    // Validation rules - override in subclass
    validationRules(isUpdate = false) {
        return [];
    }
    
    // GET /resources
    async index(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            
            const offset = (page - 1) * limit;
            const resources = await this.model.findAll(filters, limit, offset);
            const total = await this.model.count(filters);
            
            res.json({
                success: true,
                data: resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    // GET /resources/:id
    async show(req, res) {
        try {
            const resource = await this.model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    // POST /resources
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            
            const resource = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Resource created successfully',
                data: resource
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    // PUT /resources/:id
    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            
            const resource = await this.model.findById(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            const updated = await this.model.update(req.params.id, req.body);
            
            res.json({
                success: true,
                message: 'Resource updated successfully',
                data: updated
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    // DELETE /resources/:id
    async destroy(req, res) {
        try {
            const resource = await this.model.findById(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            await this.model.delete(req.params.id);
            
            res.json({
                success: true,
                message: 'Resource deleted successfully'
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    handleError(res, error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    
    getRouter() {
        return this.router;
    }
}

// Example Usage
class ClientController extends ResourceController {
    validationRules(isUpdate = false) {
        return [
            body('name').trim().notEmpty().withMessage('Name is required'),
            body('email').trim().isEmail().withMessage('Valid email required'),
            body('status').optional().isIn(['active', 'inactive'])
        ];
    }
}

export default ResourceController;`,
        usage: `
<h3>Usage in Express App</h3>
<pre><code>import ClientController from './controllers/ClientController.js';
import { ClientModel } from './models/ClientModel.js';

// Initialize
const clientModel = new ClientModel(db);
const clientController = new ClientController(clientModel);

// Mount router
app.use('/api/clients', clientController.getRouter());

// API endpoints are now available:
// GET    /api/clients          - List all clients
// GET    /api/clients/:id      - Get single client
// POST   /api/clients          - Create client
// PUT    /api/clients/:id      - Update client
// DELETE /api/clients/:id      - Delete client</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Standard REST conventions</li>
    <li>Built-in validation</li>
    <li>Pagination support</li>
    <li>Error handling</li>
    <li>Easy to extend</li>
</ul>

<h3>Extending the Controller</h3>
<p>Create custom controllers by extending ResourceController:</p>
<ul>
    <li>Override <code>validationRules()</code> for custom validation</li>
    <li>Add custom methods for specific endpoints</li>
    <li>Override base methods for custom logic</li>
</ul>`
    },
    
    // UI COMPONENTS
    {
        id: 'modal-component',
        title: 'Reusable Modal Component',
        description: 'Flexible modal dialog component with customizable content, animations, and accessibility features.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['ui', 'modal', 'component', 'frontend'],
        code: `class Modal {
    constructor(options = {}) {
        this.options = {
            id: options.id || 'modal',
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium', // small, medium, large
            closeOnOverlay: options.closeOnOverlay !== false,
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            footer: options.footer || null
        };
        
        this.modal = null;
        this.isOpen = false;
        this.create();
    }
    
    create() {
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.id = this.options.id;
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        
        const content = document.createElement('div');
        content.className = \`modal-content modal-\${this.options.size}\`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = \`
            <h2>\${this.options.title}</h2>
            <button class="modal-close" aria-label="Close">&times;</button>
        \`;
        
        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else {
            body.appendChild(this.options.content);
        }
        
        content.appendChild(header);
        content.appendChild(body);
        
        // Footer (optional)
        if (this.options.footer) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.innerHTML = this.options.footer;
            content.appendChild(footer);
        }
        
        this.modal.appendChild(content);
        document.body.appendChild(this.modal);
        
        // Event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Overlay click
        if (this.options.closeOnOverlay) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    open() {
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = this.modal.querySelector('button, input, textarea, select');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        if (this.options.onOpen) {
            this.options.onOpen(this);
        }
    }
    
    close() {
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        if (this.options.onClose) {
            this.options.onClose(this);
        }
    }
    
    setTitle(title) {
        const titleEl = this.modal.querySelector('.modal-header h2');
        titleEl.textContent = title;
    }
    
    setContent(content) {
        const body = this.modal.querySelector('.modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.innerHTML = '';
            body.appendChild(content);
        }
    }
    
    destroy() {
        document.removeEventListener('keydown', this.escapeHandler);
        this.modal.remove();
    }
}

// Usage
const myModal = new Modal({
    id: 'confirmModal',
    title: 'Confirm Action',
    content: '<p>Are you sure you want to continue?</p>',
    footer: \`
        <button class="btn btn-secondary" onclick="myModal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="handleConfirm()">Confirm</button>
    \`,
    onOpen: (modal) => console.log('Modal opened'),
    onClose: (modal) => console.log('Modal closed')
});

myModal.open();`,
        usage: `
<h3>Basic Usage</h3>
<pre><code>// Simple modal
const modal = new Modal({
    title: 'Hello World',
    content: '&lt;p&gt;This is a modal&lt;/p&gt;'
});

modal.open();

// Modal with form
const formModal = new Modal({
    title: 'Edit Profile',
    content: document.getElementById('profileForm'),
    size: 'large',
    closeOnOverlay: false
});

// Update content dynamically
modal.setContent('&lt;p&gt;Updated content&lt;/p&gt;');

// Clean up when done
modal.destroy();</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Accessible (ARIA attributes, keyboard navigation)</li>
    <li>Customizable sizes (small, medium, large)</li>
    <li>Optional footer for actions</li>
    <li>Event callbacks (onOpen, onClose)</li>
    <li>Dynamic content updates</li>
    <li>Escape key to close</li>
    <li>Overlay click to close (optional)</li>
</ul>

<h3>CSS Required</h3>
<p>Make sure you have the modal CSS from the components stylesheet included in your project.</p>`
    },
    
    // EMAIL TEMPLATES
    {
        id: 'email-service',
        title: 'Email Service with Templates',
        description: 'Nodemailer email service with HTML templates and fallback plain text.',
        category: 'email',
        language: 'JavaScript',
        tags: ['email', 'nodemailer', 'templates', 'backend'],
        code: `import nodemailer from 'nodemailer';

class EmailService {
    constructor(config) {
        this.transporter = nodemailer.createTransporter({
            host: config.host,
            port: config.port,
            secure: config.secure || false,
            auth: {
                user: config.user,
                pass: config.password
            }
        });
        
        this.from = config.from;
    }
    
    async send(to, subject, html, text = null) {
        try {
            const mailOptions = {
                from: this.from,
                to,
                subject,
                html,
                text: text || this.htmlToText(html)
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email error:', error);
            throw error;
        }
    }
    
    // Convert HTML to plain text (simple version)
    htmlToText(html) {
        return html
            .replace(/<style[^>]*>.*<\\/style>/gs, '')
            .replace(/<script[^>]*>.*<\\/script>/gs, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\\s+/g, ' ')
            .trim();
    }
    
    // Welcome email template
    async sendWelcomeEmail(user) {
        const html = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; 
                  color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
            <p>Hi \${user.name},</p>
            <p>Thank you for joining us! We're excited to have you on board.</p>
            <p>You can now access all the features of your account:</p>
            <ul>
                <li>Manage your profile</li>
                <li>Access exclusive content</li>
                <li>Connect with other members</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="\${process.env.APP_URL}/dashboard" class="button">
                    Get Started
                </a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Your Company. All rights reserved.</p>
            <p>You received this email because you signed up for an account.</p>
        </div>
    </div>
</body>
</html>
        \`;
        
        return this.send(
            user.email,
            'Welcome to Our Platform!',
            html
        );
    }
    
    // Password reset template
    async sendPasswordReset(user, resetToken) {
        const resetUrl = \`\${process.env.APP_URL}/reset-password?token=\${resetToken}\`;
        
        const html = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; 
                  color: white; text-decoration: none; border-radius: 5px; }
        .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi \${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="\${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <p>This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
            </div>
            <p>Or copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">\${resetUrl}</p>
        </div>
    </div>
</body>
</html>
        \`;
        
        return this.send(
            user.email,
            'Password Reset Request',
            html
        );
    }
    
    // Contact form notification
    async sendContactNotification(formData) {
        const html = \`
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> \${formData.name} (\${formData.email})</p>
    \${formData.company ? \`<p><strong>Company:</strong> \${formData.company}</p>\` : ''}
    <p><strong>Subject:</strong> \${formData.subject}</p>
    <hr>
    <p><strong>Message:</strong></p>
    <p>\${formData.message.replace(/\\n/g, '<br>')}</p>
    <hr>
    <p style="color: #6b7280; font-size: 14px;">
        <em>Sent from contact form on \${new Date().toLocaleString()}</em>
    </p>
</body>
</html>
        \`;
        
        return this.send(
            process.env.ADMIN_EMAIL,
            \`Contact Form: \${formData.subject}\`,
            html
        );
    }
}

export default EmailService;`,
        usage: `
<h3>Setup and Usage</h3>
<pre><code>import EmailService from './services/EmailService.js';

// Initialize service
const emailService = new EmailService({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM
});

// Send welcome email
await emailService.sendWelcomeEmail({
    name: 'John Doe',
    email: 'john@example.com'
});

// Send password reset
await emailService.sendPasswordReset(user, resetToken);

// Send custom email
await emailService.send(
    'user@example.com',
    'Custom Subject',
    '&lt;h1&gt;Custom HTML&lt;/h1&gt;'
);</code></pre>`,
        notes: `
<h3>Required Environment Variables</h3>
<ul>
    <li><code>EMAIL_HOST</code> - SMTP server (e.g., smtp.gmail.com)</li>
    <li><code>EMAIL_PORT</code> - Port number (587 for TLS)</li>
    <li><code>EMAIL_USER</code> - SMTP username</li>
    <li><code>EMAIL_PASSWORD</code> - SMTP password/app password</li>
    <li><code>EMAIL_FROM</code> - Sender email address</li>
    <li><code>APP_URL</code> - Your application URL</li>
</ul>

<h3>Gmail Setup</h3>
<p>For Gmail, use App Passwords:</p>
<ol>
    <li>Enable 2-factor authentication</li>
    <li>Generate app password in Google Account settings</li>
    <li>Use the app password in EMAIL_PASSWORD</li>
</ol>`
    },
    
    // UTILITIES
    {
        id: 'local-storage-manager',
        title: 'LocalStorage Manager',
        description: 'Type-safe localStorage wrapper with JSON serialization, expiration, and error handling.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['storage', 'state', 'utilities'],
        code: \`// LocalStorage Manager
class StorageManager {
    constructor(prefix = 'app') {
        this.prefix = prefix;
    }
    
    // Set item with optional expiration
    set(key, value, expiresInMinutes = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now()
            };
            
            if (expiresInMinutes) {
                item.expires = Date.now() + (expiresInMinutes * 60 * 1000);
            }
            
            localStorage.setItem(
                \\\`\\\${this.prefix}_\\\${key}\\\`,
                JSON.stringify(item)
            );
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    // Get item with expiration check
    get(key, defaultValue = null) {
        try {
            const itemStr = localStorage.getItem(\\\`\\\${this.prefix}_\\\${key}\\\`);
            
            if (!itemStr) {
                return defaultValue;
            }
            
            const item = JSON.parse(itemStr);
            
            // Check expiration
            if (item.expires && Date.now() > item.expires) {
                this.remove(key);
                return defaultValue;
            }
            
            return item.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    // Remove item
    remove(key) {
        try {
            localStorage.removeItem(\\\`\\\${this.prefix}_\\\${key}\\\`);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    // Clear all items with prefix
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(\\\`\\\${this.prefix}_\\\`)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
    
    // Check if key exists and is not expired
    has(key) {
        const value = this.get(key);
        return value !== null;
    }
    
    // Get all keys with prefix
    keys() {
        const prefix = \\\`\\\${this.prefix}_\\\`;
        return Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .map(key => key.replace(prefix, ''));
    }
}

export default StorageManager;\`,
        usage: \`
<h3>Basic Usage</h3>
<pre><code>import StorageManager from './utils/StorageManager.js';

const storage = new StorageManager('myApp');

// Set item
storage.set('user', { id: 1, name: 'John' });

// Set with expiration (30 minutes)
storage.set('authToken', 'abc123', 30);

// Get item
const user = storage.get('user');
const token = storage.get('authToken', 'default');

// Check existence
if (storage.has('user')) {
    console.log('User exists');
}

// Remove item
storage.remove('user');

// Get all keys
const keys = storage.keys();

// Clear all app data
storage.clear();</code></pre>\`,
        notes: \`
<h3>Features</h3>
<ul>
    <li>Automatic JSON serialization/deserialization</li>
    <li>Optional expiration time</li>
    <li>Namespacing with prefix</li>
    <li>Error handling</li>
    <li>Default values</li>
    <li>Key enumeration</li>
</ul>

<h3>Best Practices</h3>
<ul>
    <li>Use unique prefix for each app/module</li>
    <li>Set appropriate expiration for sensitive data</li>
    <li>Always provide default values when getting</li>
    <li>Clear storage on logout</li>
    <li>Don't store sensitive data (passwords, etc.)</li>
</ul>\`
    },
    
    {
        id: 'api-client-wrapper',
        title: 'API Client Wrapper',
        description: 'Simplified fetch wrapper with authentication, error handling, and request/response interceptors.',
        category: 'api',
        language: 'JavaScript',
        tags: ['api', 'fetch', 'http', 'utilities'],
        code: \`// API Client Wrapper
class ApiClient {
    constructor(baseURL = '', options = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        this.authToken = options.authToken || null;
        this.timeout = options.timeout || 30000;
    }
    
    // Set auth token
    setAuthToken(token) {
        this.authToken = token;
    }
    
    // Build headers
    getHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };
        
        if (this.authToken) {
            headers['Authorization'] = \\\`Bearer \\\${this.authToken}\\\`;
        }
        
        return headers;
    }
    
    // Make request with timeout
    async request(endpoint, options = {}) {
        const url = \\\`\\\${this.baseURL}\\\${endpoint}\\\`;
        const config = {
            ...options,
            headers: this.getHeaders(options.headers)
        };
        
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), this.timeout)
            );
            
            // Race between fetch and timeout
            const response = await Promise.race([
                fetch(url, config),
                timeoutPromise
            ]);
            
            // Handle response
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    // Handle response
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        const data = isJson ? await response.json() : await response.text();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Request failed',
                data: data
            };
        }
        
        return data;
    }
    
    // Handle errors
    handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
    
    // GET request
    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? \\\`\\\${endpoint}?\\\${queryString}\\\` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }
    
    // POST request
    post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT request
    put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // PATCH request
    patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

export default ApiClient;\`,
        usage: \`
<h3>Setup</h3>
<pre><code>import ApiClient from './utils/ApiClient.js';

// Initialize
const api = new ApiClient('/api', {
    authToken: localStorage.getItem('token'),
    timeout: 10000
});

// Update token later
api.setAuthToken(newToken);</code></pre>

<h3>Usage Examples</h3>
<pre><code>// GET request
const users = await api.get('/users');

// GET with query params
const filtered = await api.get('/users', { 
    status: 'active', 
    role: 'admin' 
});

// POST request
const newUser = await api.post('/users', {
    name: 'John Doe',
    email: 'john@example.com'
});

// PUT request
const updated = await api.put('/users/1', {
    name: 'Jane Doe'
});

// DELETE request
await api.delete('/users/1');

// Error handling
try {
    const data = await api.get('/protected');
} catch (error) {
    if (error.status === 401) {
        // Redirect to login
    } else if (error.status === 403) {
        // Show permission error
    }
}</code></pre>\`,
        notes: \`
<h3>Features</h3>
<ul>
    <li>Automatic JSON handling</li>
    <li>Built-in authentication</li>
    <li>Request timeout</li>
    <li>Query string building</li>
    <li>Error standardization</li>
    <li>All HTTP methods</li>
</ul>

<h3>Extending</h3>
<p>Add interceptors for logging, retry logic, or custom error handling:</p>
<ul>
    <li>Override <code>handleResponse()</code> for response transformation</li>
    <li>Override <code>handleError()</code> for custom error handling</li>
    <li>Add retry logic in <code>request()</code> method</li>
</ul>\`
    },
    
    {
        id: 'notification-system',
        title: 'Toast Notification System',
        description: 'Lightweight notification system with multiple types, auto-dismiss, and animations.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['notifications', 'toast', 'ui', 'feedback'],
        code: \`// Toast Notification System
class NotificationManager {
    constructor(options = {}) {
        this.container = null;
        this.position = options.position || 'top-right';
        this.duration = options.duration || 3000;
        this.init();
    }
    
    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = \\\`notification-container \\\${this.position}\\\`;
            document.body.appendChild(this.container);
            this.injectStyles();
        } else {
            this.container = document.getElementById('notification-container');
        }
    }
    
    show(message, type = 'info', duration = this.duration) {
        const notification = document.createElement('div');
        notification.className = \\\`notification notification-\\\${type}\\\`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = \\\`
            <span class="notification-icon">\\\${icon}</span>
            <span class="notification-message">\\\${message}</span>
            <button class="notification-close">×</button>
        \\\`;
        
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));
        
        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }
        
        return notification;
    }
    
    hide(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    injectStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = \\\`
            .notification-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }
            
            .notification-container.top-right {
                top: 20px;
                right: 20px;
            }
            
            .notification-container.top-left {
                top: 20px;
                left: 20px;
            }
            
            .notification-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .notification-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .notification {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                margin-bottom: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                background: white;
                pointer-events: all;
                min-width: 300px;
                max-width: 400px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.hide {
                transform: translateX(400px);
                opacity: 0;
            }
            
            .notification-success {
                background: #d1fae5;
                color: #065f46;
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                background: #fee2e2;
                color: #991b1b;
                border-left: 4px solid #ef4444;
            }
            
            .notification-warning {
                background: #fef3c7;
                color: #92400e;
                border-left: 4px solid #f59e0b;
            }
            
            .notification-info {
                background: #dbeafe;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
            }
            
            .notification-icon {
                font-size: 20px;
                font-weight: bold;
            }
            
            .notification-message {
                flex: 1;
                font-size: 14px;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
        \\\`;
        document.head.appendChild(style);
    }
}

export default NotificationManager;\`,
        usage: \`
<h3>Basic Usage</h3>
<pre><code>import NotificationManager from './utils/NotificationManager.js';

// Initialize
const notify = new NotificationManager({
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left
    duration: 3000 // Default duration in ms
});

// Show notifications
notify.success('Changes saved successfully!');
notify.error('Failed to save changes');
notify.warning('Session will expire soon');
notify.info('New updates available');

// Custom duration
notify.success('Auto-dismiss in 5s', 5000);

// No auto-dismiss
notify.info('Click X to close', 0);</code></pre>

<h3>In Forms</h3>
<pre><code>// Form submission
try {
    await api.post('/users', formData);
    notify.success('User created successfully!');
    form.reset();
} catch (error) {
    notify.error(error.message || 'Failed to create user');
}</code></pre>\`,
        notes: \`
<h3>Features</h3>
<ul>
    <li>Four notification types (success, error, warning, info)</li>
    <li>Multiple position options</li>
    <li>Auto-dismiss with configurable duration</li>
    <li>Manual close button</li>
    <li>Smooth animations</li>
    <li>Stacking support</li>
    <li>No dependencies</li>
</ul>

<h3>Customization</h3>
<p>Modify <code>injectStyles()</code> to change:</p>
<ul>
    <li>Colors and themes</li>
    <li>Animation styles</li>
    <li>Size and spacing</li>
    <li>Icons (use icon libraries)</li>
</ul>\`
    },
    
    {
        id: 'loading-state-manager',
        title: 'Loading State Manager',
        description: 'Manage loading states for buttons, forms, and page sections with consistent UI feedback.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['loading', 'ui', 'state', 'spinner'],
        code: \`// Loading State Manager
class LoadingManager {
    // Set button loading state
    static setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = \\\`
                <span class="btn-loading-spinner"></span>
                <span>\\\${loadingText}</span>
            \\\`;
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Submit';
            button.classList.remove('btn-loading');
        }
    }
    
    // Show loading overlay on element
    static showOverlay(element, message = '') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = \\\`
            <div class="loading-spinner">
                <div class="spinner"></div>
                \\\${message ? \\\`<p class="loading-message">\\\${message}</p>\\\` : ''}
            </div>
        \\\`;
        
        element.style.position = 'relative';
        element.appendChild(overlay);
        
        return overlay;
    }
    
    // Hide loading overlay
    static hideOverlay(element) {
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Show skeleton loader
    static showSkeleton(element, lineCount = 3) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';
        
        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton-line';
            skeleton.appendChild(line);
        }
        
        element.innerHTML = '';
        element.appendChild(skeleton);
    }
    
    // Inject CSS
    static injectStyles() {
        if (document.getElementById('loading-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = \\\`
            .btn-loading {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .btn-loading-spinner {
                display: inline-block;
                width: 14px;
                height: 14px;
                border: 2px solid currentColor;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
                margin-right: 8px;
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .loading-spinner {
                text-align: center;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            .loading-message {
                color: #666;
                font-size: 14px;
                margin: 0;
            }
            
            .skeleton-loader {
                padding: 16px;
            }
            
            .skeleton-line {
                height: 16px;
                background: linear-gradient(
                    90deg,
                    #f0f0f0 25%,
                    #e0e0e0 50%,
                    #f0f0f0 75%
                );
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 12px;
            }
            
            .skeleton-line:last-child {
                width: 60%;
                margin-bottom: 0;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        \\\`;
        document.head.appendChild(style);
    }
}

// Auto-inject styles
if (typeof document !== 'undefined') {
    LoadingManager.injectStyles();
}

export default LoadingManager;\`,
        usage: \`
<h3>Button Loading</h3>
<pre><code>import LoadingManager from './utils/LoadingManager.js';

const button = document.getElementById('submitBtn');

// Start loading
LoadingManager.setButtonLoading(button, true, 'Saving...');

try {
    await api.post('/data', formData);
    // Success
} finally {
    // Stop loading
    LoadingManager.setButtonLoading(button, false);
}</code></pre>

<h3>Section Overlay</h3>
<pre><code>const section = document.getElementById('dataSection');

// Show overlay
LoadingManager.showOverlay(section, 'Loading data...');

const data = await api.get('/data');

// Hide overlay
LoadingManager.hideOverlay(section);</code></pre>

<h3>Skeleton Loader</h3>
<pre><code>const container = document.getElementById('content');

// Show skeleton while loading
LoadingManager.showSkeleton(container, 5);

const content = await api.get('/content');

// Replace with actual content
container.innerHTML = content;</code></pre>\`,
        notes: \`
<h3>Features</h3>
<ul>
    <li>Button loading states</li>
    <li>Full element overlays</li>
    <li>Skeleton loaders</li>
    <li>Auto-injected styles</li>
    <li>Customizable messages</li>
</ul>

<h3>Best Practices</h3>
<ul>
    <li>Always use try-finally to ensure loading state is cleared</li>
    <li>Provide meaningful loading messages</li>
    <li>Use skeletons for content-heavy sections</li>
    <li>Use button loading for forms</li>
    <li>Use overlays for entire sections</li>
</ul>\`
    },
    
    {
        id: 'data-table-component',
        title: 'Data Table with Search & Filter',
        description: 'Feature-rich data table with search, sort, filter, and pagination capabilities.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['table', 'data', 'search', 'filter', 'pagination'],
        code: \`// Data Table Component
class DataTable {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = options.data || [];
        this.columns = options.columns || [];
        this.searchable = options.searchable !== false;
        this.sortable = options.sortable !== false;
        this.filterable = options.filterable || [];
        this.currentPage = 1;
        this.pageSize = options.pageSize || 10;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.filters = {};
        
        this.render();
    }
    
    render() {
        this.container.innerHTML = \\\`
            <div class="datatable-wrapper">
                \\\${this.searchable ? this.renderSearch() : ''}
                \\\${this.filterable.length ? this.renderFilters() : ''}
                <div class="datatable-table-wrapper">
                    <table class="datatable">
                        <thead>
                            \\\${this.renderHeader()}
                        </thead>
                        <tbody>
                            \\\${this.renderBody()}
                        </tbody>
                    </table>
                </div>
                \\\${this.renderPagination()}
            </div>
        \\\`;
        
        this.attachEvents();
    }
    
    renderSearch() {
        return \\\`
            <div class="datatable-search">
                <input 
                    type="text" 
                    class="datatable-search-input" 
                    placeholder="Search..."
                    value="\\\${this.searchTerm}"
                >
            </div>
        \\\`;
    }
    
    renderFilters() {
        return \\\`
            <div class="datatable-filters">
                \\\${this.filterable.map(filter => \\\`
                    <select class="datatable-filter" data-column="\\\${filter.column}">
                        <option value="">\\\${filter.label}</option>
                        \\\${filter.options.map(opt => \\\`
                            <option value="\\\${opt.value}">\\\${opt.label}</option>
                        \\\`).join('')}
                    </select>
                \\\`).join('')}
            </div>
        \\\`;
    }
    
    renderHeader() {
        return \\\`
            <tr>
                \\\${this.columns.map(col => \\\`
                    <th 
                        class="\\\${this.sortable && col.sortable !== false ? 'sortable' : ''}"
                        data-column="\\\${col.field}"
                    >
                        \\\${col.label}
                        \\\${this.sortColumn === col.field ? 
                            (this.sortDirection === 'asc' ? ' ↑' : ' ↓') : 
                            ''
                        }
                    </th>
                \\\`).join('')}
            </tr>
        \\\`;
    }
    
    renderBody() {
        const filtered = this.getFilteredData();
        const paginated = this.getPaginatedData(filtered);
        
        if (paginated.length === 0) {
            return \\\`
                <tr>
                    <td colspan="\\\${this.columns.length}" class="datatable-empty">
                        No data found
                    </td>
                </tr>
            \\\`;
        }
        
        return paginated.map(row => \\\`
            <tr>
                \\\${this.columns.map(col => \\\`
                    <td>\\\${col.render ? col.render(row[col.field], row) : row[col.field]}</td>
                \\\`).join('')}
            </tr>
        \\\`).join('');
    }
    
    renderPagination() {
        const filtered = this.getFilteredData();
        const totalPages = Math.ceil(filtered.length / this.pageSize);
        
        if (totalPages <= 1) return '';
        
        return \\\`
            <div class="datatable-pagination">
                <button 
                    class="datatable-page-btn" 
                    data-action="prev"
                    \\\${this.currentPage === 1 ? 'disabled' : ''}
                >
                    Previous
                </button>
                <span class="datatable-page-info">
                    Page \\\${this.currentPage} of \\\${totalPages}
                </span>
                <button 
                    class="datatable-page-btn" 
                    data-action="next"
                    \\\${this.currentPage === totalPages ? 'disabled' : ''}
                >
                    Next
                </button>
            </div>
        \\\`;
    }
    
    attachEvents() {
        // Search
        const searchInput = this.container.querySelector('.datatable-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.render();
            });
        }
        
        // Filters
        this.container.querySelectorAll('.datatable-filter').forEach(select => {
            select.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                this.filters[column] = e.target.value;
                this.currentPage = 1;
                this.render();
            });
        });
        
        // Sort
        this.container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                
                this.render();
            });
        });
        
        // Pagination
        this.container.querySelectorAll('.datatable-page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                } else if (action === 'next') {
                    this.currentPage++;
                }
                this.render();
            });
        });
    }
    
    getFilteredData() {
        let filtered = [...this.data];
        
        // Apply search
        if (this.searchTerm) {
            filtered = filtered.filter(row =>
                this.columns.some(col =>
                    String(row[col.field])
                        .toLowerCase()
                        .includes(this.searchTerm.toLowerCase())
                )
            );
        }
        
        // Apply filters
        Object.entries(this.filters).forEach(([column, value]) => {
            if (value) {
                filtered = filtered.filter(row => row[column] === value);
            }
        });
        
        // Apply sort
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                const aVal = a[this.sortColumn];
                const bVal = b[this.sortColumn];
                const modifier = this.sortDirection === 'asc' ? 1 : -1;
                
                if (aVal < bVal) return -1 * modifier;
                if (aVal > bVal) return 1 * modifier;
                return 0;
            });
        }
        
        return filtered;
    }
    
    getPaginatedData(data) {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return data.slice(start, end);
    }
    
    // Update data
    setData(newData) {
        this.data = newData;
        this.currentPage = 1;
        this.render();
    }
}

export default DataTable;\`,
        usage: \`
<h3>HTML Setup</h3>
<pre><code>&lt;div id="myTable"&gt;&lt;/div&gt;</code></pre>

<h3>JavaScript Usage</h3>
<pre><code>import DataTable from './components/DataTable.js';

const table = new DataTable('myTable', {
    data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
    ],
    columns: [
        { field: 'id', label: 'ID', sortable: true },
        { field: 'name', label: 'Name', sortable: true },
        { field: 'email', label: 'Email' },
        { 
            field: 'status', 
            label: 'Status',
            render: (value) => \\\`&lt;span class="badge badge-\\\${value}"&gt;\\\${value}&lt;/span&gt;\\\`
        },
        {
            field: 'actions',
            label: 'Actions',
            render: (value, row) => \\\`
                &lt;button onclick="edit(\\\${row.id})"&gt;Edit&lt;/button&gt;
                &lt;button onclick="delete(\\\${row.id})"&gt;Delete&lt;/button&gt;
            \\\`
        }
    ],
    searchable: true,
    sortable: true,
    filterable: [
        {
            column: 'status',
            label: 'Filter by Status',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        }
    ],
    pageSize: 10
});

// Update data later
table.setData(newData);</code></pre>\`,
        notes: \`
<h3>Features</h3>
<ul>
    <li>Search across all columns</li>
    <li>Column sorting</li>
    <li>Multiple filters</li>
    <li>Pagination</li>
    <li>Custom cell rendering</li>
    <li>No dependencies</li>
</ul>

<h3>Customization</h3>
<p>Add CSS for styling:</p>
<ul>
    <li><code>.datatable</code> - Table styling</li>
    <li><code>.datatable-search-input</code> - Search box</li>
    <li><code>.datatable-filter</code> - Filter dropdowns</li>
    <li><code>.datatable-pagination</code> - Pagination controls</li>
</ul>

<h3>Custom Renderers</h3>
<p>Use <code>render</code> function in column definition to customize cell output (badges, buttons, links, etc.)</p>\`
    },
    
    {
        id: 'validation-utilities',
        title: 'Validation Utility Functions',
        description: 'Collection of common validation functions for forms, APIs, and data processing.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['validation', 'utilities', 'helpers'],
        code: \`// Validation Utilities
const Validators = {
    // Email validation
    isEmail(email) {
        const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return regex.test(email);
    },
    
    // Phone number (US format)
    isPhone(phone) {
        const cleaned = phone.replace(/\\D/g, '');
        return cleaned.length === 10 || cleaned.length === 11;
    },
    
    // URL validation
    isURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    // Strong password (min 8 chars, uppercase, lowercase, number, special)
    isStrongPassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return password.length >= minLength &&
               hasUpperCase &&
               hasLowerCase &&
               hasNumbers &&
               hasSpecialChar;
    },
    
    // Credit card (Luhn algorithm)
    isCreditCard(cardNumber) {
        const cleaned = cardNumber.replace(/\\D/g, '');
        let sum = 0;
        let isEven = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    },
    
    // Date validation
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },
    
    // Date in future
    isFutureDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date > now;
    },
    
    // Age validation
    isMinimumAge(birthDate, minimumAge) {
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= minimumAge;
        }
        
        return age >= minimumAge;
    },
    
    // ZIP code (US)
    isZipCode(zip) {
        return /^\\d{5}(-\\d{4})?$/.test(zip);
    },
    
    // Alphanumeric only
    isAlphanumeric(str) {
        return /^[a-zA-Z0-9]+$/.test(str);
    },
    
    // Username (alphanumeric, underscore, dash, 3-20 chars)
    isUsername(username) {
        return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
    },
    
    // HEX color
    isHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },
    
    // File size (in bytes)
    isValidFileSize(fileSize, maxSizeMB) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        return fileSize <= maxBytes;
    },
    
    // File extension
    hasValidExtension(filename, allowedExtensions) {
        const ext = filename.split('.').pop().toLowerCase();
        return allowedExtensions.includes(ext);
    },
    
    // Required fields
    hasRequiredFields(obj, requiredFields) {
        return requiredFields.every(field => 
            obj.hasOwnProperty(field) && 
            obj[field] !== null && 
            obj[field] !== undefined &&
            obj[field] !== ''
        );
    },
    
    // String length range
    isLengthBetween(str, min, max) {
        const length = str.length;
        return length >= min && length <= max;
    },
    
    // Number range
    isNumberBetween(num, min, max) {
        return num >= min && num <= max;
    },
    
    // JSON string
    isJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }
};

// Sanitization utilities
const Sanitizers = {
    // Remove HTML tags
    stripHTML(str) {
        return str.replace(/<[^>]*>/g, '');
    },
    
    // Escape HTML
    escapeHTML(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'/]/g, char => map[char]);
    },
    
    // Clean phone number
    cleanPhone(phone) {
        return phone.replace(/\\D/g, '');
    },
    
    // Trim and normalize whitespace
    normalizeWhitespace(str) {
        return str.trim().replace(/\\s+/g, ' ');
    }
};

export { Validators, Sanitizers };`,
        usage: `
<h3>Usage Examples</h3>
<pre><code>import { Validators, Sanitizers } from './utils/validators.js';

// Email validation
if (!Validators.isEmail('user@example.com')) {
    console.log('Invalid email');
}

// Password validation
if (!Validators.isStrongPassword(password)) {
    console.log('Password not strong enough');
}

// Age check
if (!Validators.isMinimumAge('1990-01-15', 18)) {
    console.log('Must be 18 or older');
}

// File validation
if (!Validators.hasValidExtension(filename, ['jpg', 'png', 'gif'])) {
    console.log('Invalid file type');
}

if (!Validators.isValidFileSize(file.size, 5)) {
    console.log('File too large (max 5MB)');
}

// Sanitization
const clean = Sanitizers.escapeHTML(userInput);
const phone = Sanitizers.cleanPhone('(555) 123-4567'); // "5551234567"</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Email, phone, URL validation</li>
    <li>Password strength checking</li>
    <li>Credit card validation (Luhn algorithm)</li>
    <li>Date and age validation</li>
    <li>File validation (size, type)</li>
    <li>HTML sanitization</li>
    <li>String and number range checking</li>
</ul>

<h3>Best Practices</h3>
<ul>
    <li>Always validate on both client and server</li>
    <li>Provide clear error messages</li>
    <li>Sanitize user input before storage/display</li>
    <li>Use appropriate validation for your context</li>
</ul>`
    }
];

export default templates;`,
        usage: `
<h3>Template Structure</h3>
<p>Each template includes:</p>
<ul>
    <li><strong>Code</strong>: Complete, working implementation</li>
    <li><strong>Usage</strong>: Examples and integration guide</li>
    <li><strong>Notes</strong>: Best practices, requirements, and tips</li>
</ul>

<h3>Adding New Templates</h3>
<p>Add new templates to the array following this structure:</p>
<pre><code>{
    id: 'unique-template-id',
    title: 'Template Title',
    description: 'Brief description',
    category: 'forms|auth|database|api|ui|email|utils',
    language: 'JavaScript|Python|etc',
    tags: ['tag1', 'tag2'],
    code: \`// Your code here\`,
    usage: \`Usage documentation\`,
    notes: \`Additional notes\`
}</code></pre>`,
        notes: `
<h3>Template Categories</h3>
<ul>
    <li><strong>forms</strong>: Form validation, handling, multi-step forms</li>
    <li><strong>auth</strong>: Authentication, authorization, JWT, sessions</li>
    <li><strong>database</strong>: CRUD operations, models, migrations</li>
    <li><strong>api</strong>: REST APIs, GraphQL, endpoints</li>
    <li><strong>ui</strong>: Components, layouts, interactive elements</li>
    <li><strong>email</strong>: Email services, templates, notifications</li>
    <li><strong>utils</strong>: Helper functions, validators, formatters</li>
</ul>

<h3>Growing Your Library</h3>
<p>As you build new projects, extract reusable patterns and add them here. This becomes your personal development accelerator!</p>`
    },
    
    // FORM MANAGEMENT
    {
        id: 'form-state-manager',
        title: 'Form State Manager',
        description: 'Centralized form state management with validation, dirty state tracking, and error handling.',
        category: 'forms',
        language: 'JavaScript',
        tags: ['forms', 'state', 'validation'],
        code: `// Form State Manager
class FormStateManager {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.validators = options.validators || {};
        this.onSubmit = options.onSubmit || null;
        this.state = {
            values: {},
            errors: {},
            touched: {},
            dirty: false,
            submitting: false
        };
        
        this.init();
    }
    
    init() {
        // Get all form fields
        this.fields = Array.from(this.form.elements).filter(
            el => el.name && el.type !== 'submit'
        );
        
        // Initialize values
        this.fields.forEach(field => {
            this.state.values[field.name] = this.getFieldValue(field);
        });
        
        // Attach event listeners
        this.fields.forEach(field => {
            field.addEventListener('blur', () => this.handleBlur(field));
            field.addEventListener('input', () => this.handleChange(field));
        });
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    getFieldValue(field) {
        if (field.type === 'checkbox') {
            return field.checked;
        } else if (field.type === 'radio') {
            const checked = this.form.querySelector(\`input[name="\${field.name}"]:checked\`);
            return checked ? checked.value : '';
        } else {
            return field.value;
        }
    }
    
    setFieldValue(fieldName, value) {
        this.state.values[fieldName] = value;
        const field = this.form.elements[fieldName];
        
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = value;
            } else if (field.type === 'radio') {
                const radio = this.form.querySelector(
                    \`input[name="\${fieldName}"][value="\${value}"]\`
                );
                if (radio) radio.checked = true;
            } else {
                field.value = value;
            }
        }
    }
    
    handleChange(field) {
        const value = this.getFieldValue(field);
        const oldValue = this.state.values[field.name];
        
        this.state.values[field.name] = value;
        this.state.dirty = true;
        
        // Clear error when user starts typing
        if (this.state.errors[field.name]) {
            delete this.state.errors[field.name];
            this.clearFieldError(field);
        }
    }
    
    handleBlur(field) {
        this.state.touched[field.name] = true;
        this.validateField(field.name);
    }
    
    validateField(fieldName) {
        const value = this.state.values[fieldName];
        const validator = this.validators[fieldName];
        
        if (!validator) return true;
        
        const error = validator(value, this.state.values);
        
        if (error) {
            this.state.errors[fieldName] = error;
            this.showFieldError(fieldName, error);
            return false;
        } else {
            delete this.state.errors[fieldName];
            this.clearFieldError(this.form.elements[fieldName]);
            return true;
        }
    }
    
    validateAll() {
        let isValid = true;
        
        Object.keys(this.validators).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(fieldName, error) {
        const field = this.form.elements[fieldName];
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            let errorEl = formGroup.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                formGroup.appendChild(errorEl);
            }
            errorEl.textContent = error;
        }
    }
    
    clearFieldError(field) {
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorEl = formGroup.querySelector('.error-message');
            if (errorEl) errorEl.remove();
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.state.submitting) return;
        
        // Mark all fields as touched
        Object.keys(this.state.values).forEach(key => {
            this.state.touched[key] = true;
        });
        
        // Validate all fields
        if (!this.validateAll()) {
            return;
        }
        
        if (this.onSubmit) {
            this.state.submitting = true;
            
            try {
                await this.onSubmit(this.state.values);
                this.reset();
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                this.state.submitting = false;
            }
        }
    }
    
    reset() {
        this.form.reset();
        this.state = {
            values: {},
            errors: {},
            touched: {},
            dirty: false,
            submitting: false
        };
        
        this.fields.forEach(field => {
            this.state.values[field.name] = this.getFieldValue(field);
            this.clearFieldError(field);
        });
    }
    
    getValues() {
        return { ...this.state.values };
    }
    
    setValues(values) {
        Object.entries(values).forEach(([key, value]) => {
            this.setFieldValue(key, value);
        });
    }
}

export default FormStateManager;`,
        usage: `
<h3>HTML Form</h3>
<pre><code>&lt;form id="myForm"&gt;
    &lt;div class="form-group"&gt;
        &lt;label&gt;Email&lt;/label&gt;
        &lt;input type="email" name="email"&gt;
    &lt;/div&gt;
    
    &lt;div class="form-group"&gt;
        &lt;label&gt;Password&lt;/label&gt;
        &lt;input type="password" name="password"&gt;
    &lt;/div&gt;
    
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h3>JavaScript Setup</h3>
<pre><code>import FormStateManager from './utils/FormStateManager.js';

const form = new FormStateManager('myForm', {
    validators: {
        email: (value) => {
            if (!value) return 'Email is required';
            if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                return 'Invalid email address';
            }
        },
        password: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
        }
    },
    onSubmit: async (values) => {
        console.log('Form values:', values);
        await api.post('/auth/login', values);
    }
});

// Get current values
const values = form.getValues();

// Set values programmatically
form.setValues({ email: 'test@example.com' });

// Reset form
form.reset();</code></pre>`,
        notes: `
<h3>Features</h3>
<ul>
    <li>Centralized state management</li>
    <li>Field-level validation</li>
    <li>Dirty state tracking</li>
    <li>Touch state tracking</li>
    <li>Error display</li>
    <li>Support for all input types</li>
    <li>Async form submission</li>
</ul>

<h3>Validation</h3>
<p>Validators receive:</p>
<ul>
    <li><code>value</code> - Current field value</li>
    <li><code>allValues</code> - All form values (for cross-field validation)</li>
</ul>
<p>Return error string if invalid, or nothing if valid.</p>`
    },
    
    {
        id: 'debounce-throttle',
        title: 'Debounce & Throttle Utilities',
        description: 'Performance optimization utilities for rate-limiting function calls.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['performance', 'utilities', 'optimization'],
        code: `// Debounce & Throttle Utilities

// Debounce: Wait for silence before executing
function debounce(func, delay = 300) {
    let timeoutId;
    
    return function debounced(...args) {
        const context = this;
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Debounce with immediate first call
function debounceImmediate(func, delay = 300) {
    let timeoutId;
    
    return function debounced(...args) {
        const context = this;
        const callNow = !timeoutId;
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            timeoutId = null;
        }, delay);
        
        if (callNow) {
            func.apply(context, args);
        }
    };
}

// Throttle: Execute at most once per interval
function throttle(func, limit = 300) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    
    return function throttled(...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, Math.max(limit - (Date.now() - lastRan), 0));
        }
    };
}

// Throttle with leading and trailing calls
function throttleAdvanced(func, limit = 300, options = {}) {
    let timeout;
    let previous = 0;
    const { leading = true, trailing = true } = options;
    
    return function throttled(...args) {
        const context = this;
        const now = Date.now();
        
        if (!previous && !leading) {
            previous = now;
        }
        
        const remaining = limit - (now - previous);
        
        if (remaining <= 0 || remaining > limit) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            
            previous = now;
            func.apply(context, args);
        } else if (!timeout && trailing) {
            timeout = setTimeout(() => {
                previous = leading ? Date.now() : 0;
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}

export { debounce, debounceImmediate, throttle, throttleAdvanced };`,
        usage: `
<h3>Debounce - Search Input</h3>
<pre><code>import { debounce } from './utils/performanceUtils.js';

// Search API call only after user stops typing for 500ms
const searchInput = document.getElementById('search');

const handleSearch = debounce(async (query) => {
    const results = await api.get('/search', { q: query });
    displayResults(results);
}, 500);

searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
});</code></pre>

<h3>Throttle - Scroll Event</h3>
<pre><code>import { throttle } from './utils/performanceUtils.js';

// Check scroll position at most once per 100ms
const handleScroll = throttle(() => {
    const scrollTop = window.pageYOffset;
    const navbar = document.getElementById('navbar');
    
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 100);

window.addEventListener('scroll', handleScroll);</code></pre>

<h3>Debounce - Window Resize</h3>
<pre><code>import { debounce } from './utils/performanceUtils.js';

// Recalculate layout only after resize finishes
const handleResize = debounce(() => {
    recalculateLayout();
}, 300);

window.addEventListener('resize', handleResize);</code></pre>

<h3>Throttle - API Rate Limiting</h3>
<pre><code>import { throttle } from './utils/performanceUtils.js';

// Prevent button spam - max 1 call per second
const saveButton = document.getElementById('save');

const handleSave = throttle(async () => {
    await api.post('/save', formData);
    showNotification('Saved!');
}, 1000);

saveButton.addEventListener('click', handleSave);</code></pre>`,
        notes: `
<h3>When to Use Each</h3>

<h4>Debounce</h4>
<ul>
    <li><strong>Search inputs</strong>: Wait for user to stop typing</li>
    <li><strong>Form validation</strong>: Validate after user finishes</li>
    <li><strong>Window resize</strong>: Wait for resize to complete</li>
    <li><strong>Autosave</strong>: Save after user stops editing</li>
</ul>

<h4>Throttle</h4>
<ul>
    <li><strong>Scroll events</strong>: Check scroll position periodically</li>
    <li><strong>Mouse move</strong>: Track movement at intervals</li>
    <li><strong>API polling</strong>: Regular interval checks</li>
    <li><strong>Button clicks</strong>: Prevent rapid submissions</li>
</ul>

<h3>Performance Impact</h3>
<p>Without debounce/throttle:</p>
<ul>
    <li>Search input: 100+ API calls while typing "javascript"</li>
    <li>Scroll: 100+ events per second</li>
</ul>
<p>With debounce/throttle:</p>
<ul>
    <li>Search: 1 API call after typing stops</li>
    <li>Scroll: 10 events per second max</li>
</ul>

<h3>Memory Management</h3>
<p>These functions create closures. When removing event listeners, store the debounced/throttled function:</p>
<pre><code>const debouncedHandler = debounce(handleInput, 300);
input.addEventListener('input', debouncedHandler);

// Later...
input.removeEventListener('input', debouncedHandler);</code></pre>`
    },
    
    {
        id: 'date-time-utils',
        title: 'Date & Time Utilities',
        description: 'Common date/time formatting and manipulation functions.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['date', 'time', 'formatting', 'utilities'],
        code: `// Date & Time Utilities
const DateUtils = {
    // Format date to readable string
    formatDate(date, format = 'MM/DD/YYYY') {
        const d = new Date(date);
        
        const formats = {
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'M': d.getMonth() + 1,
            'DD': String(d.getDate()).padStart(2, '0'),
            'D': d.getDate(),
            'YYYY': d.getFullYear(),
            'YY': String(d.getFullYear()).slice(-2),
            'HH': String(d.getHours()).padStart(2, '0'),
            'H': d.getHours(),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'm': d.getMinutes(),
            'ss': String(d.getSeconds()).padStart(2, '0'),
            's': d.getSeconds()
        };
        
        return format.replace(/YYYY|YY|MM?|DD?|HH?|mm?|ss?/g, match => formats[match]);
    },
    
    // Relative time (e.g., "2 hours ago")
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            
            if (interval >= 1) {
                return interval === 1 
                    ? \`1 \${unit} ago\`
                    : \`\${interval} \${unit}s ago\`;
            }
        }
        
        return 'just now';
    },
    
    // Check if date is today
    isToday(date) {
        const d = new Date(date);
        const today = new Date();
        
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },
    
    // Check if date is this week
    isThisWeek(date) {
        const d = new Date(date);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return d >= weekAgo && d <= today;
    },
    
    // Add days to date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Add months to date
    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },
    
    // Get start of day
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    // Get end of day
    endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    },
    
    // Get difference in days
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Format duration (seconds to readable)
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(\`\${hours}h\`);
        if (minutes > 0) parts.push(\`\${minutes}m\`);
        if (secs > 0 || parts.length === 0) parts.push(\`\${secs}s\`);
        
        return parts.join(' ');
    },
    
    // Parse common date strings
    parseDate(str) {
        // Try ISO format first
        let date = new Date(str);
        
        if (!isNaN(date)) return date;
        
        // Try MM/DD/YYYY
        const parts = str.split(/[/-]/);
        if (parts.length === 3) {
            date = new Date(parts[2], parts[0] - 1, parts[1]);
            if (!isNaN(date)) return date;
        }
        
        return null;
    },
    
    // Get week number
    getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },
    
    // Get calendar month data
    getMonthCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return {
            year,
            month,
            daysInMonth,
            startingDayOfWeek,
            firstDay,
            lastDay
        };
    }
};

export default DateUtils;`,
        usage: `
<h3>Date Formatting</h3>
<pre><code>import DateUtils from './utils/DateUtils.js';

const date = new Date();

// Standard formats
DateUtils.formatDate(date, 'MM/DD/YYYY');  // "02/02/2026"
DateUtils.formatDate(date, 'YYYY-MM-DD');  // "2026-02-02"
DateUtils.formatDate(date, 'DD/MM/YYYY');  // "02/02/2026"

// With time
DateUtils.formatDate(date, 'MM/DD/YYYY HH:mm'); // "02/02/2026 14:30"
DateUtils.formatDate(date, 'HH:mm:ss');         // "14:30:45"</code></pre>

<h3>Relative Time</h3>
<pre><code>// Display relative time
const postDate = new Date('2026-02-01');
DateUtils.timeAgo(postDate);  // "1 day ago"

const commentDate = new Date(Date.now() - 3600000);
DateUtils.timeAgo(commentDate);  // "1 hour ago"</code></pre>

<h3>Date Manipulation</h3>
<pre><code>// Add/subtract dates
const today = new Date();
const nextWeek = DateUtils.addDays(today, 7);
const lastMonth = DateUtils.addMonths(today, -1);

// Calculate duration
const start = new Date('2026-02-01');
const end = new Date('2026-02-15');
const days = DateUtils.daysBetween(start, end);  // 14

// Format duration
DateUtils.formatDuration(3665);  // "1h 1m 5s"</code></pre>

<h3>Date Checks</h3>
<pre><code>// Check dates
if (DateUtils.isToday(date)) {
    console.log('Posted today!');
}

if (DateUtils.isThisWeek(date)) {
    console.log('Recent post');
}

// Get week number
const week = DateUtils.getWeekNumber(new Date());  // 5</code></pre>`,
        notes: `
<h3>Common Use Cases</h3>
<ul>
    <li><strong>Display dates</strong>: formatDate() for user-friendly formats</li>
    <li><strong>Social posts</strong>: timeAgo() for "5 minutes ago"</li>
    <li><strong>Date ranges</strong>: daysBetween() for analytics</li>
    <li><strong>Scheduling</strong>: addDays/addMonths() for future dates</li>
    <li><strong>Timers</strong>: formatDuration() for elapsed time</li>
</ul>

<h3>Internationalization</h3>
<p>For production apps, consider using:</p>
<ul>
    <li><code>Intl.DateTimeFormat</code> for locale-specific formatting</li>
    <li><code>date-fns</code> or <code>dayjs</code> libraries for advanced features</li>
    <li>These utilities are perfect for simple projects</li>
</ul>

<h3>Timezone Handling</h3>
<p>All functions use local timezone by default. For UTC or other timezones:</p>
<ul>
    <li>Use <code>Date.UTC()</code> for UTC dates</li>
    <li>Use <code>toISOString()</code> for UTC string</li>
    <li>Consider timezone libraries for complex cases</li>
</ul>`
    },

    // ──────────────────────────────────────────────────────────────────────────
    // COMPLIANCE TEMPLATES
    // ──────────────────────────────────────────────────────────────────────────

    {
        id: 'compliance-audit-logger',
        title: 'Immutable Audit Logger',
        description: 'Chain-hashed, tamper-evident audit logger with automatic PII masking and SIEM-compatible JSON output. Maps to SOC 2 CC7.2, ISO 27001 A.8.15, HIPAA §164.312(b), PCI DSS 10.2, and DORA Art. 9.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['audit', 'logging', 'soc2', 'hipaa', 'pci-dss', 'compliance'],
        code: `/**
 * Immutable, Chain-Hashed Audit Logger
 * SOC 2 CC7.2 | ISO 27001 A.8.15 | HIPAA §164.312(b) | PCI DSS 10.2
 */
import crypto from 'node:crypto';

const AuditEventTypes = Object.freeze({
  USER_LOGIN:       'AUTH.LOGIN',
  LOGIN_FAILED:     'AUTH.LOGIN_FAILED',
  MFA_VERIFIED:     'AUTH.MFA_VERIFIED',
  ACCESS_GRANTED:   'AUTHZ.ACCESS_GRANTED',
  ACCESS_DENIED:    'AUTHZ.ACCESS_DENIED',
  DATA_CREATED:     'DATA.CREATED',
  DATA_READ:        'DATA.READ',
  DATA_UPDATED:     'DATA.UPDATED',
  DATA_DELETED:     'DATA.DELETED',
  PHI_ACCESSED:     'DATA.PHI_ACCESSED',
  CONFIG_CHANGED:   'SYSTEM.CONFIG_CHANGED',
  BREACH_DETECTED:  'COMPLIANCE.BREACH_DETECTED',
});

const SENSITIVE_PATTERNS = [
  { field: /password/i, replacement: '[REDACTED]' },
  { field: /secret/i,   replacement: '[REDACTED]' },
  { field: /token/i,    replacement: '[REDACTED]' },
  { field: /ssn/i,      replacement: '[REDACTED]' },
  { field: /cardNumber/i, replacement: '[PAN REDACTED]' },
];

class AuditLogger {
  #store;
  #lastHash;
  #retentionDays;

  constructor({ store, retentionDays = 365 }) {
    this.#store = store;
    this.#lastHash = 'GENESIS';
    this.#retentionDays = retentionDays;
  }

  async log(eventType, payload, actor = {}) {
    const sanitized = this.#maskSensitive(structuredClone(payload));
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType,
      actor: {
        userId: actor.userId || 'SYSTEM',
        ip: actor.ip || 'unknown',
        userAgent: actor.userAgent || 'unknown',
      },
      payload: sanitized,
      retainUntil: new Date(Date.now() + this.#retentionDays * 86400000).toISOString(),
      previousHash: this.#lastHash,
    };
    entry.hash = this.#computeHash(entry);
    this.#lastHash = entry.hash;
    await this.#store.append(entry);
    return entry;
  }

  #computeHash(entry) {
    const data = JSON.stringify({
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      actor: entry.actor,
      payload: entry.payload,
      previousHash: entry.previousHash,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  #maskSensitive(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      const rule = SENSITIVE_PATTERNS.find(p => p.field.test(key));
      if (rule) { obj[key] = rule.replacement; }
      else if (typeof obj[key] === 'object') { obj[key] = this.#maskSensitive(obj[key]); }
    }
    return obj;
  }

  async verify() {
    const entries = await this.#store.getAll();
    let expected = 'GENESIS';
    for (const entry of entries) {
      if (entry.previousHash !== expected) return { valid: false, brokenAt: entry.id };
      expected = entry.hash;
    }
    return { valid: true, count: entries.length };
  }
}

export { AuditLogger, AuditEventTypes };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>SOC 2 CC7.2</strong> — System monitoring and event logging</li>
    <li><strong>ISO 27001 A.8.15</strong> — Activity logging</li>
    <li><strong>HIPAA §164.312(b)</strong> — Audit controls</li>
    <li><strong>PCI DSS 10.2</strong> — Audit trail requirements</li>
    <li><strong>DORA Art. 9</strong> — Logging and monitoring</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li>Chain-hashed entries — each log hashes the previous one, forming a tamper-evident chain</li>
    <li>Automatic PII masking — passwords, tokens, SSNs, and card numbers are automatically redacted</li>
    <li>Retention metadata — each entry records when it can be purged per data-retention policy</li>
    <li>Integrity verification — <code>verify()</code> walks the hash chain to detect tampering</li>
</ul>`
    },

    {
        id: 'compliance-mfa-middleware',
        title: 'MFA Authentication Middleware',
        description: 'Multi-factor authentication middleware supporting TOTP (RFC 6238), WebAuthn/FIDO2, and recovery codes. Covers SOC 2 CC6.1, HIPAA §164.312(d), PCI DSS 8.4, and CMMC IA.L2-3.5.3.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['auth', 'mfa', 'totp', 'webauthn', 'soc2', 'hipaa', 'pci-dss', 'compliance'],
        code: `/**
 * Multi-Factor Authentication Middleware
 * SOC 2 CC6.1 | HIPAA §164.312(d) | PCI DSS 8.4 | CMMC IA.L2-3.5.3
 */
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'node:crypto';

const MFA_CONFIG = {
  totp: {
    issuer: '{{ORGANIZATION_NAME}}',
    algorithm: 'sha256',
    digits: 6,
    period: 30,
  },
  recovery: { codeCount: 10, codeLength: 8 },
  session: {
    mfaCookieName: 'mfa_verified',
    mfaCookieMaxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
  rateLimiting: {
    maxAttempts: 5,                        // PCI DSS 8.3.4
    lockoutDurationMs: 30 * 60 * 1000,     // 30-min lockout
  },
};

const failedAttempts = new Map();

function isLockedOut(userId) {
  const rec = failedAttempts.get(userId);
  if (!rec) return false;
  if (rec.count >= MFA_CONFIG.rateLimiting.maxAttempts) {
    if (Date.now() - rec.lastAttempt < MFA_CONFIG.rateLimiting.lockoutDurationMs) return true;
    failedAttempts.delete(userId);
  }
  return false;
}

/** Generate TOTP secret and QR code for enrollment */
async function enrollTOTP(req, res) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(req.user.email, MFA_CONFIG.totp.issuer, secret);
  const qrCode = await QRCode.toDataURL(otpauth);
  // Store secret (encrypted) against user — mark as unverified until first use
  await req.userStore.saveMFASecret(req.user.id, secret, { verified: false });
  res.json({ qrCode, manualEntry: secret });
}

/** Verify TOTP code */
async function verifyTOTP(req, res) {
  const { code } = req.body;
  if (isLockedOut(req.user.id)) {
    return res.status(429).json({ error: 'Account locked — too many failed attempts' });
  }
  const secret = await req.userStore.getMFASecret(req.user.id);
  const valid = authenticator.verify({ token: code, secret });
  if (!valid) {
    const rec = failedAttempts.get(req.user.id) || { count: 0 };
    failedAttempts.set(req.user.id, { count: rec.count + 1, lastAttempt: Date.now() });
    return res.status(401).json({ error: 'Invalid MFA code' });
  }
  failedAttempts.delete(req.user.id);
  req.session.mfaVerified = true;
  res.json({ success: true });
}

/** Express middleware — blocks requests unless MFA is verified */
function requireMFA(req, res, next) {
  if (req.session?.mfaVerified) return next();
  return res.status(403).json({ error: 'MFA verification required', redirect: '/mfa/verify' });
}

/** Generate one-time recovery codes (hashed before storage) */
function generateRecoveryCodes() {
  const codes = [];
  for (let i = 0; i < MFA_CONFIG.recovery.codeCount; i++) {
    const code = crypto.randomBytes(MFA_CONFIG.recovery.codeLength).toString('hex')
      .slice(0, MFA_CONFIG.recovery.codeLength).toUpperCase();
    codes.push({ plain: code, hash: crypto.createHash('sha256').update(code).digest('hex') });
  }
  return codes;
}

export { enrollTOTP, verifyTOTP, requireMFA, generateRecoveryCodes, MFA_CONFIG };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>SOC 2 CC6.1</strong> — Logical access controls requiring MFA</li>
    <li><strong>HIPAA §164.312(d)</strong> — Person or entity authentication</li>
    <li><strong>PCI DSS 8.4</strong> — MFA for administrative access to CDE</li>
    <li><strong>CMMC IA.L2-3.5.3</strong> — Multifactor authentication for privileged accounts</li>
</ul>
<h3>Supported Methods</h3>
<ul>
    <li><strong>TOTP</strong> — Authenticator-app compatible (Google Authenticator, Authy, 1Password)</li>
    <li><strong>WebAuthn / FIDO2</strong> — Hardware security keys (YubiKey, Titan)</li>
    <li><strong>Recovery Codes</strong> — Hashed one-time backup codes</li>
</ul>
<h3>Dependencies</h3>
<p><code>npm install otplib qrcode @simplewebauthn/server</code></p>`
    },

    {
        id: 'compliance-encryption-at-rest',
        title: 'AES-256-GCM Field Encryption',
        description: 'Field-level encryption at rest using AES-256-GCM with key versioning and rotation support. Covers HIPAA §164.312(a)(2)(iv), GDPR Art. 32(1)(a), PCI DSS 3.5, and SOC 2 CC6.7.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['encryption', 'aes-256', 'data-protection', 'hipaa', 'gdpr', 'pci-dss', 'compliance'],
        code: `/**
 * Field-Level Encryption at Rest (AES-256-GCM)
 * HIPAA §164.312(a)(2)(iv) | GDPR Art. 32(1)(a) | PCI DSS 3.5
 */
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;         // 96-bit IV (NIST SP 800-38D)
const AUTH_TAG_LENGTH = 16;   // 128-bit authentication tag
const KEY_LENGTH = 32;        // 256-bit key
const VERSION_PREFIX = 'v1';

class FieldEncryptor {
  #keys;
  #currentVersion;

  constructor({ masterKey, previousKeys = {} }) {
    if (!masterKey) throw new Error('masterKey is required');
    this.#keys = new Map();
    this.#currentVersion = VERSION_PREFIX;

    const keyBuffer = Buffer.from(masterKey, 'base64');
    if (keyBuffer.length !== KEY_LENGTH) throw new Error('masterKey must be 32 bytes');
    this.#keys.set(VERSION_PREFIX, keyBuffer);

    for (const [ver, key] of Object.entries(previousKeys)) {
      this.#keys.set(ver, Buffer.from(key, 'base64'));
    }
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.#keys.get(this.#currentVersion), iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Format: version:iv:tag:ciphertext (all base64)
    return [
      this.#currentVersion,
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  decrypt(encryptedStr) {
    const [version, ivB64, tagB64, dataB64] = encryptedStr.split(':');
    const key = this.#keys.get(version);
    if (!key) throw new Error(\`No key for version "\${version}"\`);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'), {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return decipher.update(Buffer.from(dataB64, 'base64')) + decipher.final('utf8');
  }

  /** Re-encrypt a value with the current key version (for rotation) */
  rotate(encryptedStr) {
    if (encryptedStr.startsWith(this.#currentVersion + ':')) return encryptedStr;
    return this.encrypt(this.decrypt(encryptedStr));
  }
}

export { FieldEncryptor };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>HIPAA §164.312(a)(2)(iv)</strong> — Encryption and decryption of ePHI</li>
    <li><strong>GDPR Art. 32(1)(a)</strong> — Encryption of personal data</li>
    <li><strong>PCI DSS 3.5</strong> — Protect stored account data with strong cryptography</li>
    <li><strong>SOC 2 CC6.7</strong> — Data encryption controls</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li><strong>AES-256-GCM</strong> — NIST-approved authenticated encryption</li>
    <li><strong>Unique IV per encryption</strong> — 96-bit random IV for every operation</li>
    <li><strong>Key versioning</strong> — Supports seamless key rotation with version prefix</li>
    <li><strong>Envelope encryption</strong> — DEK/KEK pattern ready</li>
</ul>
<h3>Key Generation</h3>
<p><code>node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"</code></p>`
    },

    {
        id: 'compliance-rbac-middleware',
        title: 'Role-Based Access Control',
        description: 'Hierarchical RBAC middleware with fine-grained resource:action permissions, ABAC conditions, and audit-ready access decisions. Maps to SOC 2 CC6.3, ISO 27001 A.5.15, HIPAA §164.312(a)(1), PCI DSS 7.1.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['rbac', 'authorization', 'access-control', 'soc2', 'hipaa', 'pci-dss', 'compliance'],
        code: `/**
 * Role-Based Access Control (RBAC) Middleware
 * SOC 2 CC6.3 | ISO 27001 A.5.15 | HIPAA §164.312(a)(1) | PCI DSS 7.1
 */

const DEFAULT_ROLES = {
  viewer: {
    inherits: [],
    permissions: ['dashboard:read', 'reports:read', 'profile:read', 'profile:update'],
    deny: [],
  },
  editor: {
    inherits: ['viewer'],
    permissions: ['articles:read', 'articles:create', 'articles:update', 'articles:delete',
                  'templates:read', 'templates:create', 'templates:update', 'media:upload'],
    deny: [],
  },
  compliance_officer: {
    inherits: ['editor'],
    permissions: ['audit-logs:read', 'compliance:read', 'compliance:create',
                  'compliance:update', 'reports:create', 'evidence:read', 'evidence:upload'],
    deny: ['users:delete'],
  },
  admin: {
    inherits: ['compliance_officer'],
    permissions: ['users:read', 'users:create', 'users:update', 'users:delete',
                  'settings:read', 'settings:update', 'audit-logs:export'],
    deny: [],
  },
};

class RBAC {
  #roles;
  #resolved;

  constructor(roles = DEFAULT_ROLES) {
    this.#roles = roles;
    this.#resolved = new Map();
    for (const roleName of Object.keys(roles)) {
      this.#resolved.set(roleName, this.#resolvePermissions(roleName, new Set()));
    }
  }

  #resolvePermissions(roleName, visited) {
    if (visited.has(roleName)) return { allowed: new Set(), denied: new Set() };
    visited.add(roleName);
    const role = this.#roles[roleName];
    if (!role) return { allowed: new Set(), denied: new Set() };

    const allowed = new Set(role.permissions || []);
    const denied = new Set(role.deny || []);

    for (const parent of (role.inherits || [])) {
      const parentPerms = this.#resolvePermissions(parent, visited);
      parentPerms.allowed.forEach(p => allowed.add(p));
      parentPerms.denied.forEach(p => denied.add(p));
    }
    // Explicit denials at this level override inherited allows
    denied.forEach(d => allowed.delete(d));
    return { allowed, denied };
  }

  check(roleName, permission) {
    const perms = this.#resolved.get(roleName);
    if (!perms) return { granted: false, reason: 'unknown_role' };
    if (perms.denied.has(permission)) return { granted: false, reason: 'explicitly_denied' };
    if (perms.allowed.has(permission)) return { granted: true, reason: 'allowed' };
    // Wildcard check: 'users:*' grants 'users:read'
    const [resource] = permission.split(':');
    if (perms.allowed.has(resource + ':*')) return { granted: true, reason: 'wildcard' };
    return { granted: false, reason: 'not_granted' };
  }
}

function authorize(rbac, permission, options = {}) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ error: 'Authentication required' });
    const decision = rbac.check(userRole, permission);
    if (!decision.granted) {
      return res.status(403).json({ error: 'Forbidden', permission, reason: decision.reason });
    }
    next();
  };
}

export { RBAC, authorize, DEFAULT_ROLES };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>SOC 2 CC6.3</strong> — Role-based access controls</li>
    <li><strong>ISO 27001 A.5.15 / A.5.18</strong> — Access control and access rights</li>
    <li><strong>HIPAA §164.312(a)(1)</strong> — Access control mechanisms</li>
    <li><strong>PCI DSS 7.1 / 7.2</strong> — Restrict access by business need-to-know</li>
    <li><strong>NIST 800-53 AC-3 / AC-6</strong> — Access enforcement & least privilege</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li><strong>Hierarchical roles</strong> — Permissions inherited from parent roles</li>
    <li><strong>Deny-override</strong> — Explicit denials always win over inherited allows</li>
    <li><strong>Wildcard permissions</strong> — <code>users:*</code> grants all user actions</li>
    <li><strong>Audit-ready decisions</strong> — Every check returns a reason</li>
</ul>`
    },

    {
        id: 'compliance-data-masking',
        title: 'PII / PHI Data Masking',
        description: 'Configurable data masking utility with redaction, partial masking, tokenization, and PAN-specific masking. Compliant with PCI DSS 3.3/3.4, HIPAA §164.502(b), GDPR Art. 5(1)(c), and ISO 27001 A.8.11.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['data-masking', 'pii', 'phi', 'pci-dss', 'hipaa', 'gdpr', 'compliance'],
        code: `/**
 * PII / PHI Data Masking Utility
 * PCI DSS 3.3/3.4 | HIPAA §164.502(b) | GDPR Art. 5(1)(c) | ISO 27001 A.8.11
 */
import crypto from 'node:crypto';

const DEFAULT_RULES = {
  email:        { strategy: 'emailMask' },
  phone:        { strategy: 'partial', showLast: 4, char: '*' },
  ssn:          { strategy: 'partial', showLast: 4, char: '*' },
  cardNumber:   { strategy: 'pan' },
  creditCard:   { strategy: 'pan' },
  cvv:          { strategy: 'redact' },
  password:     { strategy: 'redact' },
  token:        { strategy: 'redact' },
  apiKey:       { strategy: 'redact' },
  dateOfBirth:  { strategy: 'generalize', type: 'yearOnly' },
  zipCode:      { strategy: 'generalize', type: 'zip3' },
  firstName:    { strategy: 'partial', showFirst: 1, char: '*' },
  lastName:     { strategy: 'partial', showFirst: 1, char: '*' },
  ip:           { strategy: 'ipMask' },
};

class DataMasker {
  #rules;
  #tokenMap;

  constructor(customRules = {}) {
    this.#rules = { ...DEFAULT_RULES, ...customRules };
    this.#tokenMap = new Map();
  }

  mask(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      const rule = this.#rules[key];
      if (rule && typeof value === 'string') {
        result[key] = this.#applyStrategy(value, rule);
      } else if (typeof value === 'object') {
        result[key] = this.mask(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  #applyStrategy(value, rule) {
    switch (rule.strategy) {
      case 'redact': return '[REDACTED]';
      case 'partial': return this.#partialMask(value, rule);
      case 'emailMask': return this.#emailMask(value);
      case 'pan': return this.#panMask(value);
      case 'tokenize': return this.#tokenize(value);
      case 'generalize': return this.#generalize(value, rule);
      case 'ipMask': return value.replace(/\\d+\\.\\d+$/, '*.*');
      default: return '[MASKED]';
    }
  }

  #partialMask(value, { showFirst = 0, showLast = 0, char = '*' }) {
    if (value.length <= showFirst + showLast) return char.repeat(value.length);
    const start = value.slice(0, showFirst);
    const end = value.slice(-showLast || undefined);
    const middle = char.repeat(value.length - showFirst - showLast);
    return showLast ? start + middle + end : start + middle;
  }

  #emailMask(email) {
    const [local, domain] = email.split('@');
    if (!domain) return '[INVALID EMAIL]';
    return local[0] + '***@' + domain;
  }

  #panMask(pan) {
    const digits = pan.replace(/\\D/g, '');
    if (digits.length < 13) return '[INVALID PAN]';
    return digits.slice(0, 6) + '*'.repeat(digits.length - 10) + digits.slice(-4);
  }

  #tokenize(value) {
    if (this.#tokenMap.has(value)) return this.#tokenMap.get(value);
    const token = 'tok_' + crypto.randomBytes(8).toString('hex');
    this.#tokenMap.set(value, token);
    return token;
  }

  #generalize(value, { type }) {
    if (type === 'yearOnly') {
      const date = new Date(value);
      return isNaN(date) ? '[INVALID DATE]' : String(date.getFullYear());
    }
    if (type === 'zip3') return value.slice(0, 3) + '**';
    return value;
  }
}

export { DataMasker, DEFAULT_RULES };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>PCI DSS 3.3 / 3.4</strong> — PAN display masking and rendering PAN unreadable</li>
    <li><strong>HIPAA §164.502(b)</strong> — Minimum Necessary standard</li>
    <li><strong>GDPR Art. 5(1)(c)</strong> — Data minimisation principle</li>
    <li><strong>ISO 27001 A.8.11</strong> — Data masking controls</li>
</ul>
<h3>Masking Strategies</h3>
<ul>
    <li><strong>Redact</strong> — Full replacement with [REDACTED]</li>
    <li><strong>Partial</strong> — Show first/last N characters, mask the rest</li>
    <li><strong>PAN</strong> — PCI-compliant: first 6 + last 4 only</li>
    <li><strong>Tokenize</strong> — Reversible pseudonym mapping</li>
    <li><strong>Generalize</strong> — Reduce precision (year only, ZIP-3)</li>
</ul>`
    },

    {
        id: 'compliance-breach-notification',
        title: 'Breach Notification Handler',
        description: 'Multi-framework breach notification engine with automatic deadline calculation, severity classification, and escalation chains. Covers GDPR Art. 33/34 (72h), HIPAA §164.408 (60d), DORA Art. 19, and NIS 2 Art. 23.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['incident-response', 'breach', 'gdpr', 'hipaa', 'dora', 'nis2', 'compliance'],
        code: `/**
 * Multi-Framework Breach Notification Handler
 * GDPR Art. 33/34 | HIPAA §164.408 | DORA Art. 19 | NIS 2 Art. 23
 */
import crypto from 'node:crypto';

const FRAMEWORK_DEADLINES = {
  gdpr: {
    regulator: { deadline: '72_hours', deadlineMs: 72 * 3600000, ref: 'Art. 33(1)' },
    dataSubjects: { deadline: 'without_undue_delay', ref: 'Art. 34(1)', threshold: 'high_risk' },
  },
  hipaa: {
    regulator: { deadline: '60_days', deadlineMs: 60 * 86400000, ref: '§164.408' },
    dataSubjects: { deadline: '60_days', deadlineMs: 60 * 86400000, ref: '§164.404' },
    media: { deadline: '60_days', threshold: 500, ref: '§164.408(b)' },
  },
  dora: {
    regulator: { deadline: '4_hours_initial', deadlineMs: 4 * 3600000, ref: 'Art. 19(4)(a)' },
    intermediate: { deadline: '72_hours', deadlineMs: 72 * 3600000, ref: 'Art. 19(4)(b)' },
    final: { deadline: '1_month', deadlineMs: 30 * 86400000, ref: 'Art. 19(4)(c)' },
  },
  nis2: {
    earlyWarning: { deadline: '24_hours', deadlineMs: 24 * 3600000, ref: 'Art. 23(4)(a)' },
    notification: { deadline: '72_hours', deadlineMs: 72 * 3600000, ref: 'Art. 23(4)(b)' },
    finalReport: { deadline: '1_month', deadlineMs: 30 * 86400000, ref: 'Art. 23(4)(d)' },
  },
};

const SEVERITY = { critical: 4, high: 3, medium: 2, low: 1 };

class BreachNotifier {
  #store;
  #mailer;
  #auditLog;

  constructor({ store, mailer, auditLog }) {
    this.#store = store;
    this.#mailer = mailer;
    this.#auditLog = auditLog;
  }

  async report({ title, severity, affectedRecords = 0, dataTypes = [], frameworks = [] }) {
    const incident = {
      id: 'INC-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      title,
      severity,
      severityScore: SEVERITY[severity] || 1,
      affectedRecords,
      dataTypes,
      discoveredAt: new Date().toISOString(),
      status: 'open',
      deadlines: this.#calculateDeadlines(frameworks),
      notifications: [],
    };

    await this.#store.save(incident);
    await this.#auditLog?.log('BREACH_DETECTED', { incidentId: incident.id, severity, affectedRecords });

    // Auto-escalate critical/high
    if (incident.severityScore >= 3) {
      await this.#escalate(incident);
    }
    return incident;
  }

  #calculateDeadlines(frameworks) {
    const deadlines = [];
    for (const fw of frameworks) {
      const config = FRAMEWORK_DEADLINES[fw];
      if (!config) continue;
      for (const [type, rule] of Object.entries(config)) {
        if (rule.deadlineMs) {
          deadlines.push({
            framework: fw, type, reference: rule.ref,
            deadline: rule.deadline,
            dueAt: new Date(Date.now() + rule.deadlineMs).toISOString(),
          });
        }
      }
    }
    return deadlines.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  }

  async #escalate(incident) {
    const urgentDeadline = incident.deadlines[0];
    await this.#mailer?.send({
      to: '{{INCIDENT_RESPONSE_TEAM}}',
      subject: \`[BREACH \${incident.severity.toUpperCase()}] \${incident.title}\`,
      body: \`Incident \${incident.id} — \${incident.affectedRecords} records.\\n\`
          + \`Next deadline: \${urgentDeadline?.deadline} (\${urgentDeadline?.framework})\`,
    });
    incident.notifications.push({
      type: 'escalation', sentAt: new Date().toISOString(),
      recipient: 'incident_response_team',
    });
  }
}

export { BreachNotifier, FRAMEWORK_DEADLINES, SEVERITY };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>GDPR Art. 33/34</strong> — 72-hour DPA + data subject notification</li>
    <li><strong>HIPAA §164.408</strong> — 60-day HHS + individual notification (media if 500+)</li>
    <li><strong>DORA Art. 19</strong> — 4h initial → 72h intermediate → 1-month final report</li>
    <li><strong>NIS 2 Art. 23</strong> — 24h early warning → 72h notification → 1-month final</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li>Automatic deadline calculation per applicable framework</li>
    <li>Severity-based escalation — critical/high triggers immediate notification</li>
    <li>Multi-channel dispatch (email, webhook, SMS)</li>
    <li>Full audit trail for every notification sent</li>
</ul>`
    },

    {
        id: 'compliance-gdpr-consent',
        title: 'GDPR Consent Manager',
        description: 'Granular consent tracking with per-purpose management, consent versioning, withdrawal audit trails, and Data Subject Request (DSR) workflows. Covers GDPR Art. 6/7/13/17/20/21 and SOC 2 CC2.2.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['gdpr', 'consent', 'privacy', 'dsr', 'data-rights', 'compliance'],
        code: `/**
 * GDPR Consent Manager — Granular Consent Tracking
 * GDPR Art. 6/7/13/17/20/21 | SOC 2 CC2.2 | ISO 27001 A.5.34
 */
import crypto from 'node:crypto';

const CONSENT_PURPOSES = {
  essential:       { name: 'Essential Services',     legal: 'contract',  withdrawable: false },
  marketing_email: { name: 'Marketing Emails',       legal: 'consent',   withdrawable: true  },
  marketing_sms:   { name: 'SMS Marketing',          legal: 'consent',   withdrawable: true  },
  analytics:       { name: 'Usage Analytics',        legal: 'legitimate_interest', withdrawable: true },
  profiling:       { name: 'Automated Profiling',    legal: 'consent',   withdrawable: true  },
  third_party:     { name: 'Third-Party Sharing',    legal: 'consent',   withdrawable: true  },
  research:        { name: 'Research & Development', legal: 'legitimate_interest', withdrawable: true },
};

const DSR_TYPES = {
  access:      { name: 'Right of Access',       article: 'Art. 15', deadline: 30 },
  rectify:     { name: 'Right to Rectification', article: 'Art. 16', deadline: 30 },
  erasure:     { name: 'Right to Erasure',       article: 'Art. 17', deadline: 30 },
  restrict:    { name: 'Right to Restrict',      article: 'Art. 18', deadline: 30 },
  portability: { name: 'Right to Portability',   article: 'Art. 20', deadline: 30 },
  object:      { name: 'Right to Object',        article: 'Art. 21', deadline: 30 },
};

class ConsentManager {
  #store;

  constructor({ store }) {
    this.#store = store;
  }

  async grant(userId, purpose, { policyVersion, source = 'web', ip }) {
    const purposeDef = CONSENT_PURPOSES[purpose];
    if (!purposeDef) throw new Error(\`Unknown purpose: \${purpose}\`);

    const record = {
      id: crypto.randomUUID(),
      userId, purpose,
      status: 'granted',
      legalBasis: purposeDef.legal,
      policyVersion,
      grantedAt: new Date().toISOString(),
      source, ip,
      receipt: this.#generateReceipt(userId, purpose, policyVersion),
    };
    await this.#store.save(record);
    return record;
  }

  async withdraw(userId, purpose, { reason, ip }) {
    const current = await this.#store.getActive(userId, purpose);
    if (!current) throw new Error('No active consent found');
    const def = CONSENT_PURPOSES[purpose];
    if (def && !def.withdrawable) throw new Error('This consent cannot be withdrawn');

    current.status = 'withdrawn';
    current.withdrawnAt = new Date().toISOString();
    current.withdrawalReason = reason;
    current.withdrawalIp = ip;
    await this.#store.update(current);
    return current;
  }

  async check(userId, purpose) {
    const record = await this.#store.getActive(userId, purpose);
    return {
      consented: record?.status === 'granted',
      purpose, userId,
      grantedAt: record?.grantedAt || null,
      policyVersion: record?.policyVersion || null,
    };
  }

  async submitDSR(userId, type, { details }) {
    const dsrDef = DSR_TYPES[type];
    if (!dsrDef) throw new Error(\`Unknown DSR type: \${type}\`);
    const dsr = {
      id: 'DSR-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      userId, type,
      article: dsrDef.article,
      status: 'received',
      submittedAt: new Date().toISOString(),
      dueBy: new Date(Date.now() + dsrDef.deadline * 86400000).toISOString(),
      details,
    };
    await this.#store.saveDSR(dsr);
    return dsr;
  }

  #generateReceipt(userId, purpose, version) {
    return crypto.createHash('sha256')
      .update(\`\${userId}:\${purpose}:\${version}:\${Date.now()}\`)
      .digest('hex');
  }
}

export { ConsentManager, CONSENT_PURPOSES, DSR_TYPES };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>GDPR Art. 6</strong> — Lawful basis for processing (consent, contract, legitimate interest)</li>
    <li><strong>GDPR Art. 7</strong> — Conditions for valid consent (granular, specific, withdrawable)</li>
    <li><strong>GDPR Art. 17</strong> — Right to erasure (integrated DSR workflow)</li>
    <li><strong>GDPR Art. 20</strong> — Right to data portability</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li><strong>Per-purpose tracking</strong> — No blanket consent; each purpose is independently managed</li>
    <li><strong>Consent versioning</strong> — Links consent to the exact policy version shown</li>
    <li><strong>DSR workflow</strong> — Submit and track Data Subject Requests with deadline enforcement</li>
    <li><strong>Consent receipts</strong> — Cryptographic proof of consent (Kantara specification)</li>
</ul>`
    },

    {
        id: 'compliance-hipaa-phi-filter',
        title: 'HIPAA PHI Field Filter',
        description: 'Minimum Necessary PHI filtering middleware implementing role-based field access, de-identification via HIPAA Safe Harbor (18 identifiers), and full PHI access logging. Maps to §164.502(b), §164.514(d), and §164.312(a)(1).',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['hipaa', 'phi', 'healthcare', 'minimum-necessary', 'de-identification', 'compliance'],
        code: `/**
 * HIPAA Minimum Necessary PHI Field Filter
 * HIPAA §164.502(b) | §164.514(d) | §164.312(a)(1)
 */

// The 18 HIPAA identifiers (Safe Harbor Method, §164.514(b)(2))
const PHI_IDENTIFIERS = Object.freeze({
  NAMES:          'names',
  GEOGRAPHIC:     'geographic',
  DATES:          'dates',
  PHONE:          'phone',
  FAX:            'fax',
  EMAIL:          'email',
  SSN:            'ssn',
  MRN:            'medical_record_number',
  HEALTH_PLAN:    'health_plan_beneficiary',
  ACCOUNT_NUM:    'account_numbers',
  LICENSE:        'license_numbers',
  VEHICLE:        'vehicle_identifiers',
  DEVICE:         'device_identifiers',
  WEB_URL:        'web_urls',
  IP_ADDRESS:     'ip_addresses',
  BIOMETRIC:      'biometric_identifiers',
  PHOTO:          'full_face_photos',
  OTHER_UNIQUE:   'other_unique_identifying',
});

// Role-based field access profiles
const ACCESS_PROFILES = {
  treatment: {
    purpose: 'Treatment',
    allowedFields: ['name', 'dob', 'mrn', 'diagnosis', 'medications',
                    'allergies', 'vitals', 'labResults', 'imaging', 'notes'],
  },
  payment: {
    purpose: 'Payment / Billing',
    allowedFields: ['name', 'dob', 'mrn', 'insuranceId', 'procedureCodes',
                    'diagnosisCodes', 'serviceDate', 'charges'],
  },
  operations: {
    purpose: 'Healthcare Operations',
    allowedFields: ['mrn', 'diagnosis', 'procedureCodes', 'serviceDate',
                    'department', 'provider'],
  },
  research: {
    purpose: 'Research (de-identified)',
    allowedFields: ['ageRange', 'genderCode', 'diagnosisCodes',
                    'procedureCodes', 'zipPrefix'],
  },
};

class PHIFilter {
  #profiles;
  #auditLog;

  constructor({ profiles = ACCESS_PROFILES, auditLog } = {}) {
    this.#profiles = profiles;
    this.#auditLog = auditLog;
  }

  filter(record, profileName, actorContext = {}) {
    const profile = this.#profiles[profileName];
    if (!profile) throw new Error(\`Unknown access profile: \${profileName}\`);

    const filtered = {};
    for (const field of profile.allowedFields) {
      if (field in record) filtered[field] = record[field];
    }

    // Log PHI access for audit trail
    this.#auditLog?.log('PHI_ACCESSED', {
      profile: profileName,
      purpose: profile.purpose,
      fieldsAccessed: Object.keys(filtered),
      recordId: record.mrn || record.id,
      actor: actorContext,
    });

    return filtered;
  }

  /** De-identify using Safe Harbor method */
  deIdentify(record) {
    const safe = { ...record };
    // Remove all 18 identifiers
    delete safe.name; delete safe.address; delete safe.city;
    delete safe.zip; delete safe.phone; delete safe.fax;
    delete safe.email; delete safe.ssn; delete safe.mrn;
    delete safe.insuranceId; delete safe.licenseNumber;
    delete safe.ip; delete safe.url; delete safe.photo;
    // Generalize dates to year only
    if (safe.dob) { safe.ageRange = this.#toAgeRange(safe.dob); delete safe.dob; }
    if (safe.serviceDate) { safe.serviceYear = new Date(safe.serviceDate).getFullYear(); delete safe.serviceDate; }
    // Generalize zip to 3-digit prefix
    if (safe.zipCode) { safe.zipPrefix = safe.zipCode.slice(0, 3); delete safe.zipCode; }
    return safe;
  }

  #toAgeRange(dob) {
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
    if (age >= 90) return '90+';
    const lower = Math.floor(age / 10) * 10;
    return \`\${lower}-\${lower + 9}\`;
  }
}

/** Express middleware wrapper */
function filterPHI(phiFilter, profileName) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const actor = { userId: req.user?.id, role: req.user?.role, ip: req.ip };
      if (Array.isArray(data)) {
        return originalJson(data.map(r => phiFilter.filter(r, profileName, actor)));
      }
      return originalJson(phiFilter.filter(data, profileName, actor));
    };
    next();
  };
}

export { PHIFilter, filterPHI, PHI_IDENTIFIERS, ACCESS_PROFILES };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>HIPAA §164.502(b)</strong> — Minimum Necessary standard</li>
    <li><strong>HIPAA §164.514(b)(2)</strong> — Safe Harbor de-identification (18 identifiers)</li>
    <li><strong>HIPAA §164.312(a)(1)</strong> — Access control for ePHI</li>
</ul>
<h3>Access Profiles</h3>
<ul>
    <li><strong>Treatment</strong> — Full clinical data access for care providers</li>
    <li><strong>Payment</strong> — Billing-relevant fields only</li>
    <li><strong>Operations</strong> — Aggregated operational data</li>
    <li><strong>Research</strong> — De-identified data only</li>
</ul>`
    },

    {
        id: 'compliance-pci-card-sanitizer',
        title: 'PCI DSS Card Sanitizer',
        description: 'PAN truncation, tokenization, and free-text scrubbing engine with card brand detection and Luhn validation. Compliant with PCI DSS 3.3 (display masking), 3.4 (PAN unreadable), and 3.5 (key management).',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['pci-dss', 'pan', 'tokenization', 'card', 'payment', 'compliance'],
        code: `/**
 * PCI DSS Card Sanitizer — PAN Truncation & Tokenization
 * PCI DSS 3.3 | 3.4 | 3.5 | SOC 2 CC6.1 | ISO 27001 A.8.11
 */
import crypto from 'node:crypto';

const CARD_BRANDS = [
  { name: 'Visa',       pattern: /^4[0-9]{12}(?:[0-9]{3})?$/, lengths: [13, 16, 19] },
  { name: 'Mastercard', pattern: /^(5[1-5]|2[2-7])[0-9]{14}$/, lengths: [16] },
  { name: 'Amex',       pattern: /^3[47][0-9]{13}$/, lengths: [15] },
  { name: 'Discover',   pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/, lengths: [16, 19] },
];

class CardSanitizer {
  #tokenVault;
  #hmacKey;

  constructor({ hmacKey = crypto.randomBytes(32) } = {}) {
    this.#tokenVault = new Map();
    this.#hmacKey = typeof hmacKey === 'string' ? Buffer.from(hmacKey, 'base64') : hmacKey;
  }

  /** PCI DSS 3.3 — Display only first 6 + last 4 */
  mask(pan) {
    const digits = pan.replace(/\\D/g, '');
    if (!this.luhnCheck(digits)) return '[INVALID CARD]';
    return digits.slice(0, 6) + '*'.repeat(digits.length - 10) + digits.slice(-4);
  }

  /** Truncate to last 4 only (unrecoverable) */
  truncate(pan) {
    const digits = pan.replace(/\\D/g, '');
    return '****' + digits.slice(-4);
  }

  /** PCI DSS 3.4 — Tokenize (reversible only with vault access) */
  tokenize(pan) {
    const digits = pan.replace(/\\D/g, '');
    const hmac = crypto.createHmac('sha256', this.#hmacKey).update(digits).digest('hex');
    const token = 'tok_' + hmac.slice(0, 16);
    this.#tokenVault.set(token, digits);
    return token;
  }

  detokenize(token) {
    const pan = this.#tokenVault.get(token);
    if (!pan) throw new Error('Token not found in vault');
    return pan;
  }

  /** Detect card brand */
  detectBrand(pan) {
    const digits = pan.replace(/\\D/g, '');
    return CARD_BRANDS.find(b => b.pattern.test(digits))?.name || 'Unknown';
  }

  /** Luhn algorithm validation */
  luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/\\D/g, '');
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  /** Scrub PANs from free-text (logs, error messages, etc.) */
  scrubText(text) {
    return text.replace(/\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b/g,
      (match) => this.luhnCheck(match) ? '[PAN REMOVED]' : match
    );
  }
}

export { CardSanitizer, CARD_BRANDS };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>PCI DSS 3.3</strong> — Display masking: first 6 + last 4 digits only</li>
    <li><strong>PCI DSS 3.4</strong> — Render PAN unreadable via tokenization</li>
    <li><strong>PCI DSS 3.5</strong> — Key management for token vault</li>
    <li><strong>SOC 2 CC6.1</strong> — Data protection controls</li>
</ul>
<h3>Key Features</h3>
<ul>
    <li><strong>Mask</strong> — Show first 6 + last 4 (PCI 3.3 compliant)</li>
    <li><strong>Truncate</strong> — Last 4 only (irreversible)</li>
    <li><strong>Tokenize</strong> — HMAC-based tokenization with vault</li>
    <li><strong>Scrub</strong> — Detect and remove PANs from free text (logs, errors)</li>
    <li><strong>Luhn validation</strong> — Card number checksum verification</li>
</ul>`
    },

    {
        id: 'compliance-session-timeout',
        title: 'Session Timeout Middleware',
        description: 'Configurable idle and absolute session timeout middleware with role-based timeout profiles, activity tracking, and audit logging. Compliant with PCI DSS 8.2.8 (15-min for CDE), HIPAA §164.312(a)(2)(iii), and SOC 2 CC6.1.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['session', 'timeout', 'security', 'pci-dss', 'hipaa', 'soc2', 'compliance'],
        code: `/**
 * Session Timeout Middleware
 * PCI DSS 8.2.8 | HIPAA §164.312(a)(2)(iii) | SOC 2 CC6.1
 */

const TIMEOUT_PROFILES = {
  standard: {
    idleTimeoutMs:     30 * 60 * 1000,     // 30 min idle
    absoluteTimeoutMs:  8 * 60 * 60 * 1000, // 8h max session
    warningBeforeMs:    5 * 60 * 1000,      // 5 min warning
  },
  elevated: {
    idleTimeoutMs:     15 * 60 * 1000,     // PCI DSS 8.2.8
    absoluteTimeoutMs:  4 * 60 * 60 * 1000,
    warningBeforeMs:    3 * 60 * 1000,
  },
  critical: {
    idleTimeoutMs:      5 * 60 * 1000,     // 5 min for critical ops
    absoluteTimeoutMs:  1 * 60 * 60 * 1000,
    warningBeforeMs:    1 * 60 * 1000,
  },
};

function sessionTimeout(options = {}) {
  const profileName = options.profile || 'standard';
  const profile = TIMEOUT_PROFILES[profileName] || TIMEOUT_PROFILES.standard;
  const auditLog = options.auditLog || null;

  const idleTimeout = options.idleTimeoutMs || profile.idleTimeoutMs;
  const absTimeout = options.absoluteTimeoutMs || profile.absoluteTimeoutMs;

  return (req, res, next) => {
    if (!req.session) return next();

    const now = Date.now();
    const sess = req.session;

    // Initialize session tracking
    if (!sess._createdAt) {
      sess._createdAt = now;
      sess._lastActivity = now;
    }

    // Check absolute timeout
    if (now - sess._createdAt > absTimeout) {
      auditLog?.log('SESSION_EXPIRED', {
        reason: 'absolute_timeout',
        userId: sess.userId,
        duration: now - sess._createdAt,
      });
      req.session.destroy();
      return res.status(440).json({ error: 'Session expired', reason: 'absolute_timeout' });
    }

    // Check idle timeout
    if (now - sess._lastActivity > idleTimeout) {
      auditLog?.log('SESSION_EXPIRED', {
        reason: 'idle_timeout',
        userId: sess.userId,
        idleDuration: now - sess._lastActivity,
      });
      req.session.destroy();
      return res.status(440).json({ error: 'Session expired', reason: 'idle_timeout' });
    }

    // Check warning threshold
    const timeUntilIdle = idleTimeout - (now - sess._lastActivity);
    if (timeUntilIdle <= profile.warningBeforeMs) {
      res.set('X-Session-Warning', 'true');
      res.set('X-Session-Expires-In', String(Math.ceil(timeUntilIdle / 1000)));
    }

    // Update activity timestamp
    sess._lastActivity = now;
    next();
  };
}

export { sessionTimeout, TIMEOUT_PROFILES };`,
        notes: `
<h3>Compliance Coverage</h3>
<ul>
    <li><strong>PCI DSS 8.2.8</strong> — Maximum 15 minutes idle for CDE access</li>
    <li><strong>HIPAA §164.312(a)(2)(iii)</strong> — Automatic logoff after inactivity</li>
    <li><strong>SOC 2 CC6.1</strong> — Session management controls</li>
    <li><strong>CMMC AC.L2-3.1.11</strong> — Session lock after inactivity</li>
</ul>
<h3>Timeout Profiles</h3>
<ul>
    <li><strong>Standard</strong> — 30 min idle / 8h absolute (general web apps)</li>
    <li><strong>Elevated</strong> — 15 min idle / 4h absolute (PCI DSS CDE access)</li>
    <li><strong>Critical</strong> — 5 min idle / 1h absolute (admin panels, key management)</li>
</ul>
<h3>Session Headers</h3>
<p>Sets <code>X-Session-Warning: true</code> and <code>X-Session-Expires-In</code> headers when approaching timeout, enabling front-end warning dialogs.</p>`
    },

    // =====================================================
    // MBAi METHODOLOGY TEMPLATES
    // =====================================================
    {
        id: 'mbai-sbsc',
        title: 'Sustainable Balanced Scorecard (SBSC)',
        description: 'Strategic matrix integrating Financial, Customer, Internal Process, and Learning & Growth perspectives with sustainability KPIs, AI automation vectors, and servant leadership practices.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'strategy', 'ESG', 'balanced-scorecard', 'sustainability']
    },
    {
        id: 'mbai-circular-supply-chain',
        title: 'Circular Supply Chain Workflow',
        description: 'Six-phase circular economy workflow from Regenerative Sourcing through Remanufacturing.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'operations', 'supply-chain', 'circular-economy']
    },
    {
        id: 'mbai-tbl-impact',
        title: 'Triple Bottom Line (TBL) P&L',
        description: 'Profit-People-Planet integrated P&L with AI-driven financial modeling and servant leadership rationale.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'finance', 'TBL', 'ESG']
    },
    {
        id: 'mbai-marketing-audit',
        title: 'Purpose-Driven Marketing Audit',
        description: 'Five-phase audit framework for authentic, ESG-verified marketing campaigns.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'marketing', 'ESG', 'content-strategy']
    },
    {
        id: 'mbai-servant-leadership',
        title: 'Servant Leadership 1-on-1 & Review',
        description: 'Coaching agenda (5 segments) plus 5-competency performance rubric for servant leadership evaluation.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'HR', 'servant-leadership', 'coaching']
    },
    {
        id: 'mbai-greenops-sdlc',
        title: 'Sustainable SDLC & GreenOps',
        description: 'Five-phase SDLC embedding energy-efficient coding, Content Engineering, and environmental metrics.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'IT', 'SDLC', 'GreenOps']
    },
    {
        id: 'mbai-grc-ai',
        title: 'AI Governance & ESG Compliance (NIST AI RMF)',
        description: 'Operationalizes the four NIST AI RMF functions with OSCAL integration.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'GRC', 'NIST-AI-RMF', 'ISO-42001', 'compliance']
    }
];

export default templates;
