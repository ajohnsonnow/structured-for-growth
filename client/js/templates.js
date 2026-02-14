// Templates Page JavaScript
import { templates } from './templateData.js';
import { initNavigation } from './modules/navigation.js';

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

// Build a dynamic code-preview demo from the template's code property
function buildCodePreviewDemo(template) {
    const codeSnippet = (template.code || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const tags = (template.tags || []).map(t =>
        '<span style="display:inline-block;padding:2px 8px;border-radius:var(--radius-sm);font-size:0.7rem;font-weight:600;background:rgba(61,122,95,0.2);color:var(--forest-green-accent);border:1px solid rgba(61,122,95,0.3);">' + t + '</span>'
    ).join('');
    return {
        html: `
            <div class="demo-code-preview">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-md);">
                    <div>
                        <h4 style="color:var(--text-primary);margin:0;">${template.title}</h4>
                        <span style="font-size:0.85rem;color:var(--text-muted);">${template.language} · ${template.category}</span>
                    </div>
                    <button class="btn btn-secondary" id="copyCodeBtn" style="font-size:0.85rem;">📋 Copy Code</button>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:var(--spacing-md);">${tags}</div>
                <pre style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--spacing-md);max-height:320px;overflow:auto;font-size:0.82rem;line-height:1.55;color:var(--text-secondary);white-space:pre-wrap;word-break:break-word;"><code>${codeSnippet}</code></pre>
            </div>
        `,
        init: () => {
            document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
                navigator.clipboard.writeText(template.code || '').then(() => {
                    const btn = document.getElementById('copyCodeBtn');
                    btn.textContent = '✓ Copied!';
                    btn.style.color = '#10b981';
                    setTimeout(() => { btn.textContent = '📋 Copy Code'; btn.style.color = ''; }, 2000);
                });
            });
        }
    };
}

// ── Enterprise Demo Configs: Compliance ────────────────────
demoConfigs['rbac-middleware'] = {
    html: `
        <div class="demo-rbac">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🔐 RBAC Access Control Simulator</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Test role-based access to protected resources</p>
            <div style="display:flex;gap:var(--spacing-md);flex-wrap:wrap;margin-bottom:var(--spacing-md);">
                <div style="flex:1;min-width:200px;">
                    <label style="display:block;margin-bottom:var(--spacing-xs);color:var(--text-secondary);font-weight:600;">Select Role:</label>
                    <select id="rbacRole" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user" selected>User</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <div style="flex:1;min-width:200px;">
                    <label style="display:block;margin-bottom:var(--spacing-xs);color:var(--text-secondary);font-weight:600;">Test Permission:</label>
                    <select id="rbacPerm" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                        <option value="users:read">users:read</option>
                        <option value="users:write">users:write</option>
                        <option value="users:delete">users:delete</option>
                        <option value="reports:read">reports:read</option>
                        <option value="reports:write">reports:write</option>
                        <option value="audit:read">audit:read</option>
                        <option value="settings:write">settings:write</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" id="rbacCheckBtn">🔍 Check Access</button>
            <div id="rbacResult" style="margin-top:var(--spacing-md);padding:var(--spacing-md);border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border-light);min-height:80px;">
                <span style="color:var(--text-muted);">Select a role and permission, then click Check Access</span>
            </div>
            <div style="margin-top:var(--spacing-md);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: SOC 2 CC6.1 · ISO 27001 A.8.2 · HIPAA §164.312(a) · PCI DSS Req 7</span>
            </div>
        </div>
    `,
    init: () => {
        const HIERARCHY = { super_admin: ['admin','manager','user','viewer'], admin: ['manager','user','viewer'], manager: ['user','viewer'], user: ['viewer'], viewer: [] };
        const PERMS = { 'users:read': ['viewer'], 'users:write': ['admin'], 'users:delete': ['super_admin'], 'reports:read': ['user'], 'reports:write': ['manager'], 'audit:read': ['admin'], 'settings:write': ['super_admin'] };
        function getEffective(r) { return [r, ...(HIERARCHY[r]||[])]; }
        function check(role, perm) { return (PERMS[perm]||[]).some(r => getEffective(role).includes(r)); }

        document.getElementById('rbacCheckBtn').addEventListener('click', () => {
            const role = document.getElementById('rbacRole').value;
            const perm = document.getElementById('rbacPerm').value;
            const granted = check(role, perm);
            const eff = getEffective(role);
            document.getElementById('rbacResult').innerHTML = granted
                ? '<div style="color:#10b981;font-weight:600;font-size:1.1rem;">✓ ACCESS GRANTED</div><div style="color:var(--text-secondary);margin-top:var(--spacing-xs);font-size:0.85rem;">Role <strong>' + role + '</strong> has permission <strong>' + perm + '</strong></div><div style="color:var(--text-muted);font-size:0.75rem;margin-top:var(--spacing-xs);">Effective roles: ' + eff.join(', ') + '</div>'
                : '<div style="color:#ef4444;font-weight:600;font-size:1.1rem;">✗ ACCESS DENIED</div><div style="color:var(--text-secondary);margin-top:var(--spacing-xs);font-size:0.85rem;">Role <strong>' + role + '</strong> lacks permission <strong>' + perm + '</strong></div><div style="color:var(--text-muted);font-size:0.75rem;margin-top:var(--spacing-xs);">Effective roles: ' + eff.join(', ') + '</div>';
        });
    }
};

demoConfigs['chain-hashed-audit-logger'] = {
    html: `
        <div class="demo-audit">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">📝 Tamper-Evident Audit Log</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Each entry is hash-chained to the previous - modify one and the chain breaks.</p>
            <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);flex-wrap:wrap;">
                <input type="text" id="auditAction" placeholder="Action (e.g., USER_LOGIN)" style="flex:1;min-width:150px;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                <input type="text" id="auditUser" placeholder="User ID" value="admin@sfg.com" style="flex:1;min-width:150px;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                <button class="btn btn-primary" id="auditLogBtn">➕ Log Entry</button>
            </div>
            <div id="auditChain" style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--spacing-md);max-height:250px;overflow-y:auto;">
                <span style="color:var(--text-muted);">No audit entries yet. Log an action above.</span>
            </div>
            <div style="margin-top:var(--spacing-sm);display:flex;gap:var(--spacing-sm);">
                <button class="btn btn-warning" id="auditTamperBtn" style="font-size:0.85rem;">🔓 Simulate Tamper</button>
                <button class="btn btn-secondary" id="auditVerifyBtn" style="font-size:0.85rem;">🔍 Verify Chain</button>
            </div>
        </div>
    `,
    init: () => {
        const entries = [];
        function simpleHash(str) {
            let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
            return Math.abs(h).toString(16).padStart(8, '0');
        }
        function render() {
            if (!entries.length) { document.getElementById('auditChain').innerHTML = '<span style="color:var(--text-muted);">No entries yet.</span>'; return; }
            document.getElementById('auditChain').innerHTML = entries.map((e, i) =>
                '<div style="padding:var(--spacing-sm);border-bottom:1px solid var(--border-light);font-size:0.82rem;' + (e.tampered ? 'background:rgba(239,68,68,0.1);' : '') + '">' +
                '<div style="display:flex;justify-content:space-between;"><strong style="color:var(--text-primary);">#' + (i+1) + ' ' + e.action + '</strong><span style="color:var(--text-muted);">' + e.timestamp + '</span></div>' +
                '<div style="color:var(--text-secondary);">User: ' + e.userId + '</div>' +
                '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.7rem;">Hash: ' + e.hash + ' | Prev: ' + e.prevHash + '</div>' +
                '</div>'
            ).join('');
        }
        document.getElementById('auditLogBtn').addEventListener('click', () => {
            const action = document.getElementById('auditAction').value.trim() || 'USER_ACTION';
            const userId = document.getElementById('auditUser').value.trim() || 'anonymous';
            const prevHash = entries.length ? entries[entries.length-1].hash : '00000000';
            const ts = new Date().toLocaleTimeString();
            const hash = simpleHash(prevHash + action + userId + ts);
            entries.push({ action, userId, timestamp: ts, hash, prevHash, tampered: false });
            document.getElementById('auditAction').value = '';
            render();
        });
        document.getElementById('auditTamperBtn').addEventListener('click', () => {
            if (entries.length < 2) { alert('Log at least 2 entries first'); return; }
            entries[0].action = 'TAMPERED_ACTION';
            entries[0].tampered = true;
            render();
        });
        document.getElementById('auditVerifyBtn').addEventListener('click', () => {
            if (!entries.length) return;
            let valid = true;
            for (let i = 1; i < entries.length; i++) {
                const expected = entries[i-1].hash;
                if (entries[i].prevHash !== expected) { valid = false; break; }
            }
            // Also check if any entry was tampered
            for (const e of entries) { if (e.tampered) { valid = false; break; } }
            const el = document.getElementById('auditChain');
            const msg = valid
                ? '<div style="padding:var(--spacing-sm);background:rgba(16,185,129,0.15);border-radius:var(--radius-md);color:#10b981;font-weight:600;margin-bottom:var(--spacing-sm);">✓ Chain integrity verified - all hashes valid</div>'
                : '<div style="padding:var(--spacing-sm);background:rgba(239,68,68,0.15);border-radius:var(--radius-md);color:#ef4444;font-weight:600;margin-bottom:var(--spacing-sm);">✗ Chain integrity BROKEN - tampering detected!</div>';
            el.innerHTML = msg + el.innerHTML;
        });
    }
};

// ── Enterprise Demo Configs: Compliance (continued) ────────

demoConfigs['aes256-field-encryption'] = {
    html: `
        <div class="demo-encryption">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🔐 AES-256-GCM Field Encryption</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Encrypt and decrypt sensitive fields - see how data looks at rest vs. in use</p>
            <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);flex-wrap:wrap;">
                <input type="text" id="encInput" placeholder="Enter sensitive data (e.g., SSN, email)" value="123-45-6789" style="flex:1;min-width:200px;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                <button class="btn btn-primary" id="encBtn">🔒 Encrypt</button>
                <button class="btn btn-secondary" id="decBtn">🔓 Decrypt</button>
            </div>
            <div id="encFields" style="display:grid;gap:var(--spacing-sm);">
                <div style="padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-bottom:4px;">📄 Plaintext Value</div>
                    <div id="encPlain" style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-primary);word-break:break-all;">123-45-6789</div>
                </div>
                <div style="padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-bottom:4px;">🔒 Encrypted (stored in DB)</div>
                    <div id="encCipher" style="font-family:var(--font-mono);font-size:0.82rem;color:#ef4444;word-break:break-all;">-</div>
                </div>
                <div style="padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-bottom:4px;">🔓 Decrypted (application layer)</div>
                    <div id="encDecrypted" style="font-family:var(--font-mono);font-size:0.85rem;color:#10b981;word-break:break-all;">-</div>
                </div>
            </div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: GDPR Art. 32 · HIPAA §164.312(a)(2)(iv) · PCI DSS Req 3 · SOC 2 CC6.1</span>
            </div>
        </div>
    `,
    init: () => {
        function simEncrypt(text) {
            const iv = Array.from({length:16}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
            let enc = ''; for (let i = 0; i < text.length; i++) { enc += (text.charCodeAt(i) ^ 0x5A).toString(16).padStart(2,'0'); }
            const tag = Array.from({length:16}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
            return iv + ':' + enc + ':' + tag;
        }
        function simDecrypt(cipher, original) { return original; }
        let lastPlain = '123-45-6789';
        document.getElementById('encBtn').addEventListener('click', () => {
            lastPlain = document.getElementById('encInput').value || 'test-data';
            document.getElementById('encPlain').textContent = lastPlain;
            document.getElementById('encCipher').textContent = simEncrypt(lastPlain);
            document.getElementById('encDecrypted').textContent = '-';
        });
        document.getElementById('decBtn').addEventListener('click', () => {
            const cipher = document.getElementById('encCipher').textContent;
            if (cipher === '-') { alert('Encrypt something first!'); return; }
            document.getElementById('encDecrypted').textContent = lastPlain;
        });
    }
};

demoConfigs['pii-data-masking'] = {
    html: `
        <div class="demo-masking">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🎭 PII Data Masking</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Enter text with PII - SSN, email, phone, credit card, or IP - and watch it get masked in real time</p>
            <textarea id="piiInput" rows="4" placeholder="Try: John Doe, SSN 123-45-6789, email john@acme.com, phone 503-555-1234, card 4111-1111-1111-1111, IP 192.168.1.100" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-mono);font-size:0.85rem;resize:vertical;">John Doe, SSN 123-45-6789, email john@acme.com, phone 503-555-1234, card 4111-1111-1111-1111, IP 192.168.1.100</textarea>
            <button class="btn btn-primary" id="maskBtn" style="margin-top:var(--spacing-sm);">🎭 Apply Masking</button>
            <div id="piiResult" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:0.85rem;color:var(--text-primary);white-space:pre-wrap;min-height:60px;">
                <span style="color:var(--text-muted);">Masked output will appear here</span>
            </div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: GDPR Art. 25 · HIPAA Safe Harbor (18 identifiers) · SOC 2 CC6.1</span>
            </div>
        </div>
    `,
    init: () => {
        document.getElementById('maskBtn').addEventListener('click', () => {
            let text = document.getElementById('piiInput').value;
            let count = 0;
            text = text.replace(/\b(\d{3})-(\d{2})-(\d{4})\b/g, () => { count++; return '1**-**-***9'; });
            text = text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (m, local, domain) => { count++; return local[0] + '***@' + domain; });
            text = text.replace(/\b(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g, (m, a, b, c) => { count++; return '(***) ***-' + c; });
            text = text.replace(/\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/g, (m, a, b, c, d) => { count++; return '**** **** **** ' + d; });
            text = text.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, () => { count++; return '***.***.***.***'; });
            document.getElementById('piiResult').innerHTML = '<div style="color:#10b981;font-weight:600;margin-bottom:var(--spacing-xs);">✓ ' + count + ' PII pattern(s) masked</div>' + text;
        });
    }
};

demoConfigs['breach-notification-engine'] = {
    html: `
        <div class="demo-breach">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🚨 Breach Notification Simulator</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Configure an incident and see framework-specific notification deadlines</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);">
                <div>
                    <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:600;font-size:0.85rem;">Records Affected</label>
                    <input type="number" id="breachCount" value="1200" min="1" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                </div>
                <div>
                    <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:600;font-size:0.85rem;">Data Types</label>
                    <select id="breachType" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                        <option value="phi">PHI (Health Data)</option>
                        <option value="pii">PII (Personal Data)</option>
                        <option value="financial">Financial Data</option>
                        <option value="credentials">Credentials</option>
                    </select>
                </div>
            </div>
            <div style="margin-bottom:var(--spacing-md);">
                <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:600;font-size:0.85rem;">Applicable Frameworks</label>
                <div id="breachFrameworks" style="display:flex;flex-wrap:wrap;gap:var(--spacing-xs);"></div>
            </div>
            <button class="btn btn-primary" id="breachReportBtn">🚨 Generate Report</button>
            <div id="breachResult" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:80px;">
                <span style="color:var(--text-muted);">Configure incident and click Generate Report</span>
            </div>
        </div>
    `,
    init: () => {
        const FW = { dora: { auth: 'National Competent Authority', hours: 4, label: 'DORA Initial' }, nis2: { auth: 'National CSIRT', hours: 24, label: 'NIS 2 Early Warning' }, gdpr: { auth: 'Supervisory Authority (DPA)', hours: 72, label: 'GDPR Art. 33' }, hipaa: { auth: 'HHS OCR', hours: 1440, label: 'HIPAA Breach Notification' }, pci: { auth: 'Acquiring Bank / Card Brands', hours: 72, label: 'PCI Incident' } };
        const fwDiv = document.getElementById('breachFrameworks');
        Object.keys(FW).forEach(fw => {
            const checked = ['gdpr','hipaa'].includes(fw) ? 'checked' : '';
            fwDiv.innerHTML += '<label style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-tertiary);border-radius:var(--radius-sm);font-size:0.85rem;color:var(--text-secondary);cursor:pointer;"><input type="checkbox" value="' + fw + '" ' + checked + ' style="accent-color:var(--forest-green-accent);">' + fw.toUpperCase() + '</label>';
        });
        document.getElementById('breachReportBtn').addEventListener('click', () => {
            const count = parseInt(document.getElementById('breachCount').value) || 100;
            const dataType = document.getElementById('breachType').value;
            const frameworks = [...document.querySelectorAll('#breachFrameworks input:checked')].map(i => i.value);
            let severity = 'LOW';
            if (count > 500) severity = 'HIGH';
            if (count > 5000) severity = 'CRITICAL';
            if (['phi','credentials'].includes(dataType) && count > 500) severity = 'CRITICAL';
            if (['phi','pii','financial','credentials'].includes(dataType)) severity = severity === 'LOW' ? 'HIGH' : severity;
            const colors = { LOW: '#3b82f6', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
            const now = new Date();
            let html = '<div style="color:' + colors[severity] + ';font-weight:700;font-size:1.1rem;margin-bottom:var(--spacing-sm);">⚠ Severity: ' + severity + '</div>';
            html += '<div style="color:var(--text-secondary);margin-bottom:var(--spacing-md);font-size:0.85rem;">Incident ID: INC-' + Date.now() + ' · ' + count.toLocaleString() + ' ' + dataType.toUpperCase() + ' records</div>';
            if (frameworks.length === 0) { html += '<div style="color:var(--text-muted);">No frameworks selected.</div>'; }
            else {
                html += '<div style="font-weight:600;color:var(--text-primary);margin-bottom:var(--spacing-xs);">📋 Notification Deadlines (sorted by urgency):</div>';
                const deadlines = frameworks.map(fw => { const d = FW[fw]; const dl = new Date(now.getTime() + d.hours * 3600000); return { ...d, fw, deadline: dl }; }).sort((a, b) => a.deadline - b.deadline);
                deadlines.forEach(d => {
                    const remaining = ((d.deadline - now) / 3600000).toFixed(1);
                    const urgent = d.hours <= 24;
                    html += '<div style="padding:var(--spacing-sm);margin-bottom:4px;background:' + (urgent ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)') + ';border-radius:var(--radius-sm);border-left:3px solid ' + (urgent ? '#ef4444' : '#3b82f6') + ';font-size:0.85rem;">';
                    html += '<strong style="color:var(--text-primary);">' + d.label + '</strong> (' + d.fw.toUpperCase() + ')<br>';
                    html += '<span style="color:var(--text-secondary);">Authority: ' + d.auth + '</span><br>';
                    html += '<span style="color:' + (urgent ? '#ef4444' : 'var(--text-muted)') + ';">⏰ ' + remaining + 'h remaining - Deadline: ' + d.deadline.toLocaleString() + '</span>';
                    html += '</div>';
                });
            }
            document.getElementById('breachResult').innerHTML = html;
        });
    }
};

demoConfigs['mfa-middleware'] = {
    html: `
        <div class="demo-mfa">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🔑 Multi-Factor Authentication Simulator</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Simulate TOTP enrollment and verification with rate-limiting lockout</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-md);">
                <div style="padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">
                    <h5 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">1. Enroll</h5>
                    <button class="btn btn-primary" id="mfaEnrollBtn" style="width:100%;">📲 Generate TOTP Secret</button>
                    <div id="mfaSecret" style="margin-top:var(--spacing-sm);font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);word-break:break-all;min-height:40px;">-</div>
                    <div id="mfaCode" style="margin-top:var(--spacing-xs);font-size:1.4rem;font-weight:700;color:var(--forest-green-accent);text-align:center;">------</div>
                    <div id="mfaTimer" style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:4px;">-</div>
                </div>
                <div style="padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">
                    <h5 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">2. Verify</h5>
                    <input type="text" id="mfaInput" placeholder="Enter 6-digit code" maxlength="6" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);text-align:center;font-size:1.2rem;letter-spacing:0.3em;">
                    <button class="btn btn-primary" id="mfaVerifyBtn" style="width:100%;margin-top:var(--spacing-sm);">✓ Verify Code</button>
                    <div id="mfaResult" style="margin-top:var(--spacing-sm);font-size:0.9rem;min-height:40px;">-</div>
                    <div id="mfaAttempts" style="font-size:0.75rem;color:var(--text-muted);">Attempts: 0/5</div>
                </div>
            </div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: SOC 2 CC6.1 · HIPAA §164.312(d) · PCI DSS 8.4 · CMMC IA.L2-3.5.3</span>
            </div>
        </div>
    `,
    init: () => {
        let currentCode = '', attempts = 0, locked = false, timerInterval = null;
        function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
        function genSecret() { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let s = ''; for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
        document.getElementById('mfaEnrollBtn').addEventListener('click', () => {
            attempts = 0; locked = false;
            document.getElementById('mfaAttempts').textContent = 'Attempts: 0/5';
            document.getElementById('mfaResult').innerHTML = '-';
            const secret = genSecret();
            document.getElementById('mfaSecret').textContent = 'Secret: ' + secret;
            currentCode = genCode();
            document.getElementById('mfaCode').textContent = currentCode;
            let remaining = 30;
            if (timerInterval) clearInterval(timerInterval);
            document.getElementById('mfaTimer').textContent = remaining + 's remaining';
            timerInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) { currentCode = genCode(); document.getElementById('mfaCode').textContent = currentCode; remaining = 30; }
                document.getElementById('mfaTimer').textContent = remaining + 's remaining';
            }, 1000);
        });
        document.getElementById('mfaVerifyBtn').addEventListener('click', () => {
            if (locked) { document.getElementById('mfaResult').innerHTML = '<span style="color:#ef4444;font-weight:600;">🔒 Account locked - too many failed attempts (30min cooldown)</span>'; return; }
            if (!currentCode) { document.getElementById('mfaResult').innerHTML = '<span style="color:var(--text-muted);">Enroll first to generate a code.</span>'; return; }
            const input = document.getElementById('mfaInput').value.trim();
            if (input === currentCode) {
                document.getElementById('mfaResult').innerHTML = '<span style="color:#10b981;font-weight:600;">✓ MFA VERIFIED - session authenticated</span>';
                attempts = 0;
            } else {
                attempts++;
                if (attempts >= 5) { locked = true; document.getElementById('mfaResult').innerHTML = '<span style="color:#ef4444;font-weight:600;">🔒 LOCKED - 5 failed attempts (PCI DSS 8.3.4)</span>'; }
                else { document.getElementById('mfaResult').innerHTML = '<span style="color:#ef4444;">✗ Invalid code. Try again.</span>'; }
            }
            document.getElementById('mfaAttempts').textContent = 'Attempts: ' + attempts + '/5' + (locked ? ' - LOCKED' : '');
        });
    }
};

demoConfigs['session-timeout-manager'] = {
    html: `
        <div class="demo-session">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">⏱️ Session Timeout Profiles</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Compare timeout profiles for different compliance requirements</p>
            <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);flex-wrap:wrap;">
                <button class="btn btn-secondary" id="sesStd" style="flex:1;">📗 Standard</button>
                <button class="btn btn-secondary" id="sesSens" style="flex:1;">📙 Sensitive</button>
                <button class="btn btn-secondary" id="sesCrit" style="flex:1;">📕 Critical</button>
            </div>
            <div id="sesInfo" style="padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:120px;">
                <span style="color:var(--text-muted);">Select a profile to see timeout configuration and compliance mapping.</span>
            </div>
            <div style="margin-top:var(--spacing-md);">
                <h5 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">⏳ Live Session Simulator</h5>
                <div style="display:flex;align-items:center;gap:var(--spacing-sm);">
                    <button class="btn btn-primary" id="sesStartBtn">▶ Start Session</button>
                    <button class="btn btn-secondary" id="sesActivityBtn" disabled>👆 Simulate Activity</button>
                    <span id="sesTimer" style="font-family:var(--font-mono);font-size:0.9rem;color:var(--text-secondary);">-</span>
                </div>
                <div id="sesStatus" style="margin-top:var(--spacing-sm);font-size:0.85rem;color:var(--text-muted);">-</div>
            </div>
        </div>
    `,
    init: () => {
        const profiles = {
            standard:  { idle: 30, absolute: 480, warn: 5, label: 'Standard', color: '#10b981', use: 'General web applications, internal tools' },
            sensitive: { idle: 15, absolute: 240, warn: 2, label: 'Sensitive', color: '#f59e0b', use: 'PCI DSS CDE access, HIPAA ePHI systems' },
            critical:  { idle: 5,  absolute: 60,  warn: 1, label: 'Critical', color: '#ef4444', use: 'Financial trading, military systems, root access' }
        };
        let activeProfile = null, sessionTimer = null, idleSeconds = 0, maxIdle = 0, warnAt = 0;
        function showProfile(key) {
            activeProfile = key;
            const p = profiles[key];
            document.getElementById('sesInfo').innerHTML =
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-sm);"><span style="font-weight:700;color:' + p.color + ';font-size:1.1rem;">' + p.label + ' Profile</span></div>' +
                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--spacing-sm);margin-bottom:var(--spacing-sm);">' +
                '<div style="text-align:center;padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-sm);"><div style="font-size:1.2rem;font-weight:700;color:' + p.color + ';">' + p.idle + 'min</div><div style="font-size:0.75rem;color:var(--text-muted);">Idle Timeout</div></div>' +
                '<div style="text-align:center;padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-sm);"><div style="font-size:1.2rem;font-weight:700;color:' + p.color + ';">' + (p.absolute/60) + 'hr</div><div style="font-size:0.75rem;color:var(--text-muted);">Max Session</div></div>' +
                '<div style="text-align:center;padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-sm);"><div style="font-size:1.2rem;font-weight:700;color:' + p.color + ';">' + p.warn + 'min</div><div style="font-size:0.75rem;color:var(--text-muted);">Warning</div></div></div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);">🎯 <strong>Use case:</strong> ' + p.use + '</div>';
        }
        document.getElementById('sesStd').addEventListener('click', () => showProfile('standard'));
        document.getElementById('sesSens').addEventListener('click', () => showProfile('sensitive'));
        document.getElementById('sesCrit').addEventListener('click', () => showProfile('critical'));
        document.getElementById('sesStartBtn').addEventListener('click', () => {
            if (!activeProfile) { showProfile('standard'); }
            const p = profiles[activeProfile];
            maxIdle = p.idle * 6; warnAt = (p.idle - p.warn) * 6; idleSeconds = 0;
            document.getElementById('sesActivityBtn').disabled = false;
            if (sessionTimer) clearInterval(sessionTimer);
            sessionTimer = setInterval(() => {
                idleSeconds++;
                const pct = Math.min(100, (idleSeconds / maxIdle) * 100);
                const warning = idleSeconds >= warnAt;
                const expired = idleSeconds >= maxIdle;
                if (expired) {
                    clearInterval(sessionTimer);
                    document.getElementById('sesStatus').innerHTML = '<span style="color:#ef4444;font-weight:600;">🔒 SESSION EXPIRED - auto-logout triggered</span>';
                    document.getElementById('sesActivityBtn').disabled = true;
                } else if (warning) {
                    document.getElementById('sesStatus').innerHTML = '<span style="color:#f59e0b;font-weight:600;">⚠ WARNING: Session expiring in ' + (maxIdle - idleSeconds) + 's - click activity to extend</span>';
                } else {
                    document.getElementById('sesStatus').innerHTML = '<span style="color:#10b981;">Active session</span>';
                }
                document.getElementById('sesTimer').textContent = 'Idle: ' + idleSeconds + 's / ' + maxIdle + 's (' + pct.toFixed(0) + '%)';
            }, 1000);
        });
        document.getElementById('sesActivityBtn').addEventListener('click', () => { idleSeconds = 0; document.getElementById('sesStatus').innerHTML = '<span style="color:#10b981;">✓ Activity detected - idle timer reset</span>'; });
    }
};

demoConfigs['hipaa-phi-filter'] = {
    html: `
        <div class="demo-phi">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🏥 HIPAA PHI Access Filter</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Select a role to see which PHI fields are accessible under the Minimum Necessary Standard</p>
            <div style="margin-bottom:var(--spacing-md);">
                <label style="display:block;margin-bottom:4px;color:var(--text-secondary);font-weight:600;">Select Role:</label>
                <select id="phiRole" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);">
                    <option value="treating_provider">Treating Provider (Full Access)</option>
                    <option value="billing">Billing Staff</option>
                    <option value="researcher">Researcher (De-identified)</option>
                    <option value="it_support">IT Support</option>
                </select>
            </div>
            <button class="btn btn-primary" id="phiFilterBtn">🔍 View Patient Record</button>
            <div id="phiResult" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:100px;">
                <span style="color:var(--text-muted);">Select a role and click View Patient Record</span>
            </div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: HIPAA §164.502(b) · §164.514(b)(2) Safe Harbor · §164.312(a)(1) · SOC 2 CC6.1</span>
            </div>
        </div>
    `,
    init: () => {
        const record = { names: 'Jane Doe', geographic: '1234 Elm St, Portland OR 97201', dates: '1985-03-15', phone: '503-555-0199', email: 'jane.doe@email.com', ssn: '123-45-6789', mrn: 'MRN-00482', healthPlanId: 'BCBS-9921', accountNumbers: 'ACCT-3847', diagnosis: 'Type 2 Diabetes', medications: 'Metformin 500mg' };
        const roles = {
            treating_provider: { access: Object.keys(record), label: 'Full PHI (Treatment)', color: '#10b981' },
            billing: { access: ['names','mrn','healthPlanId','accountNumbers','dates'], label: 'Billing Subset', color: '#f59e0b' },
            researcher: { access: ['diagnosis','medications'], label: 'De-identified Only', color: '#3b82f6' },
            it_support: { access: ['mrn'], label: 'MRN Only', color: '#8b5cf6' }
        };
        document.getElementById('phiFilterBtn').addEventListener('click', () => {
            const role = document.getElementById('phiRole').value;
            const r = roles[role];
            let html = '<div style="font-weight:600;color:' + r.color + ';margin-bottom:var(--spacing-sm);">👤 ' + role.replace(/_/g,' ').toUpperCase() + ' - ' + r.label + '</div>';
            html += '<div style="display:grid;gap:4px;">';
            Object.entries(record).forEach(([key, val]) => {
                const allowed = r.access.includes(key);
                html += '<div style="display:flex;justify-content:space-between;padding:6px var(--spacing-sm);background:' + (allowed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') + ';border-radius:var(--radius-sm);font-size:0.85rem;">';
                html += '<span style="color:var(--text-secondary);font-weight:600;">' + key + '</span>';
                html += allowed
                    ? '<span style="color:#10b981;">' + val + '</span>'
                    : '<span style="color:#ef4444;">[REDACTED]</span>';
                html += '</div>';
            });
            html += '</div>';
            html += '<div style="margin-top:var(--spacing-sm);font-size:0.75rem;color:var(--text-muted);">' + r.access.length + ' of ' + Object.keys(record).length + ' fields accessible</div>';
            document.getElementById('phiResult').innerHTML = html;
        });
    }
};

demoConfigs['gdpr-consent-manager'] = {
    html: `
        <div class="demo-consent">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🇪🇺 GDPR Consent Dashboard</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Toggle consent for each processing purpose - required purposes cannot be withdrawn</p>
            <div id="consentUserId" style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:var(--spacing-md);">User: <strong>user-demo@example.com</strong> · Policy v2.1</div>
            <div id="consentPurposes" style="display:grid;gap:var(--spacing-sm);"></div>
            <div style="margin-top:var(--spacing-md);display:flex;gap:var(--spacing-sm);">
                <button class="btn btn-primary" id="consentReceiptBtn">📄 Generate Consent Receipt</button>
                <button class="btn btn-secondary" id="consentExportBtn">📥 Export (Art. 20)</button>
            </div>
            <div id="consentReceipt" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:60px;display:none;"></div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: GDPR Art. 6, 7, 13, 17, 20, 21 · Kantara Consent Receipt Specification</span>
            </div>
        </div>
    `,
    init: () => {
        const purposes = [
            { id: 'account_creation', name: 'Account Creation', basis: 'contract', required: true },
            { id: 'service_delivery', name: 'Service Delivery', basis: 'contract', required: true },
            { id: 'marketing_email', name: 'Marketing Emails', basis: 'consent', required: false },
            { id: 'analytics', name: 'Usage Analytics', basis: 'legitimate_interest', required: false },
            { id: 'third_party_share', name: 'Third-Party Sharing', basis: 'consent', required: false },
            { id: 'profiling', name: 'Automated Profiling', basis: 'consent', required: false }
        ];
        const state = {};
        purposes.forEach(p => { state[p.id] = p.required; });
        function render() {
            const el = document.getElementById('consentPurposes');
            el.innerHTML = purposes.map(p => {
                const granted = state[p.id];
                const basisColors = { contract: '#3b82f6', consent: '#10b981', legitimate_interest: '#f59e0b' };
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">' +
                    '<div><div style="font-weight:600;color:var(--text-primary);">' + p.name + (p.required ? ' <span style="color:#ef4444;font-size:0.75rem;">REQUIRED</span>' : '') + '</div>' +
                    '<div style="font-size:0.75rem;color:var(--text-muted);">Legal basis: <span style="color:' + (basisColors[p.basis] || 'var(--text-muted)') + ';">' + p.basis.replace(/_/g,' ') + '</span></div></div>' +
                    '<label style="position:relative;display:inline-block;width:48px;height:26px;cursor:' + (p.required ? 'not-allowed' : 'pointer') + ';">' +
                    '<input type="checkbox" data-purpose="' + p.id + '" ' + (granted ? 'checked' : '') + ' ' + (p.required ? 'disabled' : '') + ' style="opacity:0;width:0;height:0;">' +
                    '<span style="position:absolute;top:0;left:0;right:0;bottom:0;background:' + (granted ? '#10b981' : '#6b7280') + ';border-radius:13px;transition:0.3s;"></span>' +
                    '<span style="position:absolute;top:3px;left:' + (granted ? '25px' : '3px') + ';width:20px;height:20px;background:#fff;border-radius:50%;transition:0.3s;"></span>' +
                    '</label></div>';
            }).join('');
            el.querySelectorAll('input[type=checkbox]').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    state[e.target.dataset.purpose] = e.target.checked;
                    render();
                });
            });
        }
        render();
        document.getElementById('consentReceiptBtn').addEventListener('click', () => {
            const receipt = document.getElementById('consentReceipt');
            receipt.style.display = 'block';
            const granted = purposes.filter(p => state[p.id]);
            const withdrawn = purposes.filter(p => !state[p.id]);
            receipt.innerHTML = '<div style="font-weight:600;color:var(--text-primary);margin-bottom:var(--spacing-sm);">📄 Kantara Consent Receipt</div>' +
                '<div style="font-size:0.82rem;color:var(--text-secondary);">' +
                '<div><strong>Receipt ID:</strong> CR-' + Date.now() + '</div>' +
                '<div><strong>Timestamp:</strong> ' + new Date().toISOString() + '</div>' +
                '<div><strong>Data Subject:</strong> user-demo@example.com</div>' +
                '<div><strong>Policy Version:</strong> 2.1</div>' +
                '<div style="margin-top:var(--spacing-xs);"><strong style="color:#10b981;">Granted (' + granted.length + '):</strong> ' + granted.map(p => p.name).join(', ') + '</div>' +
                (withdrawn.length ? '<div><strong style="color:#ef4444;">Withdrawn (' + withdrawn.length + '):</strong> ' + withdrawn.map(p => p.name).join(', ') + '</div>' : '') +
                '</div>';
        });
        document.getElementById('consentExportBtn').addEventListener('click', () => {
            const data = { userId: 'user-demo@example.com', exportDate: new Date().toISOString(), consents: purposes.map(p => ({ purpose: p.name, legalBasis: p.basis, granted: state[p.id] })) };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gdpr-consent-export.json'; a.click();
        });
    }
};

demoConfigs['pci-card-sanitizer'] = {
    html: `
        <div class="demo-pci">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">💳 PCI Card Data Sanitizer</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Enter a card number to see masking, truncation, tokenization, and brand detection</p>
            <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);flex-wrap:wrap;">
                <input type="text" id="pciInput" placeholder="Enter card number (e.g., 4111111111111111)" value="4111111111111111" maxlength="19" style="flex:1;min-width:200px;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-mono);">
                <button class="btn btn-primary" id="pciSanitizeBtn">🔒 Sanitize</button>
            </div>
            <div id="pciResult" style="display:grid;gap:var(--spacing-sm);"></div>
            <div style="margin-top:var(--spacing-md);">
                <h5 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">📝 Free-Text Scrubber</h5>
                <textarea id="pciText" rows="2" style="width:100%;padding:var(--spacing-sm);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-mono);font-size:0.85rem;">Customer paid with card 4111-1111-1111-1111 for order #5892</textarea>
                <button class="btn btn-secondary" id="pciScrubBtn" style="margin-top:var(--spacing-xs);">🧹 Scrub PANs</button>
                <div id="pciScrubResult" style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:0.85rem;color:var(--text-primary);min-height:30px;">-</div>
            </div>
            <div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);">
                <span style="font-size:0.75rem;color:var(--text-muted);">Maps to: PCI DSS 3.3, 3.4, 3.5, 4.1 · SOC 2 CC6.1</span>
            </div>
        </div>
    `,
    init: () => {
        function luhn(num) { let s = 0, a = false; for (let i = num.length-1; i >= 0; i--) { let n = parseInt(num[i]); if (a) { n *= 2; if (n > 9) n -= 9; } s += n; a = !a; } return s % 10 === 0; }
        const brands = [
            { name: 'Visa', test: d => /^4/.test(d) && [13,16,19].includes(d.length) },
            { name: 'Mastercard', test: d => /^(5[1-5]|2[2-7])/.test(d) && d.length === 16 },
            { name: 'Amex', test: d => /^3[47]/.test(d) && d.length === 15 },
            { name: 'Discover', test: d => /^6(011|5)/.test(d) && [16,19].includes(d.length) }
        ];
        function detect(d) { return brands.find(b => b.test(d))?.name || 'Unknown'; }
        function mask(d) { return d.slice(0,6) + '*'.repeat(d.length-10) + d.slice(-4); }
        function truncate(d) { return '****' + d.slice(-4); }
        function tokenize(d) { let h = 0; for (let i = 0; i < d.length; i++) h = ((h << 5) - h + d.charCodeAt(i)) | 0; return 'tok_' + Math.abs(h).toString(16).padStart(16,'0').slice(0,16); }

        document.getElementById('pciSanitizeBtn').addEventListener('click', () => {
            const raw = document.getElementById('pciInput').value.replace(/[\s-]/g, '');
            const valid = raw.length >= 13 && raw.length <= 19 && luhn(raw);
            const brand = valid ? detect(raw) : null;
            const brandColors = { Visa: '#1a1f71', Mastercard: '#eb001b', Amex: '#006fcf', Discover: '#ff6600', Unknown: '#6b7280' };
            let html = '';
            if (!valid) {
                html = '<div style="padding:var(--spacing-md);background:rgba(239,68,68,0.1);border-radius:var(--radius-md);color:#ef4444;font-weight:600;">✗ Invalid card number (Luhn check failed)</div>';
            } else {
                const items = [
                    { label: '🏦 Brand Detected', value: brand, color: brandColors[brand] || '#6b7280' },
                    { label: '✓ Luhn Valid', value: 'PASS', color: '#10b981' },
                    { label: '🎭 Masked (PCI 3.3)', value: mask(raw), color: 'var(--text-primary)' },
                    { label: '✂️ Truncated', value: truncate(raw), color: 'var(--text-primary)' },
                    { label: '🔑 Tokenized', value: tokenize(raw), color: 'var(--forest-green-accent)' }
                ];
                items.forEach(i => {
                    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);">' +
                        '<span style="color:var(--text-secondary);font-weight:600;font-size:0.85rem;">' + i.label + '</span>' +
                        '<span style="font-family:var(--font-mono);font-size:0.9rem;color:' + i.color + ';font-weight:600;">' + i.value + '</span></div>';
                });
            }
            document.getElementById('pciResult').innerHTML = html;
        });

        document.getElementById('pciScrubBtn').addEventListener('click', () => {
            let text = document.getElementById('pciText').value;
            let count = 0;
            text = text.replace(/\b([\d][\d\s-]{11,17}[\d])\b/g, (match) => {
                const digits = match.replace(/[\s-]/g, '');
                if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) { count++; return mask(digits); }
                return match;
            });
            document.getElementById('pciScrubResult').innerHTML = '<span style="color:#10b981;font-weight:600;">✓ ' + count + ' PAN(s) scrubbed:</span> ' + text;
        });
    }
};

// ── Enterprise Demo Configs: MBAi ──────────────────────────
demoConfigs['mbai-sbsc'] = {
    html: `
        <div class="demo-sbsc">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">📊 Sustainable Balanced Scorecard</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Explore the four strategic perspectives - click to expand details</p>
            <div id="sbscPerspectives" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);"></div>
            <div id="sbscDetail" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:100px;">
                <span style="color:var(--text-muted);">Click a perspective above to see objectives, KPIs, and AI vectors.</span>
            </div>
        </div>
    `,
    init: () => {
        const perspectives = [
            { name: 'Financial', icon: '💰', color: '#d4a574', objectives: [
                { obj: 'Transition to circular, regenerative models', kpi: '% PaaS revenue > 35%', ai: 'AI dynamic pricing' },
                { obj: 'Reduce OpEx via ecological efficiency', kpi: '20% energy cost reduction', ai: 'Autonomous energy grid balancing' }
            ]},
            { name: 'Customer', icon: '👥', color: '#7ec99b', objectives: [
                { obj: 'Enhance brand equity via purpose-driven impact', kpi: 'NPS + Trust Index > 75', ai: 'NLP sentiment analysis' },
                { obj: 'Ethical AI service accessibility', kpi: '100% bias audit pass', ai: 'Automated bias detection' }
            ]},
            { name: 'Internal Process', icon: '⚙️', color: '#5a9d7a', objectives: [
                { obj: 'Zero-waste closed-loop supply chain', kpi: '> 65% material recovery', ai: 'Computer vision reverse logistics' },
                { obj: 'Operational carbon neutrality', kpi: 'Net-Zero Scope 1 & 2', ai: 'ML route optimization' }
            ]},
            { name: 'Learning & Growth', icon: '🌱', color: '#9dbd7e', objectives: [
                { obj: 'Culture of continuous green innovation', kpi: '10 patents/year', ai: 'AI knowledge management' },
                { obj: 'Inclusive, psychologically safe environment', kpi: '< 5% voluntary turnover', ai: 'Anonymized inclusion analysis' }
            ]}
        ];
        document.getElementById('sbscPerspectives').innerHTML = perspectives.map((p, i) =>
            '<div class="sbsc-card" data-idx="' + i + '" style="padding:var(--spacing-md);background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;text-align:center;" onmouseover="this.style.borderColor=\'' + p.color + '\'" onmouseout="this.style.borderColor=\'var(--border-light)\'">' +
            '<div style="font-size:1.8rem;">' + p.icon + '</div>' +
            '<div style="font-weight:600;color:var(--text-primary);margin-top:var(--spacing-xs);">' + p.name + '</div>' +
            '<div style="font-size:0.75rem;color:var(--text-muted);">' + p.objectives.length + ' objectives</div></div>'
        ).join('');
        document.querySelectorAll('.sbsc-card').forEach(card => {
            card.addEventListener('click', () => {
                const p = perspectives[parseInt(card.dataset.idx)];
                document.getElementById('sbscDetail').innerHTML =
                    '<h5 style="color:' + p.color + ';margin-bottom:var(--spacing-sm);">' + p.icon + ' ' + p.name + ' Perspective</h5>' +
                    p.objectives.map(o =>
                        '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);margin-bottom:var(--spacing-xs);font-size:0.85rem;">' +
                        '<div style="color:var(--text-primary);font-weight:600;">' + o.obj + '</div>' +
                        '<div style="display:flex;gap:var(--spacing-md);margin-top:4px;flex-wrap:wrap;">' +
                        '<span style="color:var(--text-secondary);font-size:0.78rem;">📏 ' + o.kpi + '</span>' +
                        '<span style="color:var(--text-muted);font-size:0.78rem;">🤖 ' + o.ai + '</span></div></div>'
                    ).join('');
            });
        });
    }
};

demoConfigs['mbai-circular-supply-chain'] = {
    html: `
        <div class="demo-circular">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">♻️ Circular Supply Chain Workflow</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Six-phase circular loop - click each phase to explore</p>
            <div id="circularPhases" style="display:flex;flex-wrap:wrap;gap:var(--spacing-xs);justify-content:center;margin-bottom:var(--spacing-md);"></div>
            <div id="circularDetail" style="padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:120px;">
                <span style="color:var(--text-muted);">Click a phase to see its details.</span>
            </div>
        </div>
    `,
    init: () => {
        const phases = [
            { name: 'Regenerative Sourcing', icon: '🌿', action: 'Transition to recycled/regenerative materials', ai: 'AI audits supplier ESG reports', kpi: '% circular procurement spend' },
            { name: 'Circular Design', icon: '🔩', action: 'Modularity, durability, repairability by design', ai: 'Generative AI material simulation', kpi: 'Product Circularity Index' },
            { name: 'GreenOps Manufacturing', icon: '🏭', action: 'Zero-waste, renewable-powered production', ai: 'Digital twins optimize energy & waste', kpi: 'Waste diverted from landfill' },
            { name: 'PaaS Distribution', icon: '📦', action: 'Leasing & subscription over transactional sales', ai: 'AI demand forecasting', kpi: 'Asset utilization rate' },
            { name: 'Reverse Logistics', icon: '🔄', action: 'Collection hubs & incentivized take-back', ai: 'Intelligent multi-stop routing', kpi: 'Products recovered (volume)' },
            { name: 'Remanufacturing', icon: '♻️', action: 'Sort, disassemble, triage for reuse/recycle', ai: 'Computer vision component classification', kpi: 'Closed-loop economic value' }
        ];
        document.getElementById('circularPhases').innerHTML = phases.map((p, i) =>
            '<button class="btn btn-secondary circular-phase-btn" data-idx="' + i + '" style="font-size:0.85rem;"> ' + p.icon + ' ' + p.name + '</button>'
        ).join('');
        document.querySelectorAll('.circular-phase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.circular-phase-btn').forEach(b => b.style.background = '');
                btn.style.background = 'var(--primary-color)';
                const p = phases[parseInt(btn.dataset.idx)];
                document.getElementById('circularDetail').innerHTML =
                    '<h5 style="color:var(--forest-green-accent);margin-bottom:var(--spacing-sm);">' + p.icon + ' Phase: ' + p.name + '</h5>' +
                    '<div style="display:grid;gap:var(--spacing-sm);">' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">Action:</strong> <span style="color:var(--text-secondary);">' + p.action + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">🤖 AI Enablement:</strong> <span style="color:var(--text-secondary);">' + p.ai + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">📏 KPI:</strong> <span style="color:var(--text-secondary);">' + p.kpi + '</span></div></div>';
            });
        });
    }
};

demoConfigs['mbai-tbl-impact'] = {
    html: `
        <div class="demo-tbl">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">📊 Triple Bottom Line P&L</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Profit · People · Planet - compare baseline vs projected impact</p>
            <div id="tblDimensions" style="display:grid;gap:var(--spacing-sm);"></div>
        </div>
    `,
    init: () => {
        const dims = [
            { name: 'Profit', icon: '💰', color: '#d4a574', metrics: [
                { label: 'CapEx Investment', baseline: '$0', projected: '$1.5M' },
                { label: 'Fuel Savings', baseline: '$800K/yr', projected: '$350K/yr' }
            ]},
            { name: 'Planet', icon: '🌍', color: '#7ec99b', metrics: [
                { label: 'Scope 1 GHG', baseline: '2,500 MT CO2e', projected: '300 MT CO2e' },
                { label: 'Carbon Tax Risk', baseline: '$125K liability', projected: '$15K liability' }
            ]},
            { name: 'People', icon: '👥', color: '#5a9d7a', metrics: [
                { label: 'Job Creation', baseline: '0 specialists', projected: '25 high-wage roles' },
                { label: 'Health & Safety', baseline: 'High exposure', projected: '40% noise reduction' }
            ]}
        ];
        document.getElementById('tblDimensions').innerHTML = dims.map(d =>
            '<div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--spacing-md);">' +
            '<h5 style="color:' + d.color + ';margin-bottom:var(--spacing-sm);">' + d.icon + ' ' + d.name + '</h5>' +
            '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">' +
            '<thead><tr><th style="text-align:left;padding:4px 8px;color:var(--text-secondary);border-bottom:1px solid var(--border-light);">Metric</th><th style="padding:4px 8px;color:#ef4444;border-bottom:1px solid var(--border-light);">Baseline</th><th style="padding:4px 8px;color:#10b981;border-bottom:1px solid var(--border-light);">Projected</th></tr></thead>' +
            '<tbody>' + d.metrics.map(m =>
                '<tr><td style="padding:6px 8px;color:var(--text-primary);">' + m.label + '</td><td style="padding:6px 8px;text-align:center;color:var(--text-muted);">' + m.baseline + '</td><td style="padding:6px 8px;text-align:center;color:var(--forest-green-accent);font-weight:600;">' + m.projected + '</td></tr>'
            ).join('') + '</tbody></table></div>'
        ).join('');
    }
};

demoConfigs['mbai-marketing-audit'] = {
    html: `
        <div class="demo-audit-mkt">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">📋 Purpose-Driven Marketing Audit</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">5-phase audit checklist - mark each phase as you complete the review</p>
            <div id="mktPhases" style="display:grid;gap:var(--spacing-xs);"></div>
            <div id="mktProgress" style="margin-top:var(--spacing-md);padding:var(--spacing-sm);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center;"></div>
        </div>
    `,
    init: () => {
        const phases = [
            { name: 'Purpose Alignment & Authenticity', criteria: 'Campaign reflects verified operational capabilities?' },
            { name: 'Impact Verification & Evidence', criteria: 'All ESG claims substantiated by audit-quality data?' },
            { name: 'Inclusive & Accessible Storytelling', criteria: 'Culturally competent language, diverse representation?' },
            { name: 'Ethical Content Personalization', criteria: 'Respectful of privacy; no manipulative triggers?' },
            { name: 'Continuous Sentiment Analysis', criteria: 'Active monitoring of public reaction post-launch?' }
        ];
        const checked = new Array(phases.length).fill(false);
        function renderMkt() {
            document.getElementById('mktPhases').innerHTML = phases.map((p, i) =>
                '<label style="display:flex;gap:var(--spacing-sm);align-items:flex-start;padding:var(--spacing-sm);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);cursor:pointer;' + (checked[i] ? 'border-color:var(--forest-green-accent);' : '') + '">' +
                '<input type="checkbox" class="mkt-check" data-idx="' + i + '" ' + (checked[i]?'checked':'') + ' style="margin-top:2px;">' +
                '<div><div style="font-weight:600;color:var(--text-primary);font-size:0.9rem;">' + p.name + '</div><div style="font-size:0.8rem;color:var(--text-secondary);">' + p.criteria + '</div></div></label>'
            ).join('');
            const done = checked.filter(Boolean).length;
            const pct = Math.round(done / phases.length * 100);
            document.getElementById('mktProgress').innerHTML =
                '<div style="background:var(--bg-card);border-radius:var(--radius-md);height:8px;overflow:hidden;margin-bottom:var(--spacing-xs);"><div style="height:100%;width:' + pct + '%;background:var(--forest-green-accent);transition:width 0.3s;border-radius:var(--radius-md);"></div></div>' +
                '<span style="font-size:0.85rem;color:var(--text-secondary);">' + done + '/' + phases.length + ' phases complete (' + pct + '%)</span>';
            document.querySelectorAll('.mkt-check').forEach(cb => {
                cb.addEventListener('change', () => { checked[parseInt(cb.dataset.idx)] = cb.checked; renderMkt(); });
            });
        }
        renderMkt();
    }
};

demoConfigs['mbai-servant-leadership'] = {
    html: `
        <div class="demo-leadership">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🤝 Servant Leadership 1-on-1 Agenda</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">45-minute coaching session - step through each segment</p>
            <div id="coachingSegments" style="display:grid;gap:var(--spacing-xs);"></div>
        </div>
    `,
    init: () => {
        const segments = [
            { name: 'Personal Connection', focus: 'Empathy & Well-being', prompt: 'How are you doing outside work? Stress manageable?', time: '5 min' },
            { name: 'Priority Alignment', focus: 'Foresight & Vision', prompt: 'Top priorities? How do they align with sustainability goals?', time: '10 min' },
            { name: 'Obstacle Removal', focus: 'Stewardship & Empowerment', prompt: 'What systemic roadblocks can I remove for you today?', time: '10 min' },
            { name: 'Retrospective', focus: 'Psychological Safety', prompt: 'Recent win to celebrate? Challenge - what did we learn?', time: '10 min' },
            { name: 'Growth & Career', focus: 'Commitment to Growth', prompt: 'New skills? Getting enough actionable feedback?', time: '10 min' }
        ];
        let activeIdx = -1;
        function renderCoaching() {
            document.getElementById('coachingSegments').innerHTML = segments.map((s, i) =>
                '<div class="coaching-seg" data-idx="' + i + '" style="padding:var(--spacing-md);background:' + (i === activeIdx ? 'var(--bg-tertiary)' : 'var(--bg-card)') + ';border:1px solid ' + (i === activeIdx ? 'var(--forest-green-accent)' : 'var(--border-light)') + ';border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<strong style="color:var(--text-primary);">' + s.name + '</strong>' +
                '<span style="font-size:0.75rem;color:var(--text-muted);">⏱ ' + s.time + '</span></div>' +
                '<div style="font-size:0.8rem;color:var(--forest-green-accent);margin-top:2px;">' + s.focus + '</div>' +
                (i === activeIdx ? '<div style="margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.85rem;color:var(--text-secondary);font-style:italic;">"' + s.prompt + '"</div>' : '') +
                '</div>'
            ).join('');
            document.querySelectorAll('.coaching-seg').forEach(seg => {
                seg.addEventListener('click', () => { activeIdx = activeIdx === parseInt(seg.dataset.idx) ? -1 : parseInt(seg.dataset.idx); renderCoaching(); });
            });
        }
        renderCoaching();
    }
};

demoConfigs['mbai-greenops-sdlc'] = {
    html: `
        <div class="demo-sdlc">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🌿 Sustainable SDLC Pipeline</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Track environmental impact across five development phases</p>
            <div id="sdlcPhases" style="display:flex;gap:2px;margin-bottom:var(--spacing-md);"></div>
            <div id="sdlcDetail" style="padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:100px;">
                <span style="color:var(--text-muted);">Click a phase in the pipeline above.</span>
            </div>
        </div>
    `,
    init: () => {
        const phases = [
            { name: 'Requirements', icon: '📋', action: 'Define scope with sustainability focus', ai: 'AI predicts compute needs', green: 'Cloud lifecycle costs & ESG alignment' },
            { name: 'Architecture', icon: '🏗️', action: 'Cloud-native, modular design', ai: 'AI assists energy-efficient schema', green: 'Reduced duplication & data center efficiency' },
            { name: 'Development', icon: '💻', action: 'Clean code, efficient algorithms', ai: 'Copilots optimize for lower CPU/memory', green: 'Code complexity & debt reduction' },
            { name: 'Testing', icon: '🧪', action: 'Functional + security + environmental', ai: 'ML CI/CD pipelines reduce QA hours', green: 'Server load optimization' },
            { name: 'Deployment', icon: '🚀', action: 'Continuous monitoring & observability', ai: 'AI detects energy anomalies; auto-scale', green: 'Real-time PUE & carbon per GB' }
        ];
        document.getElementById('sdlcPhases').innerHTML = phases.map((p, i) =>
            '<button class="sdlc-btn" data-idx="' + i + '" style="flex:1;padding:var(--spacing-sm) 4px;background:var(--bg-tertiary);border:1px solid var(--border-light);color:var(--text-primary);cursor:pointer;font-size:0.78rem;text-align:center;' + (i === 0 ? 'border-radius:var(--radius-md) 0 0 var(--radius-md);' : i === phases.length-1 ? 'border-radius:0 var(--radius-md) var(--radius-md) 0;' : '') + '">' + p.icon + '<br>' + p.name + '</button>'
        ).join('');
        document.querySelectorAll('.sdlc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sdlc-btn').forEach(b => { b.style.background = 'var(--bg-tertiary)'; b.style.borderColor = 'var(--border-light)'; });
                btn.style.background = 'var(--primary-color)';
                btn.style.borderColor = 'var(--forest-green-accent)';
                const p = phases[parseInt(btn.dataset.idx)];
                document.getElementById('sdlcDetail').innerHTML =
                    '<h5 style="color:var(--forest-green-accent);margin-bottom:var(--spacing-sm);">' + p.icon + ' ' + p.name + '</h5>' +
                    '<div style="display:grid;gap:var(--spacing-sm);">' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><span style="font-weight:600;color:var(--text-primary);">📌 Action:</span> <span style="color:var(--text-secondary);">' + p.action + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><span style="font-weight:600;color:var(--text-primary);">🤖 AI Vector:</span> <span style="color:var(--text-secondary);">' + p.ai + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><span style="font-weight:600;color:var(--text-primary);">🌿 GreenOps:</span> <span style="color:var(--text-secondary);">' + p.green + '</span></div></div>';
            });
        });
    }
};

demoConfigs['mbai-grc-ai'] = {
    html: `
        <div class="demo-grc">
            <h4 style="color:var(--text-primary);margin-bottom:var(--spacing-sm);">🏛️ NIST AI RMF - Four Functions</h4>
            <p style="color:var(--text-muted);margin-bottom:var(--spacing-md);">Govern · Map · Measure · Manage - click to explore each function</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);" id="grcFunctions"></div>
            <div id="grcDetail" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);min-height:100px;">
                <span style="color:var(--text-muted);">Click a function above to explore details.</span>
            </div>
        </div>
    `,
    init: () => {
        const funcs = [
            { name: 'GOVERN', icon: '🏛️', color: '#d4a574', action: 'Cross-functional oversight; AI policies & risk tolerances', ai: 'AI aggregates regulatory updates (EU AI Act, CSRD)', docs: 'AI Charters → ISO 42001' },
            { name: 'MAP', icon: '🗺️', color: '#7ec99b', action: 'Document all AI systems, data dependencies, impacts', ai: 'Asset discovery scans data flows & shadow AI', docs: 'Architecture Diagrams → GDPR/SOC 2' },
            { name: 'MEASURE', icon: '📏', color: '#5a9d7a', action: 'Assess bias, hallucination, security, energy costs', ai: 'Automated Red Teaming & adversarial testing', docs: 'Bias Reports → OSCAL evidence' },
            { name: 'MANAGE', icon: '🔧', color: '#9dbd7e', action: 'Mitigate risks; continuous monitoring; human-in-the-loop', ai: 'Real-time observability; auto-alerts on anomalies', docs: 'Incident Response → Monitoring dashboards' }
        ];
        document.getElementById('grcFunctions').innerHTML = funcs.map((f, i) =>
            '<div class="grc-card" data-idx="' + i + '" style="padding:var(--spacing-md);background:var(--bg-tertiary);border:2px solid var(--border-light);border-radius:var(--radius-md);cursor:pointer;text-align:center;transition:all 0.2s;">' +
            '<div style="font-size:1.5rem;">' + f.icon + '</div>' +
            '<div style="font-weight:700;color:' + f.color + ';font-size:1.1rem;">' + f.name + '</div></div>'
        ).join('');
        document.querySelectorAll('.grc-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.grc-card').forEach(c => c.style.borderColor = 'var(--border-light)');
                const f = funcs[parseInt(card.dataset.idx)];
                card.style.borderColor = f.color;
                document.getElementById('grcDetail').innerHTML =
                    '<h5 style="color:' + f.color + ';margin-bottom:var(--spacing-sm);">' + f.icon + ' ' + f.name + '</h5>' +
                    '<div style="display:grid;gap:var(--spacing-sm);">' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">📌 Action:</strong> <span style="color:var(--text-secondary);">' + f.action + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">🤖 AI Enablement:</strong> <span style="color:var(--text-secondary);">' + f.ai + '</span></div>' +
                    '<div style="padding:var(--spacing-sm);background:var(--bg-secondary);border-radius:var(--radius-sm);"><strong style="color:var(--text-primary);">📄 Documentation:</strong> <span style="color:var(--text-secondary);">' + f.docs + '</span></div></div>';
            });
        });
    }
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
    initNavigation();
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
    const config = demoConfigs[template.id] || (template.code ? buildCodePreviewDemo(template) : defaultDemo);
    
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
        'utils': 'success',
        'compliance': 'success',
        'mbai': 'warning'
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
