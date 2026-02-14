// Template Library Data - Complete Collection
// All templates with proper escaping for Vite build

export const templates = [
    // =====================================================
    // FORM TEMPLATES
    // =====================================================
    {
        id: 'contact-form-validation',
        title: 'Contact Form with Validation',
        description: 'Complete contact form with client and server-side validation, error handling, and user feedback.',
        category: 'forms',
        language: 'JavaScript',
        tags: ['validation', 'forms', 'frontend'],
        timeSaved: 4,
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
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) errorEl.textContent = message;
    }
    
    clearErrors() {
        this.form.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const errorEl = group.querySelector('.error-message');
            if (errorEl) errorEl.textContent = '';
        });
    }
    
    showSuccess(message) { this.showMessage('success', message); }
    showError(message) { this.showMessage('error', message); }
    
    showMessage(type, text) {
        const messageEl = this.form.querySelector('.form-message');
        messageEl.className = 'form-message ' + type;
        messageEl.textContent = text;
        messageEl.style.display = 'block';
    }
}

// Usage
const contactForm = new ContactFormValidator('contactForm');`,
        usage: '<h3>How to Use</h3><ol><li>Include the validator class in your JavaScript file</li><li>Add proper HTML structure with form-group classes</li><li>Initialize with form ID</li><li>Customize validation rules as needed</li></ol><h3>Required HTML Structure</h3><pre><code>&lt;form id="contactForm"&gt;\n    &lt;div class="form-group"&gt;\n        &lt;label for="name"&gt;Name&lt;/label&gt;\n        &lt;input type="text" id="name" name="name"&gt;\n        &lt;span class="error-message"&gt;&lt;/span&gt;\n    &lt;/div&gt;\n    &lt;!-- More fields... --&gt;\n    &lt;div class="form-message"&gt;&lt;/div&gt;\n&lt;/form&gt;</code></pre>',
        notes: '<h3>Features</h3><ul><li>Real-time validation</li><li>Custom error messages</li><li>Email format validation</li><li>Async form submission</li><li>Error and success states</li></ul><h3>Customization</h3><p>Easily extend validation rules in the validate() method. Add custom validators for phone numbers, URLs, or any field-specific logic.</p>'
    },

    // =====================================================
    // AUTHENTICATION TEMPLATES
    // =====================================================
    {
        id: 'jwt-auth-middleware',
        title: 'JWT Authentication Middleware',
        description: 'Express middleware for JWT token validation with role-based access control.',
        category: 'auth',
        language: 'JavaScript',
        tags: ['jwt', 'auth', 'middleware', 'backend'],
        timeSaved: 5,
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

// Generate Tokens
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
        usage: '<h3>Usage in Express Routes</h3><pre><code>import { authenticateToken, requireRole } from \'./middleware/auth.js\';\n\n// Protected route - any authenticated user\napp.get(\'/api/profile\', authenticateToken, (req, res) => {\n    res.json({ user: req.user });\n});\n\n// Admin-only route\napp.delete(\'/api/users/:id\', \n    authenticateToken, \n    requireRole(\'admin\'), \n    (req, res) => {\n        // Delete user logic\n    }\n);\n\n// Multiple roles allowed\napp.post(\'/api/content\', \n    authenticateToken, \n    requireRole(\'admin\', \'editor\'), \n    (req, res) => {\n        // Create content logic\n    }\n);</code></pre>',
        notes: '<h3>Environment Variables Required</h3><ul><li><code>JWT_SECRET</code> - Secret key for access tokens</li><li><code>JWT_REFRESH_SECRET</code> - Secret key for refresh tokens</li></ul><h3>Security Best Practices</h3><ul><li>Use strong, random secrets (minimum 32 characters)</li><li>Store tokens securely (httpOnly cookies recommended)</li><li>Implement token refresh mechanism</li><li>Set appropriate expiration times</li><li>Never expose JWT_SECRET in client-side code</li></ul>'
    },

    // =====================================================
    // DATABASE TEMPLATES
    // =====================================================
    {
        id: 'crud-database-model',
        title: 'CRUD Database Model',
        description: 'Generic CRUD operations class for SQLite with better-sqlite3, easily adaptable to any table.',
        category: 'database',
        language: 'JavaScript',
        tags: ['database', 'crud', 'sqlite', 'backend'],
        timeSaved: 6,
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
        
        const sql = "INSERT INTO " + this.table + " (" + keys.join(', ') + ") VALUES (" + placeholders + ")";
        
        const result = this.db.prepare(sql).run(...values);
        return this.findById(result.lastInsertRowid);
    }
    
    // Read - Find by ID
    findById(id) {
        const sql = "SELECT * FROM " + this.table + " WHERE id = ?";
        return this.db.prepare(sql).get(id);
    }
    
    // Read - Find all with optional filters
    findAll(filters = {}, orderBy = 'id DESC', limit = null) {
        let sql = "SELECT * FROM " + this.table;
        const values = [];
        
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map(key => {
                values.push(filters[key]);
                return key + " = ?";
            });
            sql += " WHERE " + conditions.join(' AND ');
        }
        
        sql += " ORDER BY " + orderBy;
        
        if (limit) {
            sql += " LIMIT " + limit;
        }
        
        return this.db.prepare(sql).all(...values);
    }
    
    // Update
    update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => key + " = ?").join(', ');
        
        const sql = "UPDATE " + this.table + " SET " + setClause + ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        this.db.prepare(sql).run(...values, id);
        return this.findById(id);
    }
    
    // Delete
    delete(id) {
        const sql = "DELETE FROM " + this.table + " WHERE id = ?";
        const result = this.db.prepare(sql).run(id);
        return result.changes > 0;
    }
    
    // Count
    count(filters = {}) {
        let sql = "SELECT COUNT(*) as count FROM " + this.table;
        const values = [];
        
        if (Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters).map(key => {
                values.push(filters[key]);
                return key + " = ?";
            });
            sql += " WHERE " + conditions.join(' AND ');
        }
        
        return this.db.prepare(sql).get(...values).count;
    }
    
    // Search
    search(field, query) {
        const sql = "SELECT * FROM " + this.table + " WHERE " + field + " LIKE ? ORDER BY id DESC";
        return this.db.prepare(sql).all("%" + query + "%");
    }
}

// Usage Example
export class ClientModel extends DatabaseModel {
    constructor(db) {
        super('clients', db);
    }
    
    // Custom method specific to clients
    findByEmail(email) {
        const sql = "SELECT * FROM " + this.table + " WHERE email = ?";
        return this.db.prepare(sql).get(email);
    }
    
    // Find clients with active status
    findActive() {
        return this.findAll({ status: 'active' });
    }
}

export default DatabaseModel;`,
        usage: '<h3>Usage Example</h3><pre><code>import Database from \'better-sqlite3\';\nimport { ClientModel } from \'./models/ClientModel.js\';\n\nconst db = new Database(\'./database.db\');\nconst clients = new ClientModel(db);\n\n// Create\nconst newClient = clients.create({\n    name: \'John Doe\',\n    email: \'john@example.com\',\n    status: \'active\'\n});\n\n// Read\nconst client = clients.findById(1);\nconst allClients = clients.findAll();\nconst activeClients = clients.findActive();\n\n// Update\nconst updated = clients.update(1, {\n    name: \'Jane Doe\',\n    email: \'jane@example.com\'\n});\n\n// Delete\nconst deleted = clients.delete(1);\n\n// Search\nconst results = clients.search(\'name\', \'John\');</code></pre>',
        notes: '<h3>Features</h3><ul><li>Generic CRUD operations for any table</li><li>Automatic timestamp handling</li><li>Flexible filtering and sorting</li><li>Search functionality</li><li>Easy to extend for specific models</li></ul><h3>Database Schema Requirements</h3><p>Tables should have:</p><ul><li><code>id</code> - Primary key (INTEGER AUTOINCREMENT)</li><li><code>created_at</code> - Timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)</li><li><code>updated_at</code> - Timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)</li></ul>'
    },

    // =====================================================
    // API TEMPLATES
    // =====================================================
    {
        id: 'rest-api-controller',
        title: 'RESTful API Controller Pattern',
        description: 'Standard REST API controller with proper HTTP methods, error handling, and validation.',
        category: 'api',
        language: 'JavaScript',
        tags: ['api', 'rest', 'express', 'backend'],
        timeSaved: 8,
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
        usage: '<h3>Usage in Express App</h3><pre><code>import ClientController from \'./controllers/ClientController.js\';\nimport { ClientModel } from \'./models/ClientModel.js\';\n\n// Initialize\nconst clientModel = new ClientModel(db);\nconst clientController = new ClientController(clientModel);\n\n// Mount router\napp.use(\'/api/clients\', clientController.getRouter());\n\n// API endpoints are now available:\n// GET    /api/clients          - List all clients\n// GET    /api/clients/:id      - Get single client\n// POST   /api/clients          - Create client\n// PUT    /api/clients/:id      - Update client\n// DELETE /api/clients/:id      - Delete client</code></pre>',
        notes: '<h3>Features</h3><ul><li>Standard REST conventions</li><li>Built-in validation</li><li>Pagination support</li><li>Error handling</li><li>Easy to extend</li></ul><h3>Extending the Controller</h3><p>Create custom controllers by extending ResourceController:</p><ul><li>Override <code>validationRules()</code> for custom validation</li><li>Add custom methods for specific endpoints</li><li>Override base methods for custom logic</li></ul>'
    },

    {
        id: 'api-client-wrapper',
        title: 'API Client Wrapper',
        description: 'Simplified fetch wrapper with authentication, error handling, and request/response interceptors.',
        category: 'api',
        language: 'JavaScript',
        tags: ['api', 'fetch', 'http', 'utilities'],
        timeSaved: 4,
        code: `// API Client Wrapper
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
            headers['Authorization'] = 'Bearer ' + this.authToken;
        }
        
        return headers;
    }
    
    // Make request with timeout
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
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
        const url = queryString ? endpoint + '?' + queryString : endpoint;
        
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

export default ApiClient;`,
        usage: '<h3>Setup</h3><pre><code>import ApiClient from \'./utils/ApiClient.js\';\n\n// Initialize\nconst api = new ApiClient(\'/api\', {\n    authToken: localStorage.getItem(\'token\'),\n    timeout: 10000\n});\n\n// Update token later\napi.setAuthToken(newToken);</code></pre><h3>Usage Examples</h3><pre><code>// GET request\nconst users = await api.get(\'/users\');\n\n// GET with query params\nconst filtered = await api.get(\'/users\', { \n    status: \'active\', \n    role: \'admin\' \n});\n\n// POST request\nconst newUser = await api.post(\'/users\', {\n    name: \'John Doe\',\n    email: \'john@example.com\'\n});\n\n// PUT request\nconst updated = await api.put(\'/users/1\', {\n    name: \'Jane Doe\'\n});\n\n// DELETE request\nawait api.delete(\'/users/1\');\n\n// Error handling\ntry {\n    const data = await api.get(\'/protected\');\n} catch (error) {\n    if (error.status === 401) {\n        // Redirect to login\n    } else if (error.status === 403) {\n        // Show permission error\n    }\n}</code></pre>',
        notes: '<h3>Features</h3><ul><li>Automatic JSON handling</li><li>Built-in authentication</li><li>Request timeout</li><li>Query string building</li><li>Error standardization</li><li>All HTTP methods</li></ul><h3>Extending</h3><p>Add interceptors for logging, retry logic, or custom error handling:</p><ul><li>Override <code>handleResponse()</code> for response transformation</li><li>Override <code>handleError()</code> for custom error handling</li><li>Add retry logic in <code>request()</code> method</li></ul>'
    },

    // =====================================================
    // UI COMPONENTS
    // =====================================================
    {
        id: 'modal-component',
        title: 'Reusable Modal Component',
        description: 'Flexible modal dialog component with customizable content, animations, and accessibility features.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['ui', 'modal', 'component', 'frontend'],
        timeSaved: 4,
        code: `class Modal {
    constructor(options = {}) {
        this.options = {
            id: options.id || 'modal',
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium',
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
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.id = this.options.id;
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        
        const content = document.createElement('div');
        content.className = 'modal-content modal-' + this.options.size;
        
        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = '<h2>' + this.options.title + '</h2><button class="modal-close" aria-label="Close">&times;</button>';
        
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
    footer: '<button class="btn btn-secondary" onclick="myModal.close()">Cancel</button><button class="btn btn-primary" onclick="handleConfirm()">Confirm</button>',
    onOpen: (modal) => console.log('Modal opened'),
    onClose: (modal) => console.log('Modal closed')
});

myModal.open();`,
        usage: '<h3>Basic Usage</h3><pre><code>// Simple modal\nconst modal = new Modal({\n    title: \'Hello World\',\n    content: \'&lt;p&gt;This is a modal&lt;/p&gt;\'\n});\n\nmodal.open();\n\n// Modal with form\nconst formModal = new Modal({\n    title: \'Edit Profile\',\n    content: document.getElementById(\'profileForm\'),\n    size: \'large\',\n    closeOnOverlay: false\n});\n\n// Update content dynamically\nmodal.setContent(\'&lt;p&gt;Updated content&lt;/p&gt;\');\n\n// Clean up when done\nmodal.destroy();</code></pre>',
        notes: '<h3>Features</h3><ul><li>Accessible (ARIA attributes, keyboard navigation)</li><li>Customizable sizes (small, medium, large)</li><li>Optional footer for actions</li><li>Event callbacks (onOpen, onClose)</li><li>Dynamic content updates</li><li>Escape key to close</li><li>Overlay click to close (optional)</li></ul><h3>CSS Required</h3><p>Make sure you have the modal CSS from the components stylesheet included in your project.</p>'
    },

    {
        id: 'notification-system',
        title: 'Toast Notification System',
        description: 'Lightweight notification system with multiple types, auto-dismiss, and animations.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['notifications', 'toast', 'ui', 'feedback'],
        timeSaved: 3,
        code: `// Toast Notification System
class NotificationManager {
    constructor(options = {}) {
        this.container = null;
        this.position = options.position || 'top-right';
        this.duration = options.duration || 3000;
        this.init();
    }
    
    init() {
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container ' + this.position;
            document.body.appendChild(this.container);
            this.injectStyles();
        } else {
            this.container = document.getElementById('notification-container');
        }
    }
    
    show(message, type = 'info', duration = this.duration) {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        
        const icon = this.getIcon(type);
        notification.innerHTML = '<span class="notification-icon">' + icon + '</span><span class="notification-message">' + message + '</span><button class="notification-close">×</button>';
        
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
        style.textContent = ".notification-container { position: fixed; z-index: 9999; pointer-events: none; } .notification-container.top-right { top: 20px; right: 20px; } .notification-container.top-left { top: 20px; left: 20px; } .notification-container.bottom-right { bottom: 20px; right: 20px; } .notification-container.bottom-left { bottom: 20px; left: 20px; } .notification { display: flex; align-items: center; gap: 12px; padding: 16px 20px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); background: white; pointer-events: all; min-width: 300px; max-width: 400px; transform: translateX(400px); opacity: 0; transition: all 0.3s ease; } .notification.show { transform: translateX(0); opacity: 1; } .notification.hide { transform: translateX(400px); opacity: 0; } .notification-success { background: #d1fae5; color: #065f46; border-left: 4px solid #10b981; } .notification-error { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; } .notification-warning { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; } .notification-info { background: #dbeafe; color: #1e40af; border-left: 4px solid #3b82f6; } .notification-icon { font-size: 20px; font-weight: bold; } .notification-message { flex: 1; font-size: 14px; } .notification-close { background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; } .notification-close:hover { opacity: 1; }";
        document.head.appendChild(style);
    }
}

export default NotificationManager;`,
        usage: '<h3>Basic Usage</h3><pre><code>import NotificationManager from \'./utils/NotificationManager.js\';\n\n// Initialize\nconst notify = new NotificationManager({\n    position: \'top-right\',\n    duration: 3000\n});\n\n// Show notifications\nnotify.success(\'Changes saved successfully!\');\nnotify.error(\'Failed to save changes\');\nnotify.warning(\'Session will expire soon\');\nnotify.info(\'New updates available\');\n\n// Custom duration\nnotify.success(\'Auto-dismiss in 5s\', 5000);\n\n// No auto-dismiss\nnotify.info(\'Click X to close\', 0);</code></pre><h3>In Forms</h3><pre><code>// Form submission\ntry {\n    await api.post(\'/users\', formData);\n    notify.success(\'User created successfully!\');\n    form.reset();\n} catch (error) {\n    notify.error(error.message || \'Failed to create user\');\n}</code></pre>',
        notes: '<h3>Features</h3><ul><li>Four notification types (success, error, warning, info)</li><li>Multiple position options</li><li>Auto-dismiss with configurable duration</li><li>Manual close button</li><li>Smooth animations</li><li>Stacking support</li><li>No dependencies</li></ul><h3>Customization</h3><p>Modify <code>injectStyles()</code> to change:</p><ul><li>Colors and themes</li><li>Animation styles</li><li>Size and spacing</li><li>Icons (use icon libraries)</li></ul>'
    },

    {
        id: 'loading-state-manager',
        title: 'Loading State Manager',
        description: 'Manage loading states for buttons, forms, and page sections with consistent UI feedback.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['loading', 'ui', 'state', 'spinner'],
        timeSaved: 3,
        code: `// Loading State Manager
class LoadingManager {
    // Set button loading state
    static setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="btn-loading-spinner"></span><span>' + loadingText + '</span>';
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
        overlay.innerHTML = '<div class="loading-spinner"><div class="spinner"></div>' + (message ? '<p class="loading-message">' + message + '</p>' : '') + '</div>';
        
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
        style.textContent = ".btn-loading { opacity: 0.7; cursor: not-allowed; } .btn-loading-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px; } .loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; } .loading-spinner { text-align: center; } .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; } .loading-message { color: #666; font-size: 14px; margin: 0; } .skeleton-loader { padding: 16px; } .skeleton-line { height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; margin-bottom: 12px; } .skeleton-line:last-child { width: 60%; margin-bottom: 0; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }";
        document.head.appendChild(style);
    }
}

// Auto-inject styles
if (typeof document !== 'undefined') {
    LoadingManager.injectStyles();
}

export default LoadingManager;`,
        usage: '<h3>Button Loading</h3><pre><code>import LoadingManager from \'./utils/LoadingManager.js\';\n\nconst button = document.getElementById(\'submitBtn\');\n\n// Start loading\nLoadingManager.setButtonLoading(button, true, \'Saving...\');\n\ntry {\n    await api.post(\'/data\', formData);\n    // Success\n} finally {\n    // Stop loading\n    LoadingManager.setButtonLoading(button, false);\n}</code></pre><h3>Section Overlay</h3><pre><code>const section = document.getElementById(\'dataSection\');\n\n// Show overlay\nLoadingManager.showOverlay(section, \'Loading data...\');\n\nconst data = await api.get(\'/data\');\n\n// Hide overlay\nLoadingManager.hideOverlay(section);</code></pre><h3>Skeleton Loader</h3><pre><code>const container = document.getElementById(\'content\');\n\n// Show skeleton while loading\nLoadingManager.showSkeleton(container, 5);\n\nconst content = await api.get(\'/content\');\n\n// Replace with actual content\ncontainer.innerHTML = content;</code></pre>',
        notes: '<h3>Features</h3><ul><li>Button loading states</li><li>Full element overlays</li><li>Skeleton loaders</li><li>Auto-injected styles</li><li>Customizable messages</li></ul><h3>Best Practices</h3><ul><li>Always use try-finally to ensure loading state is cleared</li><li>Provide meaningful loading messages</li><li>Use skeletons for content-heavy sections</li><li>Use button loading for forms</li><li>Use overlays for entire sections</li></ul>'
    },

    {
        id: 'data-table-component',
        title: 'Data Table with Search & Filter',
        description: 'Feature-rich data table with search, sort, filter, and pagination capabilities.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['table', 'data', 'search', 'filter', 'pagination'],
        timeSaved: 8,
        code: `// Data Table Component
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
        let html = '<div class="datatable-wrapper">';
        
        if (this.searchable) {
            html += this.renderSearch();
        }
        if (this.filterable.length) {
            html += this.renderFilters();
        }
        
        html += '<div class="datatable-table-wrapper"><table class="datatable"><thead>' + this.renderHeader() + '</thead><tbody>' + this.renderBody() + '</tbody></table></div>';
        html += this.renderPagination();
        html += '</div>';
        
        this.container.innerHTML = html;
        this.attachEvents();
    }
    
    renderSearch() {
        return '<div class="datatable-search"><input type="text" class="datatable-search-input" placeholder="Search..." value="' + this.searchTerm + '"></div>';
    }
    
    renderFilters() {
        let html = '<div class="datatable-filters">';
        this.filterable.forEach(filter => {
            html += '<select class="datatable-filter" data-column="' + filter.column + '"><option value="">' + filter.label + '</option>';
            filter.options.forEach(opt => {
                html += '<option value="' + opt.value + '">' + opt.label + '</option>';
            });
            html += '</select>';
        });
        html += '</div>';
        return html;
    }
    
    renderHeader() {
        let html = '<tr>';
        this.columns.forEach(col => {
            const sortClass = this.sortable && col.sortable !== false ? 'sortable' : '';
            const sortIndicator = this.sortColumn === col.field ? (this.sortDirection === 'asc' ? ' ↑' : ' ↓') : '';
            html += '<th class="' + sortClass + '" data-column="' + col.field + '">' + col.label + sortIndicator + '</th>';
        });
        html += '</tr>';
        return html;
    }
    
    renderBody() {
        const filtered = this.getFilteredData();
        const paginated = this.getPaginatedData(filtered);
        
        if (paginated.length === 0) {
            return '<tr><td colspan="' + this.columns.length + '" class="datatable-empty">No data found</td></tr>';
        }
        
        let html = '';
        paginated.forEach(row => {
            html += '<tr>';
            this.columns.forEach(col => {
                const value = col.render ? col.render(row[col.field], row) : row[col.field];
                html += '<td>' + value + '</td>';
            });
            html += '</tr>';
        });
        return html;
    }
    
    renderPagination() {
        const filtered = this.getFilteredData();
        const totalPages = Math.ceil(filtered.length / this.pageSize);
        
        if (totalPages <= 1) return '';
        
        return '<div class="datatable-pagination"><button class="datatable-page-btn" data-action="prev"' + (this.currentPage === 1 ? ' disabled' : '') + '>Previous</button><span class="datatable-page-info">Page ' + this.currentPage + ' of ' + totalPages + '</span><button class="datatable-page-btn" data-action="next"' + (this.currentPage === totalPages ? ' disabled' : '') + '>Next</button></div>';
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
                    String(row[col.field]).toLowerCase().includes(this.searchTerm.toLowerCase())
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

export default DataTable;`,
        usage: '<h3>HTML Setup</h3><pre><code>&lt;div id="myTable"&gt;&lt;/div&gt;</code></pre><h3>JavaScript Usage</h3><pre><code>import DataTable from \'./components/DataTable.js\';\n\nconst table = new DataTable(\'myTable\', {\n    data: [\n        { id: 1, name: \'John Doe\', email: \'john@example.com\', status: \'active\' },\n        { id: 2, name: \'Jane Smith\', email: \'jane@example.com\', status: \'inactive\' }\n    ],\n    columns: [\n        { field: \'id\', label: \'ID\', sortable: true },\n        { field: \'name\', label: \'Name\', sortable: true },\n        { field: \'email\', label: \'Email\' },\n        { field: \'status\', label: \'Status\' }\n    ],\n    searchable: true,\n    sortable: true,\n    filterable: [\n        {\n            column: \'status\',\n            label: \'Filter by Status\',\n            options: [\n                { value: \'active\', label: \'Active\' },\n                { value: \'inactive\', label: \'Inactive\' }\n            ]\n        }\n    ],\n    pageSize: 10\n});\n\n// Update data later\ntable.setData(newData);</code></pre>',
        notes: '<h3>Features</h3><ul><li>Search across all columns</li><li>Column sorting</li><li>Multiple filters</li><li>Pagination</li><li>Custom cell rendering</li><li>No dependencies</li></ul><h3>Customization</h3><p>Add CSS for styling:</p><ul><li><code>.datatable</code> - Table styling</li><li><code>.datatable-search-input</code> - Search box</li><li><code>.datatable-filter</code> - Filter dropdowns</li><li><code>.datatable-pagination</code> - Pagination controls</li></ul>'
    },

    // =====================================================
    // EMAIL TEMPLATES
    // =====================================================
    {
        id: 'email-service',
        title: 'Email Service with Templates',
        description: 'Nodemailer email service with HTML templates and fallback plain text.',
        category: 'email',
        language: 'JavaScript',
        tags: ['email', 'nodemailer', 'templates', 'backend'],
        timeSaved: 6,
        code: `import nodemailer from 'nodemailer';

class EmailService {
    constructor(config) {
        this.transporter = nodemailer.createTransport({
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
    
    htmlToText(html) {
        return html
            .replace(/<style[^>]*>.*<\\/style>/gs, '')
            .replace(/<script[^>]*>.*<\\/script>/gs, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\\s+/g, ' ')
            .trim();
    }
    
    async sendWelcomeEmail(user) {
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .header { background: #2563eb; color: white; padding: 20px; text-align: center; } .content { padding: 20px; background: #f9fafb; } .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; } .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }</style></head><body><div class="container"><div class="header"><h1>Welcome to Our Platform!</h1></div><div class="content"><p>Hi ' + user.name + ',</p><p>Thank you for joining us! We\'re excited to have you on board.</p><p>You can now access all the features of your account:</p><ul><li>Manage your profile</li><li>Access exclusive content</li><li>Connect with other members</li></ul><p style="text-align: center; margin: 30px 0;"><a href="' + process.env.APP_URL + '/dashboard" class="button">Get Started</a></p></div><div class="footer"><p>&copy; 2026 Your Company. All rights reserved.</p></div></div></body></html>';
        
        return this.send(user.email, 'Welcome to Our Platform!', html);
    }
    
    async sendPasswordReset(user, resetToken) {
        const resetUrl = process.env.APP_URL + '/reset-password?token=' + resetToken;
        
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .content { padding: 20px; background: #f9fafb; } .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; } .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; }</style></head><body><div class="container"><div class="content"><h2>Password Reset Request</h2><p>Hi ' + user.name + ',</p><p>We received a request to reset your password. Click the button below to create a new password:</p><p style="text-align: center; margin: 30px 0;"><a href="' + resetUrl + '" class="button">Reset Password</a></p><div class="warning"><p><strong>Security Notice:</strong></p><p>This link will expire in 1 hour. If you didn\'t request this reset, please ignore this email.</p></div><p>Or copy and paste this URL into your browser:</p><p style="word-break: break-all; color: #6b7280; font-size: 14px;">' + resetUrl + '</p></div></div></body></html>';
        
        return this.send(user.email, 'Password Reset Request', html);
    }
    
    async sendContactNotification(formData) {
        const html = '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>New Contact Form Submission</h2><p><strong>From:</strong> ' + formData.name + ' (' + formData.email + ')</p>' + (formData.company ? '<p><strong>Company:</strong> ' + formData.company + '</p>' : '') + '<p><strong>Subject:</strong> ' + formData.subject + '</p><hr><p><strong>Message:</strong></p><p>' + formData.message.replace(/\\n/g, '<br>') + '</p><hr><p style="color: #6b7280; font-size: 14px;"><em>Sent from contact form on ' + new Date().toLocaleString() + '</em></p></body></html>';
        
        return this.send(process.env.ADMIN_EMAIL, 'Contact Form: ' + formData.subject, html);
    }
}

export default EmailService;`,
        usage: '<h3>Setup and Usage</h3><pre><code>import EmailService from \'./services/EmailService.js\';\n\n// Initialize service\nconst emailService = new EmailService({\n    host: process.env.EMAIL_HOST,\n    port: process.env.EMAIL_PORT,\n    user: process.env.EMAIL_USER,\n    password: process.env.EMAIL_PASSWORD,\n    from: process.env.EMAIL_FROM\n});\n\n// Send welcome email\nawait emailService.sendWelcomeEmail({\n    name: \'John Doe\',\n    email: \'john@example.com\'\n});\n\n// Send password reset\nawait emailService.sendPasswordReset(user, resetToken);\n\n// Send custom email\nawait emailService.send(\n    \'user@example.com\',\n    \'Custom Subject\',\n    \'&lt;h1&gt;Custom HTML&lt;/h1&gt;\'\n);</code></pre>',
        notes: '<h3>Required Environment Variables</h3><ul><li><code>EMAIL_HOST</code> - SMTP server (e.g., smtp.gmail.com)</li><li><code>EMAIL_PORT</code> - Port number (587 for TLS)</li><li><code>EMAIL_USER</code> - SMTP username</li><li><code>EMAIL_PASSWORD</code> - SMTP password/app password</li><li><code>EMAIL_FROM</code> - Sender email address</li><li><code>APP_URL</code> - Your application URL</li></ul><h3>Gmail Setup</h3><p>For Gmail, use App Passwords:</p><ol><li>Enable 2-factor authentication</li><li>Generate app password in Google Account settings</li><li>Use the app password in EMAIL_PASSWORD</li></ol>'
    },

    // =====================================================
    // UTILITY TEMPLATES
    // =====================================================
    {
        id: 'local-storage-manager',
        title: 'LocalStorage Manager',
        description: 'Type-safe localStorage wrapper with JSON serialization, expiration, and error handling.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['storage', 'state', 'utilities'],
        timeSaved: 2,
        code: `// LocalStorage Manager
class StorageManager {
    constructor(prefix = 'app') {
        this.prefix = prefix;
    }
    
    getKey(key) {
        return this.prefix + '_' + key;
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
            
            localStorage.setItem(this.getKey(key), JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    // Get item with expiration check
    get(key, defaultValue = null) {
        try {
            const itemStr = localStorage.getItem(this.getKey(key));
            
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
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    // Clear all items with prefix
    clear() {
        try {
            const prefix = this.prefix + '_';
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => localStorage.removeItem(key));
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
        const prefix = this.prefix + '_';
        return Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .map(key => key.replace(prefix, ''));
    }
}

export default StorageManager;`,
        usage: '<h3>Basic Usage</h3><pre><code>import StorageManager from \'./utils/StorageManager.js\';\n\nconst storage = new StorageManager(\'myApp\');\n\n// Set item\nstorage.set(\'user\', { id: 1, name: \'John\' });\n\n// Set with expiration (30 minutes)\nstorage.set(\'authToken\', \'abc123\', 30);\n\n// Get item\nconst user = storage.get(\'user\');\nconst token = storage.get(\'authToken\', \'default\');\n\n// Check existence\nif (storage.has(\'user\')) {\n    console.log(\'User exists\');\n}\n\n// Remove item\nstorage.remove(\'user\');\n\n// Get all keys\nconst keys = storage.keys();\n\n// Clear all app data\nstorage.clear();</code></pre>',
        notes: '<h3>Features</h3><ul><li>Automatic JSON serialization/deserialization</li><li>Optional expiration time</li><li>Namespacing with prefix</li><li>Error handling</li><li>Default values</li><li>Key enumeration</li></ul><h3>Best Practices</h3><ul><li>Use unique prefix for each app/module</li><li>Set appropriate expiration for sensitive data</li><li>Always provide default values when getting</li><li>Clear storage on logout</li><li>Don\'t store sensitive data (passwords, etc.)</li></ul>'
    },

    {
        id: 'validation-utilities',
        title: 'Validation Utility Functions',
        description: 'Collection of common validation functions for forms, APIs, and data processing.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['validation', 'utilities', 'helpers'],
        timeSaved: 4,
        code: `// Validation Utilities
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
    
    // Strong password
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
    
    // Username
    isUsername(username) {
        return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
    },
    
    // File validation
    isValidFileSize(fileSize, maxSizeMB) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        return fileSize <= maxBytes;
    },
    
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
    }
};

// Sanitization utilities
const Sanitizers = {
    stripHTML(str) {
        return str.replace(/<[^>]*>/g, '');
    },
    
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
    
    cleanPhone(phone) {
        return phone.replace(/\\D/g, '');
    },
    
    normalizeWhitespace(str) {
        return str.trim().replace(/\\s+/g, ' ');
    }
};

export { Validators, Sanitizers };`,
        usage: '<h3>Usage Examples</h3><pre><code>import { Validators, Sanitizers } from \'./utils/validators.js\';\n\n// Email validation\nif (!Validators.isEmail(\'user@example.com\')) {\n    console.log(\'Invalid email\');\n}\n\n// Password validation\nif (!Validators.isStrongPassword(password)) {\n    console.log(\'Password not strong enough\');\n}\n\n// Age check\nif (!Validators.isMinimumAge(\'1990-01-15\', 18)) {\n    console.log(\'Must be 18 or older\');\n}\n\n// File validation\nif (!Validators.hasValidExtension(filename, [\'jpg\', \'png\', \'gif\'])) {\n    console.log(\'Invalid file type\');\n}\n\n// Sanitization\nconst clean = Sanitizers.escapeHTML(userInput);\nconst phone = Sanitizers.cleanPhone(\'(555) 123-4567\');</code></pre>',
        notes: '<h3>Features</h3><ul><li>Email, phone, URL validation</li><li>Password strength checking</li><li>Credit card validation (Luhn algorithm)</li><li>Date and age validation</li><li>File validation (size, type)</li><li>HTML sanitization</li><li>String and number range checking</li></ul><h3>Best Practices</h3><ul><li>Always validate on both client and server</li><li>Provide clear error messages</li><li>Sanitize user input before storage/display</li><li>Use appropriate validation for your context</li></ul>'
    },

    {
        id: 'form-state-manager',
        title: 'Form State Manager',
        description: 'Centralized form state management with validation, dirty state tracking, and error handling.',
        category: 'forms',
        language: 'JavaScript',
        tags: ['forms', 'state', 'validation'],
        timeSaved: 5,
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
        this.fields = Array.from(this.form.elements).filter(
            el => el.name && el.type !== 'submit'
        );
        
        this.fields.forEach(field => {
            this.state.values[field.name] = this.getFieldValue(field);
        });
        
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
            const checked = this.form.querySelector('input[name="' + field.name + '"]:checked');
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
                const radio = this.form.querySelector('input[name="' + fieldName + '"][value="' + value + '"]');
                if (radio) radio.checked = true;
            } else {
                field.value = value;
            }
        }
    }
    
    handleChange(field) {
        const value = this.getFieldValue(field);
        this.state.values[field.name] = value;
        this.state.dirty = true;
        
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
        
        Object.keys(this.state.values).forEach(key => {
            this.state.touched[key] = true;
        });
        
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
        usage: '<h3>HTML Form</h3><pre><code>&lt;form id="myForm"&gt;\n    &lt;div class="form-group"&gt;\n        &lt;label&gt;Email&lt;/label&gt;\n        &lt;input type="email" name="email"&gt;\n    &lt;/div&gt;\n    &lt;div class="form-group"&gt;\n        &lt;label&gt;Password&lt;/label&gt;\n        &lt;input type="password" name="password"&gt;\n    &lt;/div&gt;\n    &lt;button type="submit"&gt;Submit&lt;/button&gt;\n&lt;/form&gt;</code></pre><h3>JavaScript Setup</h3><pre><code>import FormStateManager from \'./utils/FormStateManager.js\';\n\nconst form = new FormStateManager(\'myForm\', {\n    validators: {\n        email: (value) => {\n            if (!value) return \'Email is required\';\n            if (!/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(value)) {\n                return \'Invalid email address\';\n            }\n        },\n        password: (value) => {\n            if (!value) return \'Password is required\';\n            if (value.length < 8) return \'Password must be at least 8 characters\';\n        }\n    },\n    onSubmit: async (values) => {\n        console.log(\'Form values:\', values);\n        await api.post(\'/auth/login\', values);\n    }\n});</code></pre>',
        notes: '<h3>Features</h3><ul><li>Centralized state management</li><li>Field-level validation</li><li>Dirty state tracking</li><li>Touch state tracking</li><li>Error display</li><li>Support for all input types</li><li>Async form submission</li></ul><h3>Validation</h3><p>Validators receive:</p><ul><li><code>value</code> - Current field value</li><li><code>allValues</code> - All form values (for cross-field validation)</li></ul><p>Return error string if invalid, or nothing if valid.</p>'
    },

    {
        id: 'debounce-throttle',
        title: 'Debounce & Throttle Utilities',
        description: 'Performance optimization utilities for rate-limiting function calls.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['performance', 'utilities', 'optimization'],
        timeSaved: 2,
        code: `// Debounce: Wait for silence before executing
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
        usage: '<h3>Debounce - Search Input</h3><pre><code>import { debounce } from \'./utils/performanceUtils.js\';\n\n// Search API call only after user stops typing for 500ms\nconst searchInput = document.getElementById(\'search\');\n\nconst handleSearch = debounce(async (query) => {\n    const results = await api.get(\'/search\', { q: query });\n    displayResults(results);\n}, 500);\n\nsearchInput.addEventListener(\'input\', (e) => {\n    handleSearch(e.target.value);\n});</code></pre><h3>Throttle - Scroll Event</h3><pre><code>import { throttle } from \'./utils/performanceUtils.js\';\n\n// Check scroll position at most once per 100ms\nconst handleScroll = throttle(() => {\n    const scrollTop = window.pageYOffset;\n    const navbar = document.getElementById(\'navbar\');\n    \n    if (scrollTop > 100) {\n        navbar.classList.add(\'scrolled\');\n    } else {\n        navbar.classList.remove(\'scrolled\');\n    }\n}, 100);\n\nwindow.addEventListener(\'scroll\', handleScroll);</code></pre>',
        notes: '<h3>When to Use Each</h3><h4>Debounce</h4><ul><li><strong>Search inputs</strong>: Wait for user to stop typing</li><li><strong>Form validation</strong>: Validate after user finishes</li><li><strong>Window resize</strong>: Wait for resize to complete</li><li><strong>Autosave</strong>: Save after user stops editing</li></ul><h4>Throttle</h4><ul><li><strong>Scroll events</strong>: Check scroll position periodically</li><li><strong>Mouse move</strong>: Track movement at intervals</li><li><strong>API polling</strong>: Regular interval checks</li><li><strong>Button clicks</strong>: Prevent rapid submissions</li></ul><h3>Performance Impact</h3><p>Without debounce/throttle:</p><ul><li>Search input: 100+ API calls while typing</li><li>Scroll: 100+ events per second</li></ul><p>With debounce/throttle:</p><ul><li>Search: 1 API call after typing stops</li><li>Scroll: 10 events per second max</li></ul>'
    },

    {
        id: 'date-time-utils',
        title: 'Date & Time Utilities',
        description: 'Common date/time formatting and manipulation functions.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['date', 'time', 'formatting', 'utilities'],
        timeSaved: 3,
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
                    ? '1 ' + unit + ' ago'
                    : interval + ' ' + unit + 's ago';
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
        if (hours > 0) parts.push(hours + 'h');
        if (minutes > 0) parts.push(minutes + 'm');
        if (secs > 0 || parts.length === 0) parts.push(secs + 's');
        
        return parts.join(' ');
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
        usage: '<h3>Date Formatting</h3><pre><code>import DateUtils from \'./utils/DateUtils.js\';\n\nconst date = new Date();\n\n// Standard formats\nDateUtils.formatDate(date, \'MM/DD/YYYY\');  // "02/03/2026"\nDateUtils.formatDate(date, \'YYYY-MM-DD\');  // "2026-02-03"\nDateUtils.formatDate(date, \'DD/MM/YYYY\');  // "03/02/2026"\n\n// With time\nDateUtils.formatDate(date, \'MM/DD/YYYY HH:mm\'); // "02/03/2026 14:30"</code></pre><h3>Relative Time</h3><pre><code>const postDate = new Date(\'2026-02-01\');\nDateUtils.timeAgo(postDate);  // "2 days ago"\n\nconst commentDate = new Date(Date.now() - 3600000);\nDateUtils.timeAgo(commentDate);  // "1 hour ago"</code></pre><h3>Date Manipulation</h3><pre><code>const today = new Date();\nconst nextWeek = DateUtils.addDays(today, 7);\nconst lastMonth = DateUtils.addMonths(today, -1);\n\nconst start = new Date(\'2026-02-01\');\nconst end = new Date(\'2026-02-15\');\nconst days = DateUtils.daysBetween(start, end);  // 14\n\nDateUtils.formatDuration(3665);  // "1h 1m 5s"</code></pre>',
        notes: '<h3>Common Use Cases</h3><ul><li><strong>Display dates</strong>: formatDate() for user-friendly formats</li><li><strong>Social posts</strong>: timeAgo() for "5 minutes ago"</li><li><strong>Date ranges</strong>: daysBetween() for analytics</li><li><strong>Scheduling</strong>: addDays/addMonths() for future dates</li><li><strong>Timers</strong>: formatDuration() for elapsed time</li></ul><h3>Internationalization</h3><p>For production apps, consider using:</p><ul><li><code>Intl.DateTimeFormat</code> for locale-specific formatting</li><li><code>date-fns</code> or <code>dayjs</code> libraries for advanced features</li></ul>'
    },
    // COMPLIANCE TEMPLATES
    {
        id: 'rbac-middleware',
        title: 'Role-Based Access Control Middleware',
        description: 'Express middleware for RBAC with role hierarchy, permission checks, and audit logging. Maps to SOC 2 CC6.1, ISO 27001 A.8.2, HIPAA Access Controls.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['rbac', 'access-control', 'middleware', 'soc2', 'iso27001', 'hipaa'],
        code: `// RBAC Middleware — Compliance-Ready Access Control
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer'
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER, ROLES.VIEWER],
  [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.USER, ROLES.VIEWER],
  [ROLES.MANAGER]: [ROLES.USER, ROLES.VIEWER],
  [ROLES.USER]: [ROLES.VIEWER],
  [ROLES.VIEWER]: []
};

const PERMISSIONS = {
  'users:read': [ROLES.VIEWER],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.SUPER_ADMIN],
  'reports:read': [ROLES.USER],
  'reports:write': [ROLES.MANAGER],
  'audit:read': [ROLES.ADMIN],
  'settings:write': [ROLES.SUPER_ADMIN]
};

function getEffectiveRoles(role) {
  const inherited = ROLE_HIERARCHY[role] || [];
  return [role, ...inherited];
}

function hasPermission(userRole, permission) {
  const allowed = PERMISSIONS[permission] || [];
  const effective = getEffectiveRoles(userRole);
  return allowed.some(r => effective.includes(r));
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      logAccess(req, 'DENIED', 'No authenticated user');
      return res.status(401).json({ error: 'Authentication required' });
    }
    const effective = getEffectiveRoles(req.user.role);
    const granted = roles.some(r => effective.includes(r));
    logAccess(req, granted ? 'GRANTED' : 'DENIED',
      \`Role check: required=[\${roles}] user=\${req.user.role}\`);
    if (!granted) return res.status(403).json({ error: 'Insufficient privileges' });
    next();
  };
}

function requirePermission(...perms) {
  return (req, res, next) => {
    if (!req.user) {
      logAccess(req, 'DENIED', 'Unauthenticated');
      return res.status(401).json({ error: 'Authentication required' });
    }
    const granted = perms.every(p => hasPermission(req.user.role, p));
    logAccess(req, granted ? 'GRANTED' : 'DENIED',
      \`Permission check: required=[\${perms}] user=\${req.user.role}\`);
    if (!granted) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

function logAccess(req, decision, detail) {
  const entry = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    role: req.user?.role || 'none',
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    decision,
    detail
  };
  console.log('[ACCESS]', JSON.stringify(entry));
}

export { ROLES, requireRole, requirePermission, hasPermission };`,
        usage: '<h3>Express Integration</h3><pre><code>import { requireRole, requirePermission, ROLES } from \'./middleware/rbac.js\';\n\n// Protect admin routes\napp.get(\'/admin/users\', requireRole(ROLES.ADMIN), listUsers);\n\n// Permission-based\napp.delete(\'/api/users/:id\', requirePermission(\'users:delete\'), deleteUser);\n\n// Multiple roles\napp.get(\'/reports\', requireRole(ROLES.MANAGER, ROLES.ADMIN), getReports);</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>SOC 2 CC6.1</strong> — Logical access security</li><li><strong>ISO 27001 A.8.2</strong> — Privileged access rights</li><li><strong>HIPAA §164.312(a)</strong> — Access controls</li><li><strong>PCI DSS Req 7</strong> — Restrict access by business need</li></ul><h3>Audit Trail</h3><p>Every access decision is logged with timestamp, user, role, path, IP, and decision. Retain logs per your retention policy (SOC 2: 1 year, HIPAA: 6 years).</p>'
    },
    {
        id: 'chain-hashed-audit-logger',
        title: 'Chain-Hashed Audit Logger',
        description: 'Tamper-evident audit log with SHA-256 hash chaining. Each entry links to the previous via cryptographic hash, satisfying SOC 2 CC7.2, ISO 27001 A.8.15, and HIPAA audit requirements.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['audit', 'logging', 'hash-chain', 'tamper-evident', 'soc2', 'hipaa'],
        code: `// Chain-Hashed Audit Logger
import { createHash } from 'crypto';
import { appendFileSync, readFileSync, existsSync } from 'fs';

class AuditLogger {
  constructor(logFile = 'audit.jsonl') {
    this.logFile = logFile;
    this.lastHash = this._getLastHash();
  }

  _hash(data) {
    return createHash('sha256').update(data).digest('hex');
  }

  _getLastHash() {
    if (!existsSync(this.logFile)) return '0'.repeat(64);
    const lines = readFileSync(this.logFile, 'utf-8').trim().split('\n');
    if (!lines.length || !lines[lines.length - 1]) return '0'.repeat(64);
    try { return JSON.parse(lines[lines.length - 1]).hash; }
    catch { return '0'.repeat(64); }
  }

  log(event) {
    const entry = {
      seq: Date.now(),
      timestamp: new Date().toISOString(),
      ...event,
      previousHash: this.lastHash
    };
    entry.hash = this._hash(JSON.stringify({
      seq: entry.seq, timestamp: entry.timestamp,
      action: entry.action, actor: entry.actor,
      resource: entry.resource, previousHash: entry.previousHash
    }));
    this.lastHash = entry.hash;
    appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
    return entry;
  }

  verify() {
    if (!existsSync(this.logFile)) return { valid: true, entries: 0 };
    const lines = readFileSync(this.logFile, 'utf-8').trim().split('\n');
    let prevHash = '0'.repeat(64);
    for (let i = 0; i < lines.length; i++) {
      const entry = JSON.parse(lines[i]);
      if (entry.previousHash !== prevHash) {
        return { valid: false, brokenAt: i, expected: prevHash, found: entry.previousHash };
      }
      const computed = this._hash(JSON.stringify({
        seq: entry.seq, timestamp: entry.timestamp,
        action: entry.action, actor: entry.actor,
        resource: entry.resource, previousHash: entry.previousHash
      }));
      if (computed !== entry.hash) {
        return { valid: false, brokenAt: i, reason: 'hash mismatch' };
      }
      prevHash = entry.hash;
    }
    return { valid: true, entries: lines.length };
  }
}

export default AuditLogger;`,
        usage: '<h3>Usage</h3><pre><code>import AuditLogger from \'./AuditLogger.js\';\nconst audit = new AuditLogger(\'security-audit.jsonl\');\n\n// Log events\naudit.log({ action: \'LOGIN\', actor: \'user@co.com\', resource: \'auth\', detail: \'MFA verified\' });\naudit.log({ action: \'DATA_ACCESS\', actor: \'admin@co.com\', resource: \'users\', detail: \'Exported PII report\' });\n\n// Verify chain integrity\nconst result = audit.verify();\nconsole.log(result.valid ? \'Chain intact\' : \'TAMPERING DETECTED at entry \' + result.brokenAt);</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>SOC 2 CC7.2</strong> — System monitoring and anomaly detection</li><li><strong>ISO 27001 A.8.15</strong> — Logging and monitoring</li><li><strong>HIPAA §164.312(b)</strong> — Audit controls</li><li><strong>PCI DSS Req 10</strong> — Track and monitor access</li></ul><h3>Tamper Evidence</h3><p>Each entry includes a SHA-256 hash of its content plus the previous entry hash, forming a blockchain-like chain. If any entry is modified, all subsequent hashes break, making tampering immediately detectable.</p>'
    },
    {
        id: 'aes256-field-encryption',
        title: 'AES-256-GCM Field Encryption Service',
        description: 'Encrypt sensitive database fields at rest using AES-256-GCM with per-field IV and auth tags. Maps to GDPR Art. 32, HIPAA §164.312(a)(2)(iv), PCI DSS Req 3.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['encryption', 'aes-256', 'data-at-rest', 'gdpr', 'hipaa', 'pci-dss'],
        code: `// AES-256-GCM Field Encryption Service
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;

class FieldEncryptor {
  constructor(keyHex) {
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('Key must be 64 hex chars (256 bits). Generate with: crypto.randomBytes(32).toString("hex")');
    }
    this.key = Buffer.from(keyHex, 'hex');
  }

  encrypt(plaintext) {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + enc.toString('hex') + ':' + tag.toString('hex');
  }

  decrypt(ciphertext) {
    const [ivHex, encHex, tagHex] = ciphertext.split(':');
    const decipher = createDecipheriv(ALGO, this.key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return decipher.update(encHex, 'hex', 'utf8') + decipher.final('utf8');
  }

  encryptFields(obj, fields) {
    const result = { ...obj };
    for (const f of fields) {
      if (result[f] !== undefined && result[f] !== null) {
        result[f] = this.encrypt(String(result[f]));
      }
    }
    return result;
  }

  decryptFields(obj, fields) {
    const result = { ...obj };
    for (const f of fields) {
      if (result[f] && typeof result[f] === 'string' && result[f].includes(':')) {
        try { result[f] = this.decrypt(result[f]); }
        catch { /* field was not encrypted or key mismatch */ }
      }
    }
    return result;
  }
}

export default FieldEncryptor;`,
        usage: '<h3>Usage</h3><pre><code>import FieldEncryptor from \'./FieldEncryptor.js\';\nconst enc = new FieldEncryptor(process.env.FIELD_ENCRYPTION_KEY);\n\n// Encrypt individual values\nconst cipher = enc.encrypt(\'123-45-6789\');\nconst plain  = enc.decrypt(cipher);\n\n// Encrypt specific object fields before DB insert\nconst record = { name: \'Jane\', ssn: \'123-45-6789\', email: \'jane@co.com\' };\nconst safe = enc.encryptFields(record, [\'ssn\', \'email\']);\n// safe.ssn → \'a1b2c3...:d4e5f6...:aabbcc...\'\n\n// Decrypt after DB read\nconst restored = enc.decryptFields(safe, [\'ssn\', \'email\']);</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>GDPR Art. 32</strong> — Encryption of personal data</li><li><strong>HIPAA §164.312(a)(2)(iv)</strong> — Encryption at rest</li><li><strong>PCI DSS Req 3</strong> — Protect stored cardholder data</li><li><strong>SOC 2 CC6.1</strong> — Encryption controls</li></ul><h3>Key Management</h3><p>Generate key: <code>node -e \"console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))\"</code>. Store in environment variable or KMS. Rotate by re-encrypting under new key. Never commit keys to source control.</p>'
    },
    {
        id: 'pii-data-masking',
        title: 'PII Data Masking Utility',
        description: 'Mask or redact personally identifiable information in logs, exports, and displays. Supports SSN, email, phone, credit card, and custom patterns. Maps to GDPR Art. 25, HIPAA Safe Harbor.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['pii', 'masking', 'redaction', 'gdpr', 'hipaa', 'privacy'],
        code: `// PII Data Masking Utility
const MASK_CHAR = '*';

const PATTERNS = {
  ssn: { regex: /\b(\d{3})-(\d{2})-(\d{4})\b/g, mask: (m, a, b, c) => a[0] + '**-**-' + c.slice(-2).padStart(4, '*') },
  email: { regex: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, mask: (m, local, domain) => local[0] + '***@' + domain },
  phone: { regex: /\b(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g, mask: (m, a, b, c) => '(***) ***-' + c },
  creditCard: { regex: /\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/g, mask: (m, a, b, c, d) => '**** **** **** ' + d },
  ipv4: { regex: /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, mask: () => '***.***.***.***' }
};

class DataMasker {
  constructor(options = {}) {
    this.types = options.types || Object.keys(PATTERNS);
    this.customPatterns = options.customPatterns || [];
  }

  mask(text) {
    if (typeof text !== 'string') return text;
    let result = text;
    for (const t of this.types) {
      if (PATTERNS[t]) result = result.replace(PATTERNS[t].regex, PATTERNS[t].mask);
    }
    for (const cp of this.customPatterns) {
      result = result.replace(cp.regex, cp.mask);
    }
    return result;
  }

  maskObject(obj, fields = null) {
    if (Array.isArray(obj)) return obj.map(item => this.maskObject(item, fields));
    if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, val] of Object.entries(obj)) {
        if (fields && !fields.includes(key)) { result[key] = val; continue; }
        result[key] = typeof val === 'string' ? this.mask(val)
                    : typeof val === 'object' ? this.maskObject(val, fields) : val;
      }
      return result;
    }
    return obj;
  }

  redact(text, replacement = '[REDACTED]') {
    let result = text;
    for (const t of this.types) {
      if (PATTERNS[t]) result = result.replace(PATTERNS[t].regex, replacement);
    }
    return result;
  }
}

export { DataMasker, PATTERNS };`,
        usage: '<h3>Usage</h3><pre><code>import { DataMasker } from \'./DataMasker.js\';\nconst masker = new DataMasker();\n\n// Mask a string\nmasker.mask(\'SSN: 123-45-6789, Email: john@acme.com\');\n// → \'SSN: 1**-**-**89, Email: j***@acme.com\'\n\n// Mask object fields\nconst user = { name: \'Jane\', ssn: \'987-65-4321\', phone: \'555-123-4567\' };\nmasker.maskObject(user);\n// → { name: \'Jane\', ssn: \'9**-**-**21\', phone: \'(***) ***-4567\' }\n\n// Full redaction for logs\nmasker.redact(\'Card: 4111-1111-1111-1111\');\n// → \'Card: [REDACTED]\'</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>GDPR Art. 25</strong> — Data protection by design (pseudonymisation)</li><li><strong>HIPAA Safe Harbor</strong> — De-identification of PHI</li><li><strong>PCI DSS Req 3.4</strong> — Render PAN unreadable</li><li><strong>SOC 2 CC6.7</strong> — Data classification and handling</li></ul><h3>Best Practices</h3><p>Apply masking at the logging layer so PII never reaches log files. Use <code>maskObject()</code> before serialising API responses for non-privileged consumers. Add custom patterns for domain-specific identifiers (patient IDs, account numbers).</p>'
    },
    {
        id: 'breach-notification-engine',
        title: 'Breach Notification Workflow Engine',
        description: 'Multi-framework breach notification engine with deadline tracking for GDPR (72h), HIPAA (60d), DORA (4h), and NIS 2 (24h). Classifies severity, routes to authorities, and generates timelines.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['breach', 'incident-response', 'notification', 'gdpr', 'hipaa', 'dora', 'nis2'],
        code: `// Breach Notification Workflow Engine
const SEVERITY = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const FRAMEWORK_DEADLINES = {
  dora:  { authority: 'National Competent Authority', hours: 4, label: 'DORA Initial' },
  nis2:  { authority: 'National CSIRT', hours: 24, label: 'NIS 2 Early Warning' },
  gdpr:  { authority: 'Supervisory Authority (DPA)', hours: 72, label: 'GDPR Art. 33' },
  hipaa: { authority: 'HHS OCR', hours: 1440, label: 'HIPAA Breach Notification' },
  pci:   { authority: 'Acquiring Bank / Card Brands', hours: 72, label: 'PCI Incident' }
};

class BreachNotificationEngine {
  constructor(options = {}) {
    this.notifier = options.notifier;
  }

  classifySeverity(incident) {
    let score = SEVERITY.LOW;
    if (incident.recordCount > 500) score = Math.max(score, SEVERITY.HIGH);
    if (incident.recordCount > 5000) score = Math.max(score, SEVERITY.CRITICAL);
    const sensitive = ['phi', 'pii', 'financial', 'credentials'];
    if (incident.dataTypes?.some(t => sensitive.includes(t))) score = Math.max(score, SEVERITY.HIGH);
    if (incident.dataTypes?.includes('phi') && incident.recordCount > 500) score = SEVERITY.CRITICAL;
    return score;
  }

  async report(incident) {
    const severity = this.classifySeverity(incident);
    const severityLabel = Object.keys(SEVERITY).find(k => SEVERITY[k] === severity);
    const discoveredAt = incident.discoveredAt || new Date();
    const frameworks = incident.frameworks || [];

    const classified = {
      id: 'INC-' + Date.now(),
      severity: severityLabel,
      discoveredAt: discoveredAt.toISOString(),
      summary: incident.summary,
      dataTypes: incident.dataTypes,
      recordCount: incident.recordCount,
      deadlines: [],
      timeline: []
    };

    for (const fw of frameworks) {
      const dl = FRAMEWORK_DEADLINES[fw];
      if (!dl) continue;
      const deadline = new Date(discoveredAt.getTime() + dl.hours * 3600000);
      classified.deadlines.push({
        framework: fw, label: dl.label, authority: dl.authority,
        deadlineISO: deadline.toISOString(),
        hoursRemaining: Math.max(0, (deadline - Date.now()) / 3600000).toFixed(1)
      });
    }

    classified.deadlines.sort((a, b) => new Date(a.deadlineISO) - new Date(b.deadlineISO));

    if (this.notifier) {
      for (const dl of classified.deadlines) {
        await this.notifier.send({
          subject: '[BREACH] ' + dl.label + ' — ' + classified.id,
          framework: dl.framework, deadline: dl.deadlineISO,
          authority: dl.authority, summary: classified.summary });
      }
    }
    return classified;
  }
}

export { BreachNotificationEngine, FRAMEWORK_DEADLINES, SEVERITY };`,
        usage: '<h3>Usage</h3><pre><code>import { BreachNotificationEngine } from \'./BreachNotification.js\';\nconst engine = new BreachNotificationEngine({ notifier: emailService });\n\nconst result = await engine.report({\n  summary: \'Unauthorized access to patient records\',\n  dataTypes: [\'phi\', \'pii\'],\n  recordCount: 1200,\n  frameworks: [\'hipaa\', \'gdpr\']\n});\n\nconsole.log(result.severity);   // \'CRITICAL\'\nconsole.log(result.deadlines);  // sorted by urgency</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>GDPR Art. 33</strong> — 72-hour notification to DPA</li><li><strong>HIPAA Breach Notification Rule</strong> — 60-day notification to HHS</li><li><strong>DORA Art. 19</strong> — 4-hour initial classification</li><li><strong>NIS 2 Art. 23</strong> — 24-hour early warning</li></ul><h3>Severity Matrix</h3><p>LOW: &lt;100 records, non-sensitive. MEDIUM: 100-500 records. HIGH: 500+ records or sensitive data. CRITICAL: 5000+ records or PHI with 500+ records.</p>'
    },
    // ─── MFA MIDDLEWARE ─────────────────────────────────────────
    {
        id: 'mfa-middleware',
        title: 'Multi-Factor Authentication Middleware',
        description: 'TOTP (RFC 6238) and WebAuthn/FIDO2 MFA middleware with recovery codes, rate-limiting lockout (PCI DSS 8.3.4), and 8-hour session window. Drop-in Express middleware for protecting admin routes.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['mfa', 'totp', 'webauthn', 'fido2', 'authentication', 'soc2', 'pci-dss', 'hipaa', 'cmmc'],
        code: `// Multi-Factor Authentication Middleware
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'node:crypto';

const MFA_CONFIG = {
  totp: { issuer: 'MyOrg', algorithm: 'sha256', digits: 6, period: 30 },
  recovery: { codeCount: 10, codeLength: 8 },
  session: { mfaCookieMaxAge: 8 * 60 * 60 * 1000 },
  rateLimiting: { maxAttempts: 5, lockoutDurationMs: 30 * 60 * 1000 }
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

async function enrollTOTP(userId, userEmail) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, MFA_CONFIG.totp.issuer, secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauth);
  // Store secret for user (hashed in production)
  return { secret, qrCodeUrl, otpauth };
}

function verifyTOTP(token, secret) {
  return authenticator.verify({ token, secret });
}

function generateRecoveryCodes() {
  return Array.from({ length: MFA_CONFIG.recovery.codeCount }, () =>
    crypto.randomBytes(MFA_CONFIG.recovery.codeLength).toString('hex').slice(0, MFA_CONFIG.recovery.codeLength)
  );
}

function requireMFA(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  if (isLockedOut(userId)) return res.status(429).json({ error: 'Account locked — too many failed MFA attempts' });
  if (req.session?.mfaVerified) return next();
  return res.status(403).json({ error: 'MFA verification required', mfaRequired: true });
}

export { requireMFA, enrollTOTP, verifyTOTP, generateRecoveryCodes, MFA_CONFIG };`,
        usage: '<h3>Usage</h3><pre><code>import { requireMFA, enrollTOTP, verifyTOTP } from \'./mfa-middleware.js\';\n\n// Protect admin routes\napp.use(\'/admin\', requireMFA);\n\n// Enroll user in TOTP\nconst { secret, qrCodeUrl } = await enrollTOTP(userId, email);\n// → Show qrCodeUrl to user, store secret in DB\n\n// Verify token on login\nconst valid = verifyTOTP(userToken, storedSecret);\nif (valid) req.session.mfaVerified = true;</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>SOC 2 CC6.1</strong> — Logical access controls</li><li><strong>ISO 27001 A.8.5</strong> — Secure authentication</li><li><strong>HIPAA §164.312(d)</strong> — Person or entity authentication</li><li><strong>PCI DSS 8.4</strong> — MFA for administrative access</li><li><strong>CMMC IA.L2-3.5.3</strong> — Multifactor authentication</li></ul><h3>Dependencies</h3><p><code>npm install otplib qrcode @simplewebauthn/server</code></p>'
    },
    // ─── SESSION TIMEOUT ────────────────────────────────────────
    {
        id: 'session-timeout-manager',
        title: 'Configurable Session Timeout Manager',
        description: 'Framework-compliant session timeout middleware with idle + absolute timeouts, configurable profiles (standard/sensitive/critical), grace-period warnings, and audit-logged auto-logout.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['session', 'timeout', 'auto-logout', 'soc2', 'hipaa', 'pci-dss', 'cmmc'],
        code: `// Configurable Session Timeout Manager
const TIMEOUT_PROFILES = {
  standard:  { idleMs: 30*60*1000, absoluteMs: 8*3600*1000, warnMs: 5*60*1000 },
  sensitive: { idleMs: 15*60*1000, absoluteMs: 4*3600*1000, warnMs: 2*60*1000 },
  critical:  { idleMs:  5*60*1000, absoluteMs: 1*3600*1000, warnMs: 1*60*1000 }
};

class SessionTimeoutManager {
  constructor(options = {}) {
    this.profile = TIMEOUT_PROFILES[options.profile || 'standard'];
    this.auditLogger = options.auditLogger || console;
    this.onTimeout = options.onTimeout || (() => {});
  }

  middleware() {
    return (req, res, next) => {
      if (!req.session) return next();
      const now = Date.now();
      const created = req.session.createdAt || now;
      const lastActivity = req.session.lastActivity || now;

      // Absolute timeout — session too old regardless of activity
      if (now - created > this.profile.absoluteMs) {
        return this.#expireSession(req, res, 'absolute_timeout');
      }
      // Idle timeout — no activity for too long
      if (now - lastActivity > this.profile.idleMs) {
        return this.#expireSession(req, res, 'idle_timeout');
      }
      // Warning zone
      const idleRemaining = this.profile.idleMs - (now - lastActivity);
      if (idleRemaining <= this.profile.warnMs) {
        res.setHeader('X-Session-Warning', 'true');
        res.setHeader('X-Session-Expires-In', String(Math.ceil(idleRemaining / 1000)));
      }

      req.session.lastActivity = now;
      if (!req.session.createdAt) req.session.createdAt = now;
      next();
    };
  }

  #expireSession(req, res, reason) {
    this.auditLogger.log?.({
      event: 'session_expired', reason,
      userId: req.session.userId, ip: req.ip,
      sessionAge: Date.now() - (req.session.createdAt || 0)
    });
    this.onTimeout(req);
    req.session.destroy?.(() => {});
    return res.status(440).json({ error: 'Session expired', reason });
  }
}

export { SessionTimeoutManager, TIMEOUT_PROFILES };`,
        usage: '<h3>Usage</h3><pre><code>import { SessionTimeoutManager } from \'./session-timeout.js\';\n\nconst timeout = new SessionTimeoutManager({\n  profile: \'sensitive\',   // 15-min idle, 4-hour max\n  auditLogger: auditLog,\n  onTimeout: (req) => notifyUser(req.session.userId)\n});\n\napp.use(timeout.middleware());\n\n// Client-side: watch X-Session-Warning header to show countdown</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>SOC 2 CC6.1</strong> — Session management controls</li><li><strong>HIPAA §164.312(a)(2)(iii)</strong> — Automatic logoff</li><li><strong>PCI DSS 8.2.8</strong> — Session idle timeout ≤15 min for CDE access</li><li><strong>CMMC AC.L2-3.1.11</strong> — Session lock</li></ul><h3>Timeout Profiles</h3><p><strong>Standard:</strong> 30min idle / 8hr max. <strong>Sensitive:</strong> 15min idle / 4hr max. <strong>Critical:</strong> 5min idle / 1hr max. Use <em>sensitive</em> for PCI DSS cardholder environments and HIPAA ePHI systems.</p>'
    },
    // ─── HIPAA PHI FILTER ───────────────────────────────────────
    {
        id: 'hipaa-phi-filter',
        title: 'HIPAA Minimum Necessary PHI Filter',
        description: 'Role-based PHI field filtering implementing HIPAA §164.502(b) Minimum Necessary Standard. Defines the 18 Safe Harbor identifiers, provides per-role access profiles, and logs every PHI access for audit compliance.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['hipaa', 'phi', 'minimum-necessary', 'de-identification', 'safe-harbor', 'healthcare'],
        code: `// HIPAA Minimum Necessary PHI Filter
const PHI_IDENTIFIERS = Object.freeze({
  NAMES: 'names', GEOGRAPHIC: 'geographic', DATES: 'dates',
  PHONE: 'phone', FAX: 'fax', EMAIL: 'email', SSN: 'ssn',
  MRN: 'mrn', HEALTH_PLAN_ID: 'healthPlanId',
  ACCOUNT_NUMBERS: 'accountNumbers', LICENSE: 'license',
  VEHICLE_IDS: 'vehicleIds', DEVICE_IDS: 'deviceIds',
  WEB_URLS: 'webUrls', IP_ADDRESSES: 'ipAddresses',
  BIOMETRIC: 'biometric', PHOTOS: 'photos', OTHER_UNIQUE: 'otherUnique'
});

const ROLE_PROFILES = {
  treating_provider: {
    allowed: Object.values(PHI_IDENTIFIERS), // Full access for treatment
    purpose: 'Treatment (TPO)'
  },
  billing: {
    allowed: ['names', 'mrn', 'healthPlanId', 'accountNumbers', 'dates'],
    purpose: 'Payment (TPO)'
  },
  researcher: {
    allowed: [],  // Must use de-identified data
    purpose: 'Research (requires IRB approval or de-identification)'
  },
  it_support: {
    allowed: ['mrn'],  // Minimum necessary for system access issues
    purpose: 'Healthcare Operations'
  }
};

class PHIFilter {
  constructor(options = {}) {
    this.auditLogger = options.auditLogger || console;
  }

  filter(record, role, requestContext = {}) {
    const profile = ROLE_PROFILES[role];
    if (!profile) throw new Error('Unknown role: ' + role);
    const filtered = {};
    for (const [key, value] of Object.entries(record)) {
      if (profile.allowed.includes(key) || !Object.values(PHI_IDENTIFIERS).includes(key)) {
        filtered[key] = value;
      } else {
        filtered[key] = '[REDACTED]';
      }
    }
    this.auditLogger.log?.({
      event: 'phi_access', role, purpose: profile.purpose,
      recordId: record.mrn || record.id,
      fieldsAccessed: Object.keys(filtered).filter(k => filtered[k] !== '[REDACTED]'),
      fieldsRedacted: Object.keys(filtered).filter(k => filtered[k] === '[REDACTED]'),
      ...requestContext
    });
    return filtered;
  }

  deidentify(record) {
    const result = { ...record };
    for (const field of Object.values(PHI_IDENTIFIERS)) {
      if (field in result) result[field] = '[DE-IDENTIFIED]';
    }
    return result;
  }
}

function filterPHI(phiFilter, role) {
  return (req, res, next) => {
    const origJson = res.json.bind(res);
    res.json = (data) => {
      const filtered = Array.isArray(data)
        ? data.map(r => phiFilter.filter(r, role, { userId: req.user?.id, ip: req.ip }))
        : phiFilter.filter(data, role, { userId: req.user?.id, ip: req.ip });
      return origJson(filtered);
    };
    next();
  };
}

export { PHIFilter, filterPHI, PHI_IDENTIFIERS, ROLE_PROFILES };`,
        usage: '<h3>Usage</h3><pre><code>import { PHIFilter, filterPHI } from \'./hipaa-phi-filter.js\';\nconst filter = new PHIFilter({ auditLogger: hipaaAuditLog });\n\n// Middleware — auto-filter responses by role\napp.get(\'/api/patients/:id\', filterPHI(filter, \'billing\'));\n// → Only returns: names, mrn, healthPlanId, accountNumbers, dates\n\n// Direct use\nconst record = { names: \'Jane Doe\', ssn: \'123-45-6789\', mrn: \'MRN-001\' };\nfilter.filter(record, \'billing\');\n// → { names: \'Jane Doe\', ssn: \'[REDACTED]\', mrn: \'MRN-001\' }</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>HIPAA §164.502(b)</strong> — Minimum Necessary Standard</li><li><strong>HIPAA §164.514(b)(2)</strong> — Safe Harbor de-identification (18 identifiers)</li><li><strong>HIPAA §164.312(a)(1)</strong> — Access control</li><li><strong>SOC 2 CC6.1</strong> — Logical access controls</li></ul><h3>Role Profiles</h3><p><strong>treating_provider:</strong> Full PHI access (Treatment). <strong>billing:</strong> Name, MRN, health plan, account, dates. <strong>researcher:</strong> De-identified data only. <strong>it_support:</strong> MRN only.</p>'
    },
    // ─── GDPR CONSENT MANAGER ───────────────────────────────────
    {
        id: 'gdpr-consent-manager',
        title: 'GDPR Granular Consent Manager',
        description: 'Per-purpose consent tracking implementing GDPR Articles 6, 7, 13, 17, 20, and 21. Tracks consent versions, withdrawal history, legal basis, and generates Kantara-specification consent receipts for audit evidence.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['gdpr', 'consent', 'privacy', 'data-subject-rights', 'right-to-erasure', 'dsr'],
        code: `// GDPR Granular Consent Manager
import crypto from 'node:crypto';

const CONSENT_PURPOSES = Object.freeze({
  ACCOUNT_CREATION: { id: 'account_creation', name: 'Account Creation', legalBasis: 'contract', required: true },
  SERVICE_DELIVERY: { id: 'service_delivery', name: 'Service Delivery', legalBasis: 'contract', required: true },
  MARKETING_EMAIL:  { id: 'marketing_email',  name: 'Marketing Emails', legalBasis: 'consent', required: false },
  ANALYTICS:        { id: 'analytics',         name: 'Usage Analytics',  legalBasis: 'legitimate_interest', required: false },
  THIRD_PARTY_SHARE:{ id: 'third_party_share', name: 'Third-Party Sharing', legalBasis: 'consent', required: false },
  PROFILING:        { id: 'profiling',         name: 'Automated Profiling', legalBasis: 'consent', required: false }
});

class ConsentManager {
  constructor(options = {}) {
    this.store = options.store || new Map();
    this.auditLog = options.auditLog || console;
  }

  async grant(userId, purposeId, meta = {}) {
    const record = {
      id: crypto.randomUUID(),
      userId, purposeId, status: 'granted',
      grantedAt: new Date().toISOString(),
      policyVersion: meta.policyVersion || '1.0',
      collectionMethod: meta.method || 'web_form',
      ipAddress: meta.ip, userAgent: meta.userAgent
    };
    const key = userId + ':' + purposeId;
    this.store.set?.(key, record) || this.store.set(key, record);
    this.auditLog.log?.({ event: 'consent_granted', ...record });
    return record;
  }

  async withdraw(userId, purposeId, reason = '') {
    const key = userId + ':' + purposeId;
    const existing = this.store.get?.(key);
    if (existing) existing.status = 'withdrawn';
    const record = {
      userId, purposeId, status: 'withdrawn',
      withdrawnAt: new Date().toISOString(), reason
    };
    this.store.set?.(key, { ...existing, ...record });
    this.auditLog.log?.({ event: 'consent_withdrawn', ...record });
    return record;
  }

  async check(userId, purposeId) {
    const key = userId + ':' + purposeId;
    const record = this.store.get?.(key);
    return { granted: record?.status === 'granted', record };
  }

  async getAllConsents(userId) {
    const consents = {};
    for (const [key, record] of this.store.entries?.() || this.store) {
      if (key.startsWith(userId + ':')) consents[record.purposeId] = record;
    }
    return consents;
  }

  generateReceipt(consentRecord) {
    return {
      receiptId: crypto.randomUUID(),
      version: '1.1.0',  // Kantara Consent Receipt Specification
      jurisdiction: 'EU',
      consentTimestamp: consentRecord.grantedAt,
      subject: { id: consentRecord.userId },
      purposes: [{ purpose: consentRecord.purposeId, consentType: 'explicit' }],
      policyUrl: '/privacy-policy',
      policyVersion: consentRecord.policyVersion
    };
  }
}

export { ConsentManager, CONSENT_PURPOSES };`,
        usage: '<h3>Usage</h3><pre><code>import { ConsentManager } from \'./gdpr-consent-manager.js\';\nconst consent = new ConsentManager({ store: consentDB });\n\n// Grant consent\nawait consent.grant(userId, \'marketing_email\', { policyVersion: \'2.1\', ip: req.ip });\n\n// Check before processing\nconst { granted } = await consent.check(userId, \'marketing_email\');\nif (!granted) throw new Error(\'No consent for marketing emails\');\n\n// Withdraw (GDPR Art. 7(3) — right to withdraw)\nawait consent.withdraw(userId, \'marketing_email\', \'User preference\');\n\n// Generate audit receipt\nconst receipt = consent.generateReceipt(consentRecord);</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>GDPR Art. 6</strong> — Lawful basis for processing</li><li><strong>GDPR Art. 7</strong> — Conditions for consent (freely given, specific, informed, unambiguous)</li><li><strong>GDPR Art. 7(3)</strong> — Right to withdraw consent at any time</li><li><strong>GDPR Art. 13/14</strong> — Information obligations to data subjects</li><li><strong>SOC 2 CC2.2</strong> — Communication about processing</li></ul><h3>Legal Basis Types</h3><p><strong>consent:</strong> Explicit opt-in required. <strong>contract:</strong> Necessary for service delivery. <strong>legitimate_interest:</strong> Balance test required (document in DPIA).</p>'
    },
    // ─── PCI CARD SANITIZER ─────────────────────────────────────
    {
        id: 'pci-card-sanitizer',
        title: 'PCI DSS Card Data Sanitizer',
        description: 'PCI DSS 4.0.1 compliant PAN detection, masking (first-6/last-4), truncation, and tokenization. Detects 7 card brands via Luhn validation, scrubs PANs from free-text fields, and ensures card data never reaches logs.',
        category: 'compliance',
        language: 'JavaScript',
        tags: ['pci-dss', 'pan', 'tokenization', 'masking', 'card-data', 'payment', 'luhn'],
        code: `// PCI DSS Card Data Sanitizer
import crypto from 'node:crypto';

const CARD_BRANDS = [
  { name: 'Visa',       pattern: /^4[0-9]{12}(?:[0-9]{3})?$/, lengths: [13,16,19] },
  { name: 'Mastercard', pattern: /^(5[1-5]|2[2-7])[0-9]{14}$/, lengths: [16] },
  { name: 'Amex',       pattern: /^3[47][0-9]{13}$/, lengths: [15] },
  { name: 'Discover',   pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/, lengths: [16,19] }
];

function luhnCheck(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

class CardSanitizer {
  constructor(options = {}) {
    this.tokenSecret = options.tokenSecret || crypto.randomBytes(32);
    this.auditLogger = options.auditLogger || console;
  }

  detectBrand(pan) {
    const digits = pan.replace(/[\\s-]/g, '');
    if (!luhnCheck(digits)) return null;
    return CARD_BRANDS.find(b => b.pattern.test(digits))?.name || 'Unknown';
  }

  mask(pan) {
    const d = pan.replace(/[\\s-]/g, '');
    if (d.length < 13 || !luhnCheck(d)) return pan;
    return d.slice(0, 6) + '*'.repeat(d.length - 10) + d.slice(-4);
  }

  truncate(pan) {
    const d = pan.replace(/[\\s-]/g, '');
    return '****' + d.slice(-4);
  }

  tokenize(pan) {
    const d = pan.replace(/[\\s-]/g, '');
    const hmac = crypto.createHmac('sha256', this.tokenSecret).update(d).digest('hex');
    return 'tok_' + hmac.slice(0, 16);
  }

  scrubText(text) {
    const panRegex = /\\b(?:\\d[\\s-]?){13,19}\\b/g;
    return text.replace(panRegex, (match) => {
      const digits = match.replace(/[\\s-]/g, '');
      if (digits.length >= 13 && digits.length <= 19 && luhnCheck(digits)) {
        this.auditLogger.log?.({ event: 'pan_scrubbed', last4: digits.slice(-4) });
        return this.mask(digits);
      }
      return match;
    });
  }

  middleware() {
    return (req, _res, next) => {
      if (req.body) req.body = JSON.parse(this.scrubText(JSON.stringify(req.body)));
      next();
    };
  }
}

export { CardSanitizer, luhnCheck, CARD_BRANDS };`,
        usage: '<h3>Usage</h3><pre><code>import { CardSanitizer } from \'./pci-card-sanitizer.js\';\nconst sanitizer = new CardSanitizer({ tokenSecret: process.env.TOKEN_KEY });\n\nsanitizer.mask(\'4111111111111111\');     // \'411111******1111\'\nsanitizer.truncate(\'4111111111111111\'); // \'****1111\'\nsanitizer.tokenize(\'4111111111111111\'); // \'tok_a3f8b2c1d4e5f6a7\'\nsanitizer.detectBrand(\'4111111111111111\'); // \'Visa\'\n\n// Scrub PANs from any text (logs, support tickets, etc.)\nsanitizer.scrubText(\'Card: 4111-1111-1111-1111 was used\');\n// → \'Card: 411111******1111 was used\'\n\n// Express middleware — auto-scrub request bodies\napp.use(sanitizer.middleware());</code></pre>',
        notes: '<h3>Compliance Mapping</h3><ul><li><strong>PCI DSS 3.3</strong> — Mask PAN when displayed (first 6 / last 4 only)</li><li><strong>PCI DSS 3.4</strong> — Render PAN unreadable everywhere it is stored</li><li><strong>PCI DSS 3.5</strong> — Protect cryptographic keys for PAN protection</li><li><strong>PCI DSS 4.1</strong> — Strong cryptography for PAN in transit</li><li><strong>SOC 2 CC6.1</strong> — Data protection controls</li></ul><h3>Luhn Algorithm</h3><p>All valid card numbers pass the Luhn check (mod-10 checksum). This sanitizer validates before masking to avoid false positives on random 16-digit numbers.</p>'
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
        tags: ['MBAi', 'strategy', 'ESG', 'balanced-scorecard', 'sustainability'],
        timeSaved: 8,
        code: `// Sustainable Balanced Scorecard — Strategic Matrix
// Category: Strategic Management
// Methodology: MBAi + Sustainable Business + Servant Leadership
// Frameworks: NIST AI RMF, ISO 42001, CSRD, ISSB

const sbscMatrix = {
  perspectives: [
    {
      name: "Financial",
      objectives: [
        {
          objective: "Transition revenue to circular, regenerative models",
          kpi: "% revenue from Product-as-a-Service (PaaS)",
          target: "> 35%",
          aiVector: "AI-driven dynamic pricing for subscriptions & leases",
          servantLeadership: "Transparent reporting & equitable profit-sharing"
        },
        {
          objective: "Reduce OpEx through ecological efficiency",
          kpi: "Energy cost savings vs production output",
          target: "20% Reduction",
          aiVector: "Autonomous energy grid balancing & peak load prediction",
          servantLeadership: "Reinvest savings into employee wellness funds"
        }
      ]
    },
    {
      name: "Customer",
      objectives: [
        {
          objective: "Enhance brand equity via purpose-driven impact",
          kpi: "NPS + Sustainability Trust Index",
          target: "> 75 NPS",
          aiVector: "NLP sentiment analysis on ESG feedback",
          servantLeadership: "Customers as collaborative sustainability partners"
        },
        {
          objective: "Ensure ethical AI service accessibility",
          kpi: "% portfolio passing bias & accessibility audits",
          target: "100%",
          aiVector: "Automated bias detection in customer-facing AI",
          servantLeadership: "Prioritize inclusive design for marginalized communities"
        }
      ]
    },
    {
      name: "Internal Process",
      objectives: [
        {
          objective: "Zero-waste closed-loop supply chain",
          kpi: "% materials recovered & remanufactured",
          target: "> 65%",
          aiVector: "Computer vision + robotics for reverse logistics",
          servantLeadership: "Safe environments; upskilling over displacement"
        },
        {
          objective: "Operational carbon neutrality (Scope 1 & 2)",
          kpi: "Absolute GHG Emissions (MT CO2e)",
          target: "Net-Zero",
          aiVector: "ML route optimization & HVAC carbon reduction",
          servantLeadership: "Frontline authority to halt non-compliant processes"
        }
      ]
    },
    {
      name: "Learning & Growth",
      objectives: [
        {
          objective: "Culture of continuous green innovation",
          kpi: "Employee sustainability patents/improvements",
          target: "10/Year",
          aiVector: "AI knowledge management surfacing cross-dept insights",
          servantLeadership: "Fund continuous education & green skills training"
        },
        {
          objective: "Inclusive, psychologically safe environment",
          kpi: "Belonging Index & voluntary turnover",
          target: "< 5% Turnover",
          aiVector: "Anonymized communication analysis for inclusion gaps",
          servantLeadership: "Radical empathy; sponsor underrepresented talent"
        }
      ]
    }
  ]
};

export default sbscMatrix;`,
        usage: '<h3>Usage</h3><p>Deploy the SBSC as the primary strategic interface in the Admin Dashboard. Connect to SQL.js for time-series KPI tracking and use MCP server to feed from external ERP/environmental APIs.</p><pre><code>// Fetch from platform API\\nconst res = await fetch("/api/mbai/templates/sbsc-strategic-matrix");\\nconst sbsc = await res.json();\\n\\n// Iterate perspectives\\nsbsc.perspectives.forEach(p => {\\n  console.log(p.name, p.objectives.length, "objectives");\\n});</code></pre>',
        notes: '<h3>MBAi Integration</h3><ul><li>Maps to <strong>NIST AI RMF "Govern"</strong> function for AI risk culture</li><li>Each objective requires dual documentation: AI vector + servant leadership practice</li><li>Financial perspective tracks circular/PaaS revenue — not just traditional metrics</li></ul><h3>View Full Template</h3><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-circular-supply-chain',
        title: 'Circular Supply Chain Workflow',
        description: 'Six-phase circular economy workflow: Regenerative Sourcing → Circular Design → GreenOps Manufacturing → PaaS Distribution → Reverse Logistics → Remanufacturing.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'operations', 'supply-chain', 'circular-economy', 'sustainability'],
        timeSaved: 6,
        code: `// Circular Supply Chain — Operational Workflow
// Category: Operations & Supply Chain Management
// Methodology: MBAi + Circular Economy + Servant Leadership

const circularWorkflow = {
  phases: [
    {
      name: "Regenerative Sourcing",
      action: "Transition to recycled/regenerative materials",
      aiEnablement: "AI audits supplier ESG reports continuously",
      kpi: "% procurement spend on circular suppliers",
      servantLeadership: "Partner with suppliers to build capacity"
    },
    {
      name: "Circular Product Design",
      action: "Modularity, durability, repairability by design",
      aiEnablement: "Generative AI simulates material combinations",
      kpi: "Product Circularity Index",
      servantLeadership: "Psychological safety for experimental R&D"
    },
    {
      name: "Sustainable Manufacturing & GreenOps",
      action: "Zero-waste, renewable-powered production",
      aiEnablement: "Digital twins optimize energy & waste real-time",
      kpi: "Waste diverted from landfill; IT PUE",
      servantLeadership: "Automation augments, never replaces, workers"
    },
    {
      name: "Product-as-a-Service Distribution",
      action: "Leasing & subscription over transactional sales",
      aiEnablement: "AI forecasts demand & proactive maintenance",
      kpi: "Asset utilization rate; units manufactured reduction",
      servantLeadership: "Relationship metrics replace volume quotas"
    },
    {
      name: "Reverse Logistics & Asset Recovery",
      action: "Collection hubs & incentivized take-back schemes",
      aiEnablement: "Intelligent multi-stop routing minimizes emissions",
      kpi: "Volume & mass of products recovered",
      servantLeadership: "Community engagement & data privacy transparency"
    },
    {
      name: "Remanufacturing & Material Cycling",
      action: "Sort, disassemble, triage for reuse/recycle",
      aiEnablement: "Computer vision categorizes returned components",
      kpi: "Economic value from closed-loop vs virgin costs",
      servantLeadership: "Team autonomy for quality-control decisions"
    }
  ]
};

export default circularWorkflow;`,
        usage: '<h3>Usage</h3><p>Integrate into the project tracking module. Expose phases to external suppliers via the Client Portal with dynamic progress bars.</p><pre><code>const res = await fetch("/api/mbai/templates/circular-supply-chain");\\nconst workflow = await res.json();\\nworkflow.phases.forEach(ph => console.log(ph.name, "—", ph.kpi));</code></pre>',
        notes: '<h3>Compliance Alignment</h3><ul><li><strong>ISO 14001</strong> — Environmental management systems</li><li><strong>NIST AI RMF "Map"</strong> — Document AI data flows across vendor ecosystem</li><li><strong>CSRD</strong> — Supply chain due diligence reporting</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-tbl-impact',
        title: 'Triple Bottom Line (TBL) P&L',
        description: 'Profit-People-Planet integrated P&L with baseline vs projected metrics, AI-driven financial modeling, and servant leadership valuation rationale.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'finance', 'TBL', 'ESG', 'impact-roi'],
        timeSaved: 6,
        code: `// Triple Bottom Line — Integrated P&L & Impact ROI
// Strategic Initiative: Fleet Electrification & Workforce Development
// Methodology: MBAi + TBL Accounting + Servant Leadership

const tblModel = {
  initiative: "Fleet Electrification & Community Workforce Development",
  dimensions: [
    {
      name: "Profit",
      metrics: [
        { metric: "CapEx", baseline: "$0", projected: "$1,500,000",
          ai: "Predictive TCO modeling", leadership: "Approve long-term investments" },
        { metric: "OpEx Fuel Savings", baseline: "$800K/yr", projected: "$350K/yr",
          ai: "Charging schedule optimization", leadership: "Document savings transparently" }
      ]
    },
    {
      name: "Planet",
      metrics: [
        { metric: "Scope 1 GHG", baseline: "2,500 MT CO2e", projected: "300 MT CO2e",
          ai: "IoT telematics + auto carbon reporting", leadership: "Exceed minimum compliance" },
        { metric: "Carbon Tax Risk", baseline: "$125K liability", projected: "$15K liability",
          ai: "NLP monitors ESG legislation", leadership: "Proactive risk mitigation" }
      ]
    },
    {
      name: "People",
      metrics: [
        { metric: "Job Creation", baseline: "0 specialists", projected: "25 high-wage roles",
          ai: "AI identifies skills gaps & learning paths", leadership: "Retrain, don't outsource" },
        { metric: "Health & Safety", baseline: "High exposure", projected: "40% noise reduction",
          ai: "Wearable IoT exposure tracking", leadership: "Well-being above speed" }
      ]
    }
  ]
};

export default tblModel;`,
        usage: '<h3>Usage</h3><p>Instantiate in the Admin Dashboard CRUD model. Structure data as JSON for Data Table components with sorting/filtering. Connect to accounting APIs via platform wrappers.</p><pre><code>const res = await fetch("/api/mbai/templates/tbl-impact-model");\\nconst tbl = await res.json();\\nconsole.log("Initiative:", tbl.initiative);\\ntbl.dimensions.forEach(d => console.log(d.name, d.metrics.length, "metrics"));</code></pre>',
        notes: '<h3>Methodology Notes</h3><ul><li>Document shadow price assumptions for carbon valuation</li><li>AI models under <strong>NIST AI RMF "Measure"</strong> must be continuously monitored</li><li>Social metrics use qualitative + quantitative evidence</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-marketing-audit',
        title: 'Purpose-Driven Marketing Audit',
        description: 'Five-phase audit framework: Purpose Alignment, Impact Verification, Inclusive Storytelling, Ethical Personalization, and Continuous Sentiment Analysis.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'marketing', 'ESG', 'content-strategy', 'ethics'],
        timeSaved: 4,
        code: `// Purpose-Driven Marketing Audit & Content Strategy
// Methodology: MBAi + Purpose-Driven Marketing + Servant Leadership

const marketingAudit = {
  phases: [
    {
      name: "Purpose Alignment & Authenticity",
      criteria: "Does the campaign reflect verified operational capabilities?",
      aiEnablement: "AI cross-checks copy against sustainability reports",
      ethicalAlignment: "Refuse campaigns exploiting social issues for profit",
      evidenceLink: "SBSC Data"
    },
    {
      name: "Impact Verification & Evidence",
      criteria: "Are all ESG claims substantiated by audit-quality data?",
      aiEnablement: "Semantic search retrieves exact TBL data points",
      ethicalAlignment: "Radical transparency; acknowledge improvement areas",
      evidenceLink: "TBL Metrics"
    },
    {
      name: "Inclusive & Accessible Storytelling",
      criteria: "Culturally competent language, diverse representation?",
      aiEnablement: "NLP reviews for implicit bias & accessibility violations",
      ethicalAlignment: "Amplify marginalized stakeholder voices",
      evidenceLink: "Brand Guidelines"
    },
    {
      name: "Ethical Content Personalization",
      criteria: "Respectful of privacy; no manipulative triggers?",
      aiEnablement: "Agentic AI personalizes within GDPR constraints",
      ethicalAlignment: "Consumers are community members, not data points",
      evidenceLink: "Privacy Policy"
    },
    {
      name: "Continuous Sentiment Analysis",
      criteria: "Active monitoring of public reaction post-launch?",
      aiEnablement: "AI social listening across millions of channels",
      ethicalAlignment: "Listen to criticism; pivot if community signals misstep",
      evidenceLink: "Analytics Dashboard"
    }
  ]
};

export default marketingAudit;`,
        usage: '<h3>Usage</h3><p>Implement using form state managers and validation utilities. Store completed audits in the platform database and distribute via built-in email integration.</p><pre><code>const res = await fetch("/api/mbai/templates/marketing-audit");\\nconst audit = await res.json();\\naudit.phases.forEach(ph => console.log(ph.name, "→", ph.evidenceLink));</code></pre>',
        notes: '<h3>Anti-Greenwashing Controls</h3><ul><li>All claims anchored to verified TBL accounting data</li><li><strong>NIST AI RMF "Manage"</strong> prevents generative AI hallucination of sustainability claims</li><li>GDPR-compliant personalization required</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-servant-leadership',
        title: 'Servant Leadership 1-on-1 & Review',
        description: 'Structured 1-on-1 coaching agenda (5 segments) plus a 5-competency performance evaluation rubric scoring empowerment, psychological safety, growth, inclusion, and ethics.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'HR', 'servant-leadership', 'coaching', 'performance-review'],
        timeSaved: 4,
        code: `// Servant Leadership — 1-on-1 Coaching + Performance Rubric
// Methodology: MBAi + Sustainable HR + Servant Leadership

const coachingAgenda = {
  frequency: "Weekly/Bi-Weekly",
  duration: "45 Minutes",
  owner: "Direct Report",
  segments: [
    { name: "Personal Connection", focus: "Empathy & Well-being",
      prompt: "How are you doing outside work? Stress manageable?" },
    { name: "Priority Alignment", focus: "Foresight & Vision",
      prompt: "Top priorities? How do they align with sustainability goals?" },
    { name: "Obstacle Removal", focus: "Stewardship & Empowerment",
      prompt: "What systemic roadblocks can I remove for you today?" },
    { name: "Retrospective", focus: "Psychological Safety",
      prompt: "Recent win to celebrate? Challenge — what did we learn?" },
    { name: "Growth & Career", focus: "Commitment to Growth",
      prompt: "New skills? Getting enough actionable feedback?" }
  ]
};

const leadershipRubric = {
  scoring: "1 (Developing) to 4 (Exemplary)",
  competencies: [
    { name: "Empowerment & Delegation",
      proficient: "Delegates with clear guidelines; avoids micromanaging",
      exemplary: "Sponsors team for advanced roles; pushes authority down" },
    { name: "Psychological Safety & Trust",
      proficient: "Acknowledges mistakes; safe to voice concerns",
      exemplary: "Blameless post-mortems; rewards challenging status quo" },
    { name: "Commitment to Human Growth",
      proficient: "Facilitates training; aligns career trajectories",
      exemplary: "Dedicated mentor; sacrifices short-term for learning" },
    { name: "Inclusive Leadership",
      proficient: "Aware of bias; solicits diverse voices",
      exemplary: "Dismantles systemic equity barriers; fosters belonging" },
    { name: "Ethical Stewardship",
      proficient: "Decisions align with ESG goals",
      exemplary: "Moral compass; refuses unethical profitable initiatives" }
  ]
};

export { coachingAgenda, leadershipRubric };`,
        usage: '<h3>Usage</h3><p>Integrate into the secure messaging module with JWT authentication. Connect to HRIS via API wrappers. AI serves as coaching assistant, not surveillance.</p><pre><code>// Fetch coaching template\\nconst res = await fetch("/api/mbai/templates/servant-leadership-coaching");\\nconst coaching = await res.json();\\nconsole.log(coaching.segments.length, "coaching segments");\\n\\n// Fetch rubric\\nconst rubric = await fetch("/api/mbai/templates/servant-leadership-rubric");\\nconst data = await rubric.json();\\nconsole.log(data.competencies.length, "leadership competencies");</code></pre>',
        notes: '<h3>Ethical AI in HR</h3><ul><li><strong>NIST AI RMF</strong> — Algorithmic fairness in hiring/promotion required</li><li>Human judgment remains the ultimate arbiter in personnel decisions</li><li>AI synthesizes feedback; humans make the call</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-greenops-sdlc',
        title: 'Sustainable SDLC & GreenOps',
        description: 'Five-phase software development lifecycle embedding energy-efficient coding, Content Engineering, and environmental performance metrics alongside traditional quality gates.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'IT', 'SDLC', 'GreenOps', 'content-engineering', 'sustainability'],
        timeSaved: 6,
        code: `// Sustainable SDLC, GreenOps & Content Engineering
// Methodology: MBAi + GreenOps + Content Engineering + Servant Leadership

const sustainableSDLC = {
  phases: [
    {
      name: "Requirements & Strategy",
      action: "Define scope with sustainability focus; establish content models",
      aiVector: "AI predicts compute needs; flags redundant features",
      greenOps: "Estimated cloud lifecycle costs; ESG alignment",
      leadership: "Deep collaboration between business & engineering"
    },
    {
      name: "Architecture & Design",
      action: "Cloud-native, modular; format-free content for reuse",
      aiVector: "AI assists energy-efficient schema & API design",
      greenOps: "Reduced content duplication; data center efficiency",
      leadership: "Remove bureaucracy; give architects autonomy"
    },
    {
      name: "Development & Green Coding",
      action: "Clean code, efficient algorithms, component-based authoring",
      aiVector: "Copilots optimize for lower CPU/memory consumption",
      greenOps: "Code complexity; technical debt reduction",
      leadership: "Blameless culture; safe to admit errors & refactor"
    },
    {
      name: "Testing & QA",
      action: "Functional + security (DevSecOps) + environmental testing",
      aiVector: "ML CI/CD pipelines minimize manual QA hours",
      greenOps: "Server load optimization; pre-launch bug resolution",
      leadership: "Shield team from deadline pressure on testing"
    },
    {
      name: "Deployment & Observability",
      action: "Continuous monitoring of performance & resource consumption",
      aiVector: "AI observability detects energy anomalies; auto-scales",
      greenOps: "Real-time PUE; carbon per GB processed",
      leadership: "Celebrate wins; blameless retrospectives"
    }
  ]
};

export default sustainableSDLC;`,
        usage: '<h3>Usage</h3><p>Integrate into the pre-deploy audit scripts (<code>npm run audit</code>). The platform&#39;s Vite 5.0 + SQL.js stack natively supports GreenOps principles.</p><pre><code>const res = await fetch("/api/mbai/templates/sustainable-sdlc");\\nconst sdlc = await res.json();\\nsdlc.phases.forEach(ph => console.log(ph.name, "—", ph.greenOps));</code></pre>',
        notes: '<h3>Platform Alignment</h3><ul><li>Vite 5.0 fast builds = lower CI energy consumption</li><li>SQL.js lightweight database = minimal container overhead</li><li>Content Engineering structured data optimizes AI retrieval efficiency</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    },
    {
        id: 'mbai-grc-ai',
        title: 'AI Governance & ESG Compliance (NIST AI RMF)',
        description: 'Operationalizes the four NIST AI RMF functions (Govern, Map, Measure, Manage) with AI agent enablement, servant leadership accountability, and OSCAL documentation integration.',
        category: 'mbai',
        language: 'JSON',
        tags: ['MBAi', 'GRC', 'NIST-AI-RMF', 'ISO-42001', 'compliance', 'AI-governance'],
        timeSaved: 8,
        code: `// AI Governance & ESG Compliance Integration
// Based on NIST AI Risk Management Framework
// Methodology: MBAi + NIST AI RMF + ISO 42001 + Servant Leadership

const grcWorkflow = {
  functions: [
    {
      name: "GOVERN",
      action: "Cross-functional oversight committee; AI policies & risk tolerances",
      aiEnablement: "AI aggregates regulatory updates (EU AI Act, CSRD)",
      servantLeadership: "Ultimate accountability for tech footprint; human rights first",
      documentation: "AI Charters → ISO 42001 mandates"
    },
    {
      name: "MAP",
      action: "Document all AI systems, data dependencies, stakeholder impacts",
      aiEnablement: "Asset discovery scans data flows, APIs, shadow AI",
      servantLeadership: "Transparent communication on data utilization",
      documentation: "Architecture Diagrams → GDPR/SOC 2 controls"
    },
    {
      name: "MEASURE",
      action: "Assess bias, hallucination, security, energy costs quantitatively",
      aiEnablement: "Automated Red Teaming & adversarial testing pipelines",
      servantLeadership: "Independent audit teams with authority to challenge",
      documentation: "Bias Reports → OSCAL control evidence"
    },
    {
      name: "MANAGE",
      action: "Mitigate risks; continuous monitoring; human-in-the-loop overrides",
      aiEnablement: "Real-time observability; auto-alerts on behavioral anomalies",
      servantLeadership: "Blameless culture; reward identifying non-compliance",
      documentation: "Incident Response → Continuous Monitoring dashboards"
    }
  ]
};

export default grcWorkflow;`,
        usage: '<h3>Usage</h3><p>This template forms the core of the Compliance Knowledge Base. Use CRUD interfaces to assign controls to teams and track evidence via the dashboard. Integrate with VS Code extension for pre-commit compliance review.</p><pre><code>const res = await fetch("/api/mbai/templates/grc-ai-integration");\\nconst grc = await res.json();\\ngrc.functions.forEach(fn => console.log(fn.name, "—", fn.documentation));</code></pre>',
        notes: '<h3>OSCAL Integration</h3><ul><li>Maps directly to existing OSCAL catalogs (10 frameworks)</li><li>AI agents limited to flagging risks — humans decide</li><li><strong>GOVERN</strong> = human executives remain accountable</li><li>Cross-references SOC 2, GDPR, ISO 27001, NIST AI RMF</li></ul><p><a href="/mbai">Open MBAi Methodology Dashboard →</a></p>'
    }
];
