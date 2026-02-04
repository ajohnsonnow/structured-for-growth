// Templates Page JavaScript
import { templates } from './templateData.js';

let currentCategory = 'all';
let currentTemplate = null;

// Demo configurations for each template type
const demoConfigs = {
    'contact-form-validation': {
        html: `
            <form id="demoForm" class="demo-form">
                <div class="form-group">
                    <label for="demoName">Name</label>
                    <input type="text" id="demoName" name="name" placeholder="Enter your name">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="demoEmail">Email</label>
                    <input type="email" id="demoEmail" name="email" placeholder="Enter your email">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="demoMessage">Message</label>
                    <textarea id="demoMessage" name="message" placeholder="Enter your message" rows="3"></textarea>
                    <span class="error-message"></span>
                </div>
                <div class="form-message"></div>
                <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
        `,
        init: () => {
            const form = document.getElementById('demoForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // Clear previous errors
                form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
                form.querySelectorAll('.error-message').forEach(e => e.textContent = '');
                
                const name = form.name.value.trim();
                const email = form.email.value.trim();
                const message = form.message.value.trim();
                let valid = true;
                
                if (name.length < 2) {
                    showFieldError(form, 'name', 'Name must be at least 2 characters');
                    valid = false;
                }
                if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
                    showFieldError(form, 'email', 'Please enter a valid email');
                    valid = false;
                }
                if (message.length < 10) {
                    showFieldError(form, 'message', 'Message must be at least 10 characters');
                    valid = false;
                }
                
                const msgEl = form.querySelector('.form-message');
                if (valid) {
                    msgEl.className = 'form-message success';
                    msgEl.textContent = '✓ Form validated successfully! Message would be sent.';
                    msgEl.style.display = 'block';
                } else {
                    msgEl.className = 'form-message error';
                    msgEl.textContent = 'Please fix the errors above.';
                    msgEl.style.display = 'block';
                }
            });
        }
    },
    'jwt-auth-middleware': {
        html: `
            <div class="demo-auth">
                <h4>JWT Authentication Demo</h4>
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="showAuthTab('login')">Login</button>
                    <button class="auth-tab" onclick="showAuthTab('register')">Register</button>
                </div>
                <div id="loginTab" class="auth-content">
                    <form id="loginForm" class="demo-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="demo@example.com" value="demo@example.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" value="password123">
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
                <div id="registerTab" class="auth-content" style="display:none;">
                    <form id="registerForm" class="demo-form">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" placeholder="johndoe">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="john@example.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-primary">Register</button>
                    </form>
                </div>
                <div id="authResult" class="demo-result"></div>
            </div>
        `,
        init: () => {
            window.showAuthTab = (tab) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelector(`[onclick="showAuthTab('${tab}')"]`).classList.add('active');
                document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
                document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
            };
            
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const result = document.getElementById('authResult');
                result.innerHTML = `
                    <div class="success-msg">
                        ✓ Login successful!<br>
                        <code>JWT Token: eyJhbGciOiJIUzI1NiIs...</code><br>
                        <small>Token expires in 7 days</small>
                    </div>
                `;
            });
            
            document.getElementById('registerForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const result = document.getElementById('authResult');
                result.innerHTML = '<div class="success-msg">✓ Account created! You can now login.</div>';
            });
        }
    },
    'toast-notification': {
        html: `
            <div class="demo-toast-container">
                <h4>Toast Notification Demo</h4>
                <p>Click buttons to trigger different toast types:</p>
                <div class="toast-buttons">
                    <button class="btn btn-success" onclick="showDemoToast('success', '✓ Operation completed successfully!')">Success</button>
                    <button class="btn btn-danger" onclick="showDemoToast('error', '✗ Something went wrong!')">Error</button>
                    <button class="btn btn-warning" onclick="showDemoToast('warning', '⚠ Please check your input')">Warning</button>
                    <button class="btn btn-primary" onclick="showDemoToast('info', 'ℹ Here is some information')">Info</button>
                </div>
                <div id="toastContainer" class="toast-container"></div>
            </div>
        `,
        init: () => {
            window.showDemoToast = (type, message) => {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = `toast toast-${type}`;
                toast.innerHTML = `
                    <span class="toast-message">${message}</span>
                    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
                `;
                container.appendChild(toast);
                
                // Animate in
                setTimeout(() => toast.classList.add('show'), 10);
                
                // Auto remove
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            };
        }
    },
    'modal-component': {
        html: `
            <div class="demo-modal-area">
                <h4>Modal Component Demo</h4>
                <p>Click buttons to open different modal types:</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="openDemoModal('basic')">Basic Modal</button>
                    <button class="btn btn-secondary" onclick="openDemoModal('confirm')">Confirm Dialog</button>
                    <button class="btn btn-warning" onclick="openDemoModal('form')">Form Modal</button>
                </div>
                <div id="demoModalOverlay" class="demo-modal-overlay" onclick="closeDemoModal()">
                    <div class="demo-modal" onclick="event.stopPropagation()">
                        <div class="demo-modal-header">
                            <h3 id="demoModalTitle">Modal Title</h3>
                            <button class="demo-modal-close" onclick="closeDemoModal()">×</button>
                        </div>
                        <div class="demo-modal-body" id="demoModalBody">
                            Modal content goes here...
                        </div>
                        <div class="demo-modal-footer" id="demoModalFooter">
                            <button class="btn btn-secondary" onclick="closeDemoModal()">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        init: () => {
            window.openDemoModal = (type) => {
                const overlay = document.getElementById('demoModalOverlay');
                const title = document.getElementById('demoModalTitle');
                const body = document.getElementById('demoModalBody');
                const footer = document.getElementById('demoModalFooter');
                
                if (type === 'basic') {
                    title.textContent = 'Basic Modal';
                    body.innerHTML = '<p>This is a basic modal with simple content. Modals are great for displaying focused information or actions.</p>';
                    footer.innerHTML = '<button class="btn btn-primary" onclick="closeDemoModal()">Got it!</button>';
                } else if (type === 'confirm') {
                    title.textContent = 'Confirm Action';
                    body.innerHTML = '<p>Are you sure you want to proceed with this action? This cannot be undone.</p>';
                    footer.innerHTML = '<button class="btn btn-secondary" onclick="closeDemoModal()">Cancel</button><button class="btn btn-danger" onclick="alert(\'Confirmed!\'); closeDemoModal()">Delete</button>';
                } else if (type === 'form') {
                    title.textContent = 'Add New Item';
                    body.innerHTML = `
                        <form class="demo-form">
                            <div class="form-group">
                                <label>Item Name</label>
                                <input type="text" placeholder="Enter name">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea placeholder="Enter description" rows="2"></textarea>
                            </div>
                        </form>
                    `;
                    footer.innerHTML = '<button class="btn btn-secondary" onclick="closeDemoModal()">Cancel</button><button class="btn btn-primary" onclick="alert(\'Item saved!\'); closeDemoModal()">Save</button>';
                }
                
                overlay.classList.add('show');
            };
            
            window.closeDemoModal = () => {
                document.getElementById('demoModalOverlay').classList.remove('show');
            };
        }
    },
    'data-table': {
        html: `
            <div class="demo-table-area">
                <h4>Data Table Demo</h4>
                <div class="table-controls">
                    <input type="text" placeholder="Search..." id="tableSearch" oninput="filterDemoTable()">
                    <select id="tableSort" onchange="sortDemoTable()">
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="status">Sort by Status</option>
                    </select>
                </div>
                <table class="demo-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                    </tbody>
                </table>
            </div>
        `,
        init: () => {
            const data = [
                { name: 'John Doe', email: 'john@example.com', status: 'Active' },
                { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
                { name: 'Bob Wilson', email: 'bob@example.com', status: 'Active' },
                { name: 'Alice Brown', email: 'alice@example.com', status: 'Pending' }
            ];
            
            window.demoTableData = data;
            
            window.renderDemoTable = (items) => {
                const tbody = document.getElementById('tableBody');
                tbody.innerHTML = items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.email}</td>
                        <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
                        <td>
                            <button class="btn-icon" onclick="alert('Edit ${item.name}')">✏️</button>
                            <button class="btn-icon" onclick="alert('Delete ${item.name}')">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            };
            
            window.filterDemoTable = () => {
                const search = document.getElementById('tableSearch').value.toLowerCase();
                const filtered = window.demoTableData.filter(item => 
                    item.name.toLowerCase().includes(search) || 
                    item.email.toLowerCase().includes(search)
                );
                renderDemoTable(filtered);
            };
            
            window.sortDemoTable = () => {
                const field = document.getElementById('tableSort').value;
                const sorted = [...window.demoTableData].sort((a, b) => a[field].localeCompare(b[field]));
                renderDemoTable(sorted);
            };
            
            renderDemoTable(data);
        }
    }
};

// Default demo for templates without specific config
const defaultDemo = {
    html: `
        <div class="demo-placeholder">
            <div class="demo-icon">🎯</div>
            <h4>Template Overview</h4>
            <p>This template provides production-ready patterns you can use in your projects.</p>
            <ul class="demo-features">
                <li>✓ Battle-tested in production</li>
                <li>✓ Follows best practices</li>
                <li>✓ Easy to customize</li>
                <li>✓ Full documentation included</li>
            </ul>
            <p class="demo-tip">💡 Check the <strong>Usage</strong> and <strong>Notes</strong> tabs for implementation details.</p>
        </div>
    `,
    init: () => {}
};

// Form State Manager Demo
demoConfigs['form-state-manager'] = {
    html: `
        <div class="demo-form-state">
            <h4>Form State Manager Demo</h4>
            <form id="stateForm" class="demo-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Enter email">
                </div>
                <div class="form-row">
                    <button type="button" class="btn btn-secondary" onclick="clearStateForm()">Clear</button>
                    <button type="button" class="btn btn-primary" onclick="saveStateForm()">Save to State</button>
                </div>
            </form>
            <div class="state-display">
                <h5>Current State:</h5>
                <pre id="stateOutput">{ }</pre>
            </div>
            <div class="state-actions">
                <button class="btn btn-secondary" onclick="undoState()">↩️ Undo</button>
                <button class="btn btn-secondary" onclick="redoState()">↪️ Redo</button>
            </div>
        </div>
    `,
    init: () => {
        const stateHistory = [{}];
        let stateIndex = 0;
        
        window.saveStateForm = () => {
            const form = document.getElementById('stateForm');
            const state = {
                username: form.username.value,
                email: form.email.value,
                timestamp: new Date().toLocaleTimeString()
            };
            stateHistory.splice(stateIndex + 1);
            stateHistory.push(state);
            stateIndex = stateHistory.length - 1;
            updateStateDisplay();
        };
        
        window.clearStateForm = () => {
            document.getElementById('stateForm').reset();
        };
        
        window.undoState = () => {
            if (stateIndex > 0) {
                stateIndex--;
                restoreState();
            }
        };
        
        window.redoState = () => {
            if (stateIndex < stateHistory.length - 1) {
                stateIndex++;
                restoreState();
            }
        };
        
        function restoreState() {
            const state = stateHistory[stateIndex];
            const form = document.getElementById('stateForm');
            form.username.value = state.username || '';
            form.email.value = state.email || '';
            updateStateDisplay();
        }
        
        function updateStateDisplay() {
            document.getElementById('stateOutput').textContent = 
                JSON.stringify(stateHistory[stateIndex], null, 2);
        }
    }
};

// CRUD Database Demo
demoConfigs['crud-database-model'] = {
    html: `
        <div class="demo-crud">
            <h4>CRUD Operations Demo</h4>
            <div class="crud-form">
                <input type="text" id="crudInput" placeholder="Enter item name">
                <button class="btn btn-primary" onclick="crudCreate()">➕ Create</button>
            </div>
            <div class="crud-list" id="crudList">
                <p class="empty-state">No items yet. Create one above!</p>
            </div>
        </div>
    `,
    init: () => {
        let items = [];
        let nextId = 1;
        
        window.crudCreate = () => {
            const input = document.getElementById('crudInput');
            const name = input.value.trim();
            if (!name) return;
            
            items.push({ id: nextId++, name, createdAt: new Date().toLocaleTimeString() });
            input.value = '';
            renderCrudList();
        };
        
        window.crudUpdate = (id) => {
            const item = items.find(i => i.id === id);
            const newName = prompt('Enter new name:', item.name);
            if (newName && newName.trim()) {
                item.name = newName.trim();
                item.updatedAt = new Date().toLocaleTimeString();
                renderCrudList();
            }
        };
        
        window.crudDelete = (id) => {
            items = items.filter(i => i.id !== id);
            renderCrudList();
        };
        
        function renderCrudList() {
            const list = document.getElementById('crudList');
            if (items.length === 0) {
                list.innerHTML = '<p class="empty-state">No items yet. Create one above!</p>';
                return;
            }
            list.innerHTML = items.map(item => 
                '<div class="crud-item">' +
                    '<span class="item-name">' + item.name + '</span>' +
                    '<span class="item-meta">ID: ' + item.id + '</span>' +
                    '<div class="item-actions">' +
                        '<button class="btn-icon" onclick="crudUpdate(' + item.id + ')">✏️</button>' +
                        '<button class="btn-icon" onclick="crudDelete(' + item.id + ')">🗑️</button>' +
                    '</div>' +
                '</div>'
            ).join('');
        }
    }
};

// Notification System Demo (alias for toast)
demoConfigs['notification-system'] = demoConfigs['toast-notification'];

// Loading State Manager Demo
demoConfigs['loading-state-manager'] = {
    html: `
        <div class="demo-loading">
            <h4>Loading State Manager Demo</h4>
            <p>Click to simulate async operations:</p>
            <div class="loading-buttons">
                <button class="btn btn-primary" id="loadBtn1" onclick="simulateLoad(this, 2000)">Fetch Data (2s)</button>
                <button class="btn btn-secondary" id="loadBtn2" onclick="simulateLoad(this, 3000)">Process (3s)</button>
                <button class="btn btn-warning" id="loadBtn3" onclick="simulateLoadError(this)">Simulate Error</button>
            </div>
            <div id="loadingResult" class="loading-result"></div>
        </div>
    `,
    init: () => {
        window.simulateLoad = (btn, duration) => {
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Loading...';
            
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                document.getElementById('loadingResult').innerHTML = 
                    '<div class="success-msg">✓ Operation completed successfully!</div>';
            }, duration);
        };
        
        window.simulateLoadError = (btn) => {
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Loading...';
            
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                document.getElementById('loadingResult').innerHTML = 
                    '<div class="error-msg">✗ Error: Connection timeout. Please try again.</div>';
            }, 1500);
        };
    }
};

// Data Table Demo (rename from 'data-table' to match ID)
demoConfigs['data-table-component'] = demoConfigs['data-table'];

// Validation Utilities Demo
demoConfigs['validation-utilities'] = {
    html: `
        <div class="demo-validation">
            <h4>Validation Utilities Demo</h4>
            <div class="validation-tests">
                <div class="validation-test">
                    <label>Email Validation:</label>
                    <input type="text" id="valEmail" placeholder="test@example.com" oninput="validateEmail(this)">
                    <span id="valEmailResult" class="val-result"></span>
                </div>
                <div class="validation-test">
                    <label>Phone Number:</label>
                    <input type="text" id="valPhone" placeholder="(555) 123-4567" oninput="validatePhone(this)">
                    <span id="valPhoneResult" class="val-result"></span>
                </div>
                <div class="validation-test">
                    <label>Password Strength:</label>
                    <input type="password" id="valPassword" placeholder="Enter password" oninput="validatePassword(this)">
                    <span id="valPasswordResult" class="val-result"></span>
                </div>
            </div>
        </div>
    `,
    init: () => {
        window.validateEmail = (input) => {
            const result = document.getElementById('valEmailResult');
            const isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.value);
            result.textContent = isValid ? '✓ Valid email' : '✗ Invalid email';
            result.className = 'val-result ' + (isValid ? 'valid' : 'invalid');
        };
        
        window.validatePhone = (input) => {
            const result = document.getElementById('valPhoneResult');
            const cleaned = input.value.replace(/\\D/g, '');
            const isValid = cleaned.length === 10;
            result.textContent = isValid ? '✓ Valid phone' : '✗ Need 10 digits';
            result.className = 'val-result ' + (isValid ? 'valid' : 'invalid');
        };
        
        window.validatePassword = (input) => {
            const result = document.getElementById('valPasswordResult');
            const pw = input.value;
            let strength = 0;
            if (pw.length >= 8) strength++;
            if (/[A-Z]/.test(pw)) strength++;
            if (/[a-z]/.test(pw)) strength++;
            if (/[0-9]/.test(pw)) strength++;
            if (/[^A-Za-z0-9]/.test(pw)) strength++;
            
            const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
            const colors = ['invalid', 'invalid', 'warning', 'valid', 'valid'];
            result.textContent = pw.length > 0 ? labels[strength - 1] || 'Too weak' : '';
            result.className = 'val-result ' + (colors[strength - 1] || 'invalid');
        };
    }
};

// Local Storage Manager Demo
demoConfigs['local-storage-manager'] = {
    html: `
        <div class="demo-storage">
            <h4>Local Storage Manager Demo</h4>
            <div class="storage-form">
                <input type="text" id="storageKey" placeholder="Key">
                <input type="text" id="storageValue" placeholder="Value">
                <button class="btn btn-primary" onclick="storageSet()">💾 Save</button>
            </div>
            <div class="storage-actions">
                <button class="btn btn-secondary" onclick="storageGet()">📖 Get</button>
                <button class="btn btn-warning" onclick="storageRemove()">🗑️ Remove</button>
                <button class="btn btn-danger" onclick="storageClear()">🧹 Clear All</button>
            </div>
            <div id="storageOutput" class="storage-output">
                <h5>Stored Items:</h5>
                <pre id="storageItems">{ }</pre>
            </div>
        </div>
    `,
    init: () => {
        const DEMO_PREFIX = 'demo_';
        
        window.storageSet = () => {
            const key = document.getElementById('storageKey').value.trim();
            const value = document.getElementById('storageValue').value.trim();
            if (key && value) {
                localStorage.setItem(DEMO_PREFIX + key, value);
                updateStorageDisplay();
            }
        };
        
        window.storageGet = () => {
            const key = document.getElementById('storageKey').value.trim();
            if (key) {
                const value = localStorage.getItem(DEMO_PREFIX + key);
                alert(value ? 'Value: ' + value : 'Key not found');
            }
        };
        
        window.storageRemove = () => {
            const key = document.getElementById('storageKey').value.trim();
            if (key) {
                localStorage.removeItem(DEMO_PREFIX + key);
                updateStorageDisplay();
            }
        };
        
        window.storageClear = () => {
            Object.keys(localStorage).filter(k => k.startsWith(DEMO_PREFIX)).forEach(k => {
                localStorage.removeItem(k);
            });
            updateStorageDisplay();
        };
        
        function updateStorageDisplay() {
            const items = {};
            Object.keys(localStorage).filter(k => k.startsWith(DEMO_PREFIX)).forEach(k => {
                items[k.replace(DEMO_PREFIX, '')] = localStorage.getItem(k);
            });
            document.getElementById('storageItems').textContent = JSON.stringify(items, null, 2);
        }
        
        updateStorageDisplay();
    }
};

function showFieldError(form, fieldName, message) {
    const field = form[fieldName];
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    formGroup.querySelector('.error-message').textContent = message;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTemplates();
    setupEventListeners();
    handleHashNavigation();
});

// Handle hash navigation from Explore buttons on index page
function handleHashNavigation() {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
        // Map hash to category (forms, auth, database, ui, api, utils, email)
        const validCategories = ['forms', 'auth', 'database', 'ui', 'api', 'utils', 'email'];
        if (validCategories.includes(hash)) {
            currentCategory = hash;
            
            // Update active button
            document.querySelectorAll('.template-nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === hash) {
                    btn.classList.add('active');
                }
            });
            
            // Filter to show only that category
            filterTemplates();
            
            // Smooth scroll to templates grid
            const grid = document.getElementById('templatesGrid');
            if (grid) {
                setTimeout(() => {
                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }
}

// Listen for hash changes (in case user clicks back/forward)
window.addEventListener('hashchange', handleHashNavigation);

function initTemplates() {
    displayTemplates(templates);
}

function setupEventListeners() {
    // Category navigation
    document.querySelectorAll('.template-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            
            // Update active button
            document.querySelectorAll('.template-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter templates
            filterTemplates();
        });
    });
    
    // Search
    document.getElementById('templateSearch').addEventListener('input', (e) => {
        filterTemplates(e.target.value);
    });
    
    // Modal tabs
    document.querySelectorAll('.template-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function filterTemplates(searchTerm = '') {
    let filtered = templates;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(t => t.category === currentCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term) ||
            t.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }
    
    displayTemplates(filtered);
}

function displayTemplates(templatesToShow) {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';
    
    if (templatesToShow.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No templates found. Try a different search or category.</p>';
        return;
    }
    
    templatesToShow.forEach(template => {
        const card = createTemplateCard(template);
        grid.appendChild(card);
    });
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.onclick = () => openTemplateModal(template);
    
    // Tags HTML
    const tagsHTML = template.tags.slice(0, 3).map(tag => 
        `<span class="badge">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="template-card-header">
            <h3 class="template-card-title">${template.title}</h3>
        </div>
        <p class="template-card-description">${template.description}</p>
        <div class="template-card-meta">
            <span class="badge badge-primary">${template.language}</span>
            ${tagsHTML}
        </div>
    `;
    
    return card;
}

function openTemplateModal(template) {
    currentTemplate = template;
    
    // Set content
    document.getElementById('templateTitle').textContent = template.title;
    document.getElementById('templateDescription').textContent = template.description;
    document.getElementById('templateCategory').textContent = template.category;
    document.getElementById('templateCategory').className = 'badge badge-' + getCategoryBadgeClass(template.category);
    document.getElementById('templateLanguage').textContent = template.language;
    document.getElementById('templateUsage').innerHTML = template.usage;
    document.getElementById('templateNotes').innerHTML = template.notes;
    
    // Set time saved badge
    const timeSavedEl = document.getElementById('templateTimeSaved');
    if (timeSavedEl) {
        const hours = template.timeSaved || 3;
        timeSavedEl.textContent = `⏱️ ${hours}h saved`;
    }
    
    // Load demo
    loadDemo(template);
    
    // Reset tabs to demo
    switchTab('demo');
    
    // Show modal and lock background scroll
    document.getElementById('templateModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function loadDemo(template) {
    const demoArea = document.getElementById('demoArea');
    const config = demoConfigs[template.id] || defaultDemo;
    
    demoArea.innerHTML = config.html;
    
    // Initialize demo after rendering
    setTimeout(() => {
        if (config.init) {
            config.init();
        }
    }, 50);
}

window.resetDemo = function() {
    if (currentTemplate) {
        loadDemo(currentTemplate);
    }
}

window.closeTemplateModal = function() {
    document.getElementById('templateModal').classList.remove('active');
    document.body.style.overflow = '';
    currentTemplate = null;
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.template-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.template-tab-content .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function getCategoryBadgeClass(category) {
    const classes = {
        'forms': 'primary',
        'auth': 'warning',
        'database': 'success',
        'api': 'primary',
        'ui': 'primary',
        'email': 'warning',
        'utils': 'success'
    };
    return classes[category] || 'primary';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTemplateModal();
    }
});

// Close modal on overlay click
document.getElementById('templateModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'templateModal') {
        closeTemplateModal();
    }
});
