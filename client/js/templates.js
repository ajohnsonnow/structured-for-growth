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
                            <input type="password" placeholder="••••••••" value="">
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
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
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

// RESTful API Controller Demo
demoConfigs['rest-api-controller'] = {
    html: `
        <div class="demo-api">
            <h4>RESTful API Controller Demo</h4>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">Simulated REST API endpoints</p>
            <div class="api-endpoints">
                <div class="endpoint-group">
                    <label>Select Endpoint:</label>
                    <select id="apiMethod" onchange="updateApiEndpoint()">
                        <option value="GET-all">GET /api/users (List All)</option>
                        <option value="GET-one">GET /api/users/:id (Get One)</option>
                        <option value="POST">POST /api/users (Create)</option>
                        <option value="PUT">PUT /api/users/:id (Update)</option>
                        <option value="DELETE">DELETE /api/users/:id (Delete)</option>
                    </select>
                </div>
                <div id="apiInputs" class="api-inputs" style="margin-top: var(--spacing-md);"></div>
                <button class="btn btn-primary" onclick="executeApiCall()" style="margin-top: var(--spacing-md);">
                    🚀 Execute Request
                </button>
            </div>
            <div id="apiResponse" class="api-response" style="margin-top: var(--spacing-lg);">
                <h5>Response:</h5>
                <pre id="apiResponseBody">// Click "Execute Request" to see response</pre>
            </div>
        </div>
    `,
    init: () => {
        const mockUsers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
            { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' }
        ];
        
        window.updateApiEndpoint = () => {
            const method = document.getElementById('apiMethod').value;
            const inputsDiv = document.getElementById('apiInputs');
            
            if (method === 'GET-all') {
                inputsDiv.innerHTML = '<small style="color: var(--text-muted);">No parameters needed</small>';
            } else if (method === 'GET-one' || method === 'DELETE') {
                inputsDiv.innerHTML = '<input type="number" id="apiId" placeholder="User ID (1-3)" value="1" style="padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">';
            } else if (method === 'POST') {
                inputsDiv.innerHTML = '<input type="text" id="apiName" placeholder="Name" style="margin-right: var(--spacing-sm); padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"><input type="email" id="apiEmail" placeholder="Email" style="padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">';
            } else if (method === 'PUT') {
                inputsDiv.innerHTML = '<input type="number" id="apiId" placeholder="User ID" value="1" style="margin-right: var(--spacing-sm); padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"><input type="text" id="apiName" placeholder="New Name" style="padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">';
            }
        };
        
        window.executeApiCall = () => {
            const method = document.getElementById('apiMethod').value;
            const responseEl = document.getElementById('apiResponseBody');
            let response = {};
            
            if (method === 'GET-all') {
                response = { status: 200, data: mockUsers, meta: { total: mockUsers.length } };
            } else if (method === 'GET-one') {
                const id = parseInt(document.getElementById('apiId')?.value) || 1;
                const user = mockUsers.find(u => u.id === id);
                response = user ? { status: 200, data: user } : { status: 404, error: 'User not found' };
            } else if (method === 'POST') {
                const name = document.getElementById('apiName')?.value || 'New User';
                const email = document.getElementById('apiEmail')?.value || 'new@example.com';
                response = { status: 201, data: { id: 4, name, email, role: 'user' }, message: 'User created' };
            } else if (method === 'PUT') {
                const id = parseInt(document.getElementById('apiId')?.value) || 1;
                const name = document.getElementById('apiName')?.value || 'Updated';
                response = { status: 200, data: { id, name, updated_at: new Date().toISOString() }, message: 'User updated' };
            } else if (method === 'DELETE') {
                const id = parseInt(document.getElementById('apiId')?.value) || 1;
                response = { status: 200, message: 'User ' + id + ' deleted successfully' };
            }
            
            responseEl.textContent = JSON.stringify(response, null, 2);
        };
        
        window.updateApiEndpoint();
    }
};

// API Client Wrapper Demo
demoConfigs['api-client-wrapper'] = {
    html: `
        <div class="demo-api-client">
            <h4>API Client Wrapper Demo</h4>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">HTTP client with interceptors & error handling</p>
            <div class="client-config" style="margin-bottom: var(--spacing-md);">
                <label style="display: block; margin-bottom: var(--spacing-xs); color: var(--text-secondary);">Base URL:</label>
                <input type="text" id="clientBaseUrl" value="https://jsonplaceholder.typicode.com" style="width: 100%; padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
            </div>
            <div class="client-actions" style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                <button class="btn btn-primary" onclick="apiClientGet()">GET /posts/1</button>
                <button class="btn btn-success" onclick="apiClientPost()">POST /posts</button>
                <button class="btn btn-danger" onclick="apiClientError()">GET /404 (Error)</button>
            </div>
            <div id="clientStatus" style="margin-top: var(--spacing-md); padding: var(--spacing-sm); border-radius: var(--radius-md); background: var(--bg-tertiary);">
                <span id="clientStatusText">Ready to make requests...</span>
            </div>
            <div id="clientResponse" style="margin-top: var(--spacing-md);">
                <h5>Response:</h5>
                <pre id="clientResponseBody" style="background: var(--bg-card); padding: var(--spacing-md); border-radius: var(--radius-md); max-height: 200px; overflow: auto;">// Click a button to make a request</pre>
            </div>
        </div>
    `,
    init: () => {
        const setStatus = (text, isError = false) => {
            const el = document.getElementById('clientStatusText');
            el.textContent = text;
            el.style.color = isError ? '#ef4444' : '#10b981';
        };
        
        const showResponse = (data) => {
            document.getElementById('clientResponseBody').textContent = JSON.stringify(data, null, 2);
        };
        
        window.apiClientGet = async () => {
            const baseUrl = document.getElementById('clientBaseUrl').value;
            setStatus('⏳ GET request in progress...');
            try {
                const res = await fetch(baseUrl + '/posts/1');
                const data = await res.json();
                setStatus('✓ GET successful (200 OK)');
                showResponse(data);
            } catch (err) {
                setStatus('✗ Request failed: ' + err.message, true);
                showResponse({ error: err.message });
            }
        };
        
        window.apiClientPost = async () => {
            const baseUrl = document.getElementById('clientBaseUrl').value;
            setStatus('⏳ POST request in progress...');
            try {
                const res = await fetch(baseUrl + '/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: 'Demo Post', body: 'Created via API Client', userId: 1 })
                });
                const data = await res.json();
                setStatus('✓ POST successful (201 Created)');
                showResponse(data);
            } catch (err) {
                setStatus('✗ Request failed: ' + err.message, true);
                showResponse({ error: err.message });
            }
        };
        
        window.apiClientError = async () => {
            const baseUrl = document.getElementById('clientBaseUrl').value;
            setStatus('⏳ Testing error handling...');
            try {
                const res = await fetch(baseUrl + '/nonexistent-endpoint-404');
                if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
                const data = await res.json();
                showResponse(data);
            } catch (err) {
                setStatus('✗ Error handled gracefully: ' + err.message, true);
                showResponse({ error: err.message, handled: true, suggestion: 'Implement retry logic or fallback' });
            }
        };
    }
};

// Email Service Demo
demoConfigs['email-service'] = {
    html: `
        <div class="demo-email">
            <h4>Email Service Demo</h4>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">Simulated email sending with templates</p>
            <div class="email-form demo-form">
                <div class="form-group">
                    <label>Email Template:</label>
                    <select id="emailTemplate" onchange="previewEmailTemplate()" style="width: 100%; padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                        <option value="welcome">Welcome Email</option>
                        <option value="reset">Password Reset</option>
                        <option value="notification">Notification</option>
                        <option value="invoice">Invoice</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Recipient:</label>
                    <input type="email" id="emailTo" value="user@example.com" style="width: 100%; padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                </div>
                <div class="form-group">
                    <label>Variables (JSON):</label>
                    <input type="text" id="emailVars" value='{"name": "John", "company": "Acme Inc"}' style="width: 100%; padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                </div>
                <button class="btn btn-primary" onclick="sendDemoEmail()">📧 Send Email</button>
            </div>
            <div id="emailPreview" style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                <h5 style="margin-bottom: var(--spacing-sm);">Email Preview:</h5>
                <div id="emailPreviewContent"></div>
            </div>
        </div>
    `,
    init: () => {
        const emailTemplates = {
            welcome: { subject: "Welcome to {{company}}!", body: "Hi {{name}},\n\nWelcome to {{company}}! We are excited to have you on board.\n\nBest regards,\nThe Team" },
            reset: { subject: "Password Reset Request", body: "Hi {{name}},\n\nClick here to reset your password: [Reset Link]\n\nIf you did not request this, ignore this email." },
            notification: { subject: "New Notification", body: "Hi {{name}},\n\nYou have a new notification from {{company}}.\n\nCheck your dashboard for details." },
            invoice: { subject: "Invoice from {{company}}", body: "Hi {{name}},\n\nPlease find your invoice attached.\n\nAmount Due: $99.00\nDue Date: " + new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString() }
        };
        
        window.previewEmailTemplate = () => {
            const template = document.getElementById('emailTemplate').value;
            const varsStr = document.getElementById('emailVars').value;
            let vars = {};
            try { vars = JSON.parse(varsStr); } catch(e) { vars = { name: 'User', company: 'Company' }; }
            
            const t = emailTemplates[template];
            let subject = t.subject;
            let body = t.body;
            
            Object.entries(vars).forEach(([key, val]) => {
                subject = subject.replace(new RegExp('{{' + key + '}}', 'g'), val);
                body = body.replace(new RegExp('{{' + key + '}}', 'g'), val);
            });
            
            document.getElementById('emailPreviewContent').innerHTML = 
                '<strong>Subject:</strong> ' + subject + '<br><br>' +
                '<strong>Body:</strong><br><pre style="white-space: pre-wrap; margin-top: var(--spacing-xs);">' + body + '</pre>';
        };
        
        window.sendDemoEmail = () => {
            const to = document.getElementById('emailTo').value;
            const template = document.getElementById('emailTemplate').value;
            
            document.getElementById('emailPreviewContent').innerHTML = 
                '<div class="success-msg">✓ Email sent successfully!<br><br>' +
                '<small>To: ' + to + '<br>Template: ' + template + '<br>Timestamp: ' + new Date().toISOString() + '</small></div>';
        };
        
        window.previewEmailTemplate();
    }
};

// Debounce & Throttle Demo
demoConfigs['debounce-throttle'] = {
    html: `
        <div class="demo-debounce">
            <h4>Debounce & Throttle Demo</h4>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">See the difference in real-time</p>
            
            <div class="debounce-section" style="margin-bottom: var(--spacing-lg);">
                <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">🔍 Debounce (Search Input)</label>
                <small style="color: var(--text-muted); display: block; margin-bottom: var(--spacing-sm);">Waits until you stop typing (500ms delay)</small>
                <input type="text" id="debounceInput" placeholder="Type here..." oninput="handleDebounceInput()" style="width: 100%; padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                <div id="debounceOutput" style="margin-top: var(--spacing-sm); color: var(--text-muted);">
                    <span>Keystrokes: <strong id="debounceKeystrokes">0</strong></span> | 
                    <span>API Calls: <strong id="debounceCalls">0</strong></span>
                </div>
            </div>
            
            <div class="throttle-section" style="margin-bottom: var(--spacing-lg);">
                <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">🖱️ Throttle (Mouse Move)</label>
                <small style="color: var(--text-muted); display: block; margin-bottom: var(--spacing-sm);">Limits updates to once per 100ms</small>
                <div id="throttleArea" onmousemove="handleThrottleMove(event)" style="height: 100px; background: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: crosshair;">
                    Move mouse here
                </div>
                <div id="throttleOutput" style="margin-top: var(--spacing-sm); color: var(--text-muted);">
                    <span>Mouse Events: <strong id="throttleEvents">0</strong></span> | 
                    <span>Processed: <strong id="throttleProcessed">0</strong></span>
                </div>
            </div>
            
            <div class="comparison" style="background: var(--bg-card); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h5>📊 Efficiency Comparison</h5>
                <div id="efficiencyStats" style="margin-top: var(--spacing-sm); font-size: 0.9rem;"></div>
            </div>
        </div>
    `,
    init: () => {
        let debounceKeystrokes = 0;
        let debounceCalls = 0;
        let throttleEvents = 0;
        let throttleProcessed = 0;
        let debounceTimer = null;
        let throttleTimer = null;
        let canThrottle = true;
        
        window.handleDebounceInput = () => {
            debounceKeystrokes++;
            document.getElementById('debounceKeystrokes').textContent = debounceKeystrokes;
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                debounceCalls++;
                document.getElementById('debounceCalls').textContent = debounceCalls;
                updateEfficiency();
            }, 500);
        };
        
        window.handleThrottleMove = (e) => {
            throttleEvents++;
            document.getElementById('throttleEvents').textContent = throttleEvents;
            
            if (canThrottle) {
                canThrottle = false;
                throttleProcessed++;
                document.getElementById('throttleProcessed').textContent = throttleProcessed;
                document.getElementById('throttleArea').textContent = 'X: ' + e.offsetX + ', Y: ' + e.offsetY;
                updateEfficiency();
                
                setTimeout(() => { canThrottle = true; }, 100);
            }
        };
        
        function updateEfficiency() {
            const debounceEff = debounceKeystrokes > 0 ? Math.round((1 - debounceCalls / debounceKeystrokes) * 100) : 0;
            const throttleEff = throttleEvents > 0 ? Math.round((1 - throttleProcessed / throttleEvents) * 100) : 0;
            
            document.getElementById('efficiencyStats').innerHTML = 
                '• Debounce saved <strong style="color: #10b981;">' + debounceEff + '%</strong> of function calls<br>' +
                '• Throttle saved <strong style="color: #10b981;">' + throttleEff + '%</strong> of function calls';
        }
    }
};

// Date & Time Utilities Demo
demoConfigs['date-time-utils'] = {
    html: `
        <div class="demo-datetime">
            <h4>Date & Time Utilities Demo</h4>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">Formatting, parsing, and relative time</p>
            
            <div class="datetime-section" style="margin-bottom: var(--spacing-lg);">
                <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">📅 Date Formatting</label>
                <input type="datetime-local" id="dateInput" onchange="formatDemoDate()" style="padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                <div id="dateFormats" style="margin-top: var(--spacing-md); background: var(--bg-card); padding: var(--spacing-md); border-radius: var(--radius-md);"></div>
            </div>
            
            <div class="relative-section" style="margin-bottom: var(--spacing-lg);">
                <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">⏰ Relative Time (timeAgo)</label>
                <div class="relative-examples" style="display: grid; gap: var(--spacing-sm);" id="relativeExamples"></div>
            </div>
            
            <div class="duration-section">
                <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">⏱️ Duration Formatting</label>
                <input type="number" id="durationInput" placeholder="Seconds" value="3665" oninput="formatDuration()" style="padding: var(--spacing-sm); background: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);">
                <span id="durationOutput" style="margin-left: var(--spacing-sm); font-weight: 600; color: var(--primary-color);"></span>
            </div>
        </div>
    `,
    init: () => {
        // Set default date to now
        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('dateInput').value = localISOTime;
        
        window.formatDemoDate = () => {
            const input = document.getElementById('dateInput').value;
            if (!input) return;
            const date = new Date(input);
            
            const formats = [
                { label: 'ISO 8601', value: date.toISOString() },
                { label: 'US Format', value: (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() },
                { label: 'EU Format', value: date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() },
                { label: 'Long Date', value: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'With Time', value: date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) },
                { label: 'Unix Timestamp', value: Math.floor(date.getTime() / 1000) }
            ];
            
            document.getElementById('dateFormats').innerHTML = formats.map(f => 
                '<div style="display: flex; justify-content: space-between; padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border-light);"><span style="color: var(--text-secondary);">' + f.label + ':</span><code style="color: var(--primary-color);">' + f.value + '</code></div>'
            ).join('');
        };
        
        function timeAgo(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            const intervals = [
                { label: 'year', seconds: 31536000 },
                { label: 'month', seconds: 2592000 },
                { label: 'week', seconds: 604800 },
                { label: 'day', seconds: 86400 },
                { label: 'hour', seconds: 3600 },
                { label: 'minute', seconds: 60 }
            ];
            
            for (const interval of intervals) {
                const count = Math.floor(seconds / interval.seconds);
                if (count >= 1) {
                    return count + ' ' + interval.label + (count > 1 ? 's' : '') + ' ago';
                }
            }
            return 'Just now';
        }
        
        const examples = [
            { label: 'Just now', date: new Date() },
            { label: '5 minutes ago', date: new Date(Date.now() - 5 * 60 * 1000) },
            { label: '2 hours ago', date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { label: 'Yesterday', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            { label: 'Last week', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ];
        
        document.getElementById('relativeExamples').innerHTML = examples.map(ex => 
            '<div style="display: flex; justify-content: space-between; padding: var(--spacing-sm); background: var(--bg-card); border-radius: var(--radius-sm);"><span>' + ex.label + '</span><code style="color: var(--primary-color);">' + timeAgo(ex.date) + '</code></div>'
        ).join('');
        
        window.formatDuration = () => {
            const seconds = parseInt(document.getElementById('durationInput').value) || 0;
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            
            let result = '';
            if (h > 0) result += h + 'h ';
            if (m > 0) result += m + 'm ';
            if (s > 0 || result === '') result += s + 's';
            
            document.getElementById('durationOutput').textContent = result.trim();
        };
        
        window.formatDemoDate();
        window.formatDuration();
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

// Mobile Menu Toggle for templates page
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            }
        });
        
        // Close on link click
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Initialize mobile menu
initMobileMenu();
