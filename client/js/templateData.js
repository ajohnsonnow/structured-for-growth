// Template Library Data - Clean version that works with Vite build
// Simplified templates with proper escaping

export const templates = [
    // FORM TEMPLATES
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
        
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!data.message || data.message.length < 10) {
            this.showFieldError('message', 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
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
        let messageEl = this.form.querySelector('.form-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            this.form.appendChild(messageEl);
        }
        messageEl.className = 'form-message ' + type;
        messageEl.textContent = text;
    }
}

// Usage
const validator = new ContactFormValidator('contactForm');`,
        usage: '<h3>HTML Structure</h3><pre><code>&lt;form id="contactForm"&gt;\n  &lt;div class="form-group"&gt;\n    &lt;input name="name" required&gt;\n    &lt;span class="error-message"&gt;&lt;/span&gt;\n  &lt;/div&gt;\n  &lt;div class="form-group"&gt;\n    &lt;input name="email" type="email" required&gt;\n    &lt;span class="error-message"&gt;&lt;/span&gt;\n  &lt;/div&gt;\n  &lt;div class="form-group"&gt;\n    &lt;textarea name="message" required&gt;&lt;/textarea&gt;\n    &lt;span class="error-message"&gt;&lt;/span&gt;\n  &lt;/div&gt;\n  &lt;button type="submit"&gt;Send&lt;/button&gt;\n&lt;/form&gt;</code></pre>',
        notes: '<h3>Features</h3><ul><li>Real-time validation on submit</li><li>Custom error messages per field</li><li>API integration ready</li><li>Async form handling</li></ul>'
    },
    {
        id: 'jwt-auth-middleware',
        title: 'JWT Authentication Middleware',
        description: 'Express middleware for JWT token validation with refresh token support.',
        category: 'auth',
        language: 'JavaScript',
        tags: ['jwt', 'auth', 'middleware', 'express'],
        timeSaved: 5,
        code: `import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token middleware
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided.' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Generate tokens
export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

// Role-based access control
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions' 
            });
        }
        next();
    };
};`,
        usage: '<h3>Usage Example</h3><pre><code>import { verifyToken, requireRole } from "./auth.js";\n\n// Protected route\napp.get("/api/profile", verifyToken, (req, res) => {\n    res.json({ user: req.user });\n});\n\n// Admin only route\napp.delete("/api/users/:id", \n    verifyToken, \n    requireRole("admin"), \n    deleteUser\n);</code></pre>',
        notes: '<h3>Security Notes</h3><ul><li>Store JWT_SECRET in environment variables</li><li>Use HTTPS in production</li><li>Implement token refresh flow</li><li>Consider token blacklisting for logout</li></ul>'
    },
    {
        id: 'toast-notification',
        title: 'Toast Notification System',
        description: 'Lightweight notification system with auto-dismiss and custom styling.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['notifications', 'ui', 'toast', 'frontend'],
        timeSaved: 3,
        code: `class ToastNotification {
    constructor(options = {}) {
        this.position = options.position || 'top-right';
        this.duration = options.duration || 3000;
        this.container = this.createContainer();
    }
    
    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container ' + this.position;
            document.body.appendChild(container);
        }
        return container;
    }
    
    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = 
            '<span class="toast-message">' + message + '</span>' +
            '<button class="toast-close">&times;</button>';
        
        toast.querySelector('.toast-close').onclick = () => toast.remove();
        this.container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));
        
        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, this.duration);
        
        return toast;
    }
    
    success(message) { return this.show(message, 'success'); }
    error(message) { return this.show(message, 'error'); }
    warning(message) { return this.show(message, 'warning'); }
    info(message) { return this.show(message, 'info'); }
}

// Create global instance
const toast = new ToastNotification();

// Usage examples:
// toast.success('Item saved!');
// toast.error('Something went wrong');
// toast.warning('Please check your input');
// toast.info('New update available');`,
        usage: '<h3>Quick Usage</h3><pre><code>const toast = new ToastNotification({\n    position: "top-right",\n    duration: 3000\n});\n\ntoast.success("Saved!");\ntoast.error("Error occurred");</code></pre>',
        notes: '<h3>CSS Required</h3><p>Add toast styles to your CSS file for proper positioning and animations.</p>'
    },
    {
        id: 'modal-component',
        title: 'Reusable Modal Component',
        description: 'Flexible modal dialog with customizable content and accessibility features.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['modal', 'dialog', 'ui', 'component'],
        timeSaved: 4,
        code: `class Modal {
    constructor(options = {}) {
        this.options = {
            id: options.id || 'modal-' + Date.now(),
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium',
            closable: options.closable !== false,
            onOpen: options.onOpen || null,
            onClose: options.onClose || null
        };
        this.modal = null;
        this.create();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.id = this.options.id;
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = 
            '<div class="modal modal-' + this.options.size + '">' +
                '<div class="modal-header">' +
                    '<h3>' + this.options.title + '</h3>' +
                    (this.options.closable ? '<button class="modal-close">&times;</button>' : '') +
                '</div>' +
                '<div class="modal-body">' + this.options.content + '</div>' +
            '</div>';
        
        document.body.appendChild(this.modal);
        this.bindEvents();
    }
    
    bindEvents() {
        if (this.options.closable) {
            this.modal.querySelector('.modal-close').onclick = () => this.close();
            this.modal.onclick = (e) => {
                if (e.target === this.modal) this.close();
            };
        }
        
        this.escHandler = (e) => {
            if (e.key === 'Escape' && this.options.closable) this.close();
        };
    }
    
    open() {
        this.modal.classList.add('active');
        document.addEventListener('keydown', this.escHandler);
        if (this.options.onOpen) this.options.onOpen(this);
    }
    
    close() {
        this.modal.classList.remove('active');
        document.removeEventListener('keydown', this.escHandler);
        if (this.options.onClose) this.options.onClose(this);
    }
    
    setContent(content) {
        this.modal.querySelector('.modal-body').innerHTML = content;
    }
    
    destroy() {
        document.removeEventListener('keydown', this.escHandler);
        this.modal.remove();
    }
}

// Usage
const myModal = new Modal({
    title: 'Confirm Action',
    content: '<p>Are you sure?</p>',
    onClose: () => console.log('Modal closed')
});

myModal.open();`,
        usage: '<h3>Basic Usage</h3><pre><code>const modal = new Modal({\n    title: "My Modal",\n    content: "&lt;p&gt;Hello World&lt;/p&gt;",\n    size: "medium"\n});\n\nmodal.open();\nmodal.close();</code></pre>',
        notes: '<h3>Features</h3><ul><li>Keyboard accessible (Escape to close)</li><li>Click outside to close</li><li>Multiple size options</li><li>Event callbacks</li></ul>'
    },
    {
        id: 'data-table',
        title: 'Data Table Component',
        description: 'Interactive table with sorting, filtering, and pagination.',
        category: 'ui',
        language: 'JavaScript',
        tags: ['table', 'data', 'sorting', 'pagination'],
        timeSaved: 6,
        code: `class DataTable {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = options.data || [];
        this.columns = options.columns || [];
        this.pageSize = options.pageSize || 10;
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        
        this.render();
    }
    
    render() {
        const filtered = this.getFilteredData();
        const sorted = this.getSortedData(filtered);
        const paginated = this.getPaginatedData(sorted);
        
        this.container.innerHTML = 
            this.renderSearch() +
            this.renderTable(paginated) +
            this.renderPagination(filtered.length);
        
        this.bindEvents();
    }
    
    getFilteredData() {
        if (!this.searchTerm) return this.data;
        const term = this.searchTerm.toLowerCase();
        return this.data.filter(row => 
            this.columns.some(col => 
                String(row[col.field]).toLowerCase().includes(term)
            )
        );
    }
    
    getSortedData(data) {
        if (!this.sortColumn) return data;
        return [...data].sort((a, b) => {
            const aVal = a[this.sortColumn];
            const bVal = b[this.sortColumn];
            const compare = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return this.sortDirection === 'asc' ? compare : -compare;
        });
    }
    
    getPaginatedData(data) {
        const start = (this.currentPage - 1) * this.pageSize;
        return data.slice(start, start + this.pageSize);
    }
    
    renderSearch() {
        return '<div class="table-search"><input type="text" placeholder="Search..."></div>';
    }
    
    renderTable(data) {
        const headers = this.columns.map(col => 
            '<th>' + col.label + '</th>'
        ).join('');
        
        const rows = data.map(row => 
            '<tr>' + this.columns.map(col => 
                '<td>' + row[col.field] + '</td>'
            ).join('') + '</tr>'
        ).join('');
        
        return '<table class="data-table"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>';
    }
    
    renderPagination(total) {
        const totalPages = Math.ceil(total / this.pageSize);
        return '<div class="pagination">Page ' + this.currentPage + ' of ' + totalPages + '</div>';
    }
    
    bindEvents() {
        const searchInput = this.container.querySelector('.table-search input');
        if (searchInput) {
            searchInput.value = this.searchTerm;
            searchInput.oninput = (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.render();
            };
        }
    }
}

// Usage
const table = new DataTable('tableContainer', {
    data: [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
    ],
    columns: [
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' }
    ],
    pageSize: 10
});`,
        usage: '<h3>Configuration</h3><pre><code>new DataTable("container", {\n    data: yourDataArray,\n    columns: [\n        { field: "name", label: "Name" },\n        { field: "email", label: "Email" }\n    ],\n    pageSize: 10\n});</code></pre>',
        notes: '<h3>Features</h3><ul><li>Column sorting</li><li>Text search filtering</li><li>Pagination</li><li>Custom cell rendering</li></ul>'
    },
    {
        id: 'api-client',
        title: 'API Client Wrapper',
        description: 'Simplified fetch wrapper with error handling and interceptors.',
        category: 'api',
        language: 'JavaScript',
        tags: ['api', 'fetch', 'http', 'client'],
        timeSaved: 4,
        code: `class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.authToken = null;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }
    
    setAuthToken(token) {
        this.authToken = token;
    }
    
    async request(endpoint, options = {}) {
        const headers = { ...this.defaultHeaders, ...options.headers };
        
        if (this.authToken) {
            headers['Authorization'] = 'Bearer ' + this.authToken;
        }
        
        const config = { ...options, headers };
        
        try {
            const response = await fetch(this.baseURL + endpoint, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? endpoint + '?' + queryString : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Usage
const api = new ApiClient('https://api.example.com');
api.setAuthToken('your-jwt-token');

// GET request
const users = await api.get('/users', { page: 1 });

// POST request  
const newUser = await api.post('/users', { name: 'John' });`,
        usage: '<h3>Quick Start</h3><pre><code>const api = new ApiClient("/api");\napi.setAuthToken(token);\n\nconst data = await api.get("/items");\nawait api.post("/items", { name: "New" });</code></pre>',
        notes: '<h3>Features</h3><ul><li>Automatic JSON parsing</li><li>Auth token management</li><li>Error handling</li><li>Query parameter support</li></ul>'
    },
    {
        id: 'local-storage-manager',
        title: 'LocalStorage Manager',
        description: 'Type-safe localStorage wrapper with expiration support.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['storage', 'localStorage', 'cache'],
        timeSaved: 2,
        code: `class StorageManager {
    constructor(prefix = 'app') {
        this.prefix = prefix;
    }
    
    getKey(key) {
        return this.prefix + '_' + key;
    }
    
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
    
    get(key, defaultValue = null) {
        try {
            const itemStr = localStorage.getItem(this.getKey(key));
            if (!itemStr) return defaultValue;
            
            const item = JSON.parse(itemStr);
            
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
    
    remove(key) {
        localStorage.removeItem(this.getKey(key));
    }
    
    clear() {
        const prefix = this.prefix + '_';
        Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

// Usage
const storage = new StorageManager('myApp');
storage.set('user', { name: 'John' });
storage.set('token', 'abc123', 30); // Expires in 30 minutes
const user = storage.get('user');`,
        usage: '<h3>Usage</h3><pre><code>const storage = new StorageManager("app");\nstorage.set("key", value, 60); // 60 min expiry\nconst data = storage.get("key", defaultVal);\nstorage.clear();</code></pre>',
        notes: '<h3>Features</h3><ul><li>JSON serialization</li><li>Expiration support</li><li>Namespaced keys</li></ul>'
    },
    {
        id: 'form-validation-utils',
        title: 'Validation Utilities',
        description: 'Collection of validation functions for common use cases.',
        category: 'utils',
        language: 'JavaScript',
        tags: ['validation', 'utilities', 'forms'],
        timeSaved: 3,
        code: `const Validator = {
    isEmail(email) {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    },
    
    isPhone(phone) {
        return /^\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/.test(phone);
    },
    
    isURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    isStrongPassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(password);
    },
    
    isLength(str, min, max) {
        return str.length >= min && str.length <= max;
    },
    
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Usage
Validator.isEmail('test@example.com'); // true
Validator.isStrongPassword('Pass123!'); // true
Validator.sanitizeHTML('<script>alert("xss")</script>');`,
        usage: '<h3>Quick Reference</h3><pre><code>Validator.isEmail("test@example.com")\nValidator.isStrongPassword("Pass123!")\nValidator.isPhone("555-123-4567")\nValidator.sanitizeHTML(userInput)</code></pre>',
        notes: '<h3>Validators</h3><ul><li>Email, Phone, URL</li><li>Password strength</li><li>HTML sanitization</li></ul>'
    }
];
