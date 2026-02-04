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
            <div class="demo-icon">📝</div>
            <h4>Code Preview</h4>
            <p>This template provides reusable code that you can copy and integrate into your project.</p>
            <ul class="demo-features">
                <li>✓ Production-ready code</li>
                <li>✓ Well-documented</li>
                <li>✓ Easy to customize</li>
                <li>✓ Best practices included</li>
            </ul>
            <p class="demo-tip">💡 Switch to the <strong>Code</strong> tab to view and copy the implementation.</p>
        </div>
    `,
    init: () => {}
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
});

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
    document.getElementById('codeLanguage').textContent = template.language;
    document.getElementById('templateCode').textContent = template.code;
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
    
    // Show modal
    document.getElementById('templateModal').classList.add('active');
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

window.copyCode = function() {
    const code = currentTemplate.code;
    
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code. Please select and copy manually.');
    });
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
