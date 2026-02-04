// Dashboard JavaScript
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let allClients = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initEventListeners();
});

// Check authentication
async function checkAuth() {
    if (!authToken) {
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.getElementById('username').textContent = currentUser.username;
            loadClients();
        } else {
            localStorage.removeItem('authToken');
            showLoginModal();
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLoginModal();
    }
}

// Event listeners
function initEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            switchView(view);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add client button
    document.getElementById('addClientBtn').addEventListener('click', () => openClientModal());
    
    // Client form
    document.getElementById('clientForm').addEventListener('submit', handleClientSubmit);
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Show register modal
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('registerModal').classList.add('active');
    });
    
    // Search and filter
    document.getElementById('searchClients').addEventListener('input', filterClients);
    document.getElementById('statusFilter').addEventListener('change', filterClients);
}

// Switch dashboard view
function switchView(view) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    document.querySelectorAll('.dashboard-view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
    
    if (view === 'analytics') {
        loadAnalytics();
    }
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('username').textContent = currentUser.username;
            loadClients();
        } else {
            showFormMessage('loginForm', 'error', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormMessage('loginForm', 'error', 'Connection error. Please try again.');
    }
}

// Register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showFormMessage('registerForm', 'success', 'Registration successful! Please login.');
            setTimeout(() => {
                closeRegisterModal();
                showLoginModal();
            }, 2000);
        } else {
            showFormMessage('registerForm', 'error', data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        showFormMessage('registerForm', 'error', 'Connection error. Please try again.');
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    window.location.reload();
}

// Load clients
async function loadClients() {
    document.querySelector('.loading-spinner').style.display = 'flex';
    document.getElementById('clientsTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    
    try {
        const response = await fetch('/api/clients', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            allClients = data.clients;
            displayClients(allClients);
        }
    } catch (error) {
        console.error('Load clients error:', error);
    } finally {
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Display clients
function displayClients(clients) {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    
    if (clients.length === 0) {
        document.getElementById('clientsTable').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    
    document.getElementById('clientsTable').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        const createdDate = new Date(client.created_at).toLocaleDateString();
        
        row.innerHTML = `
            <td><strong>${client.name}</strong></td>
            <td>${client.email}</td>
            <td>${client.company || '-'}</td>
            <td>${client.phone || '-'}</td>
            <td><span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">${client.status}</span></td>
            <td>${createdDate}</td>
            <td class="action-btns">
                <button class="btn-icon btn-edit" onclick="editClient(${client.id})" title="Edit">✏️</button>
                <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})" title="Delete">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filter clients
function filterClients() {
    const searchTerm = document.getElementById('searchClients').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allClients.filter(client => {
        const matchesSearch = 
            client.name.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            (client.company && client.company.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || client.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayClients(filtered);
}

// Open client modal
window.openClientModal = function(clientId = null) {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    
    form.reset();
    document.getElementById('clientId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Client';
    
    if (clientId) {
        const client = allClients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.phone || '';
            document.getElementById('clientCompany').value = client.company || '';
            document.getElementById('clientStatus').value = client.status;
            document.getElementById('clientNotes').value = client.notes || '';
            document.getElementById('modalTitle').textContent = 'Edit Client';
        }
    }
    
    modal.classList.add('active');
}

// Close modal
window.closeModal = function() {
    document.getElementById('clientModal').classList.remove('active');
}

window.closeRegisterModal = function() {
    document.getElementById('registerModal').classList.remove('active');
}

// Handle client submit
async function handleClientSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        company: document.getElementById('clientCompany').value,
        status: document.getElementById('clientStatus').value,
        notes: document.getElementById('clientNotes').value
    };
    
    try {
        const url = clientId ? `/api/clients/${clientId}` : '/api/clients';
        const method = clientId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            closeModal();
            loadClients();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Client submit error:', error);
        alert('Connection error. Please try again.');
    }
}

// Edit client
window.editClient = function(clientId) {
    openClientModal(clientId);
}

// Delete client
window.deleteClient = async function(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadClients();
        } else {
            const data = await response.json();
            alert(data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Connection error. Please try again.');
    }
}

// Load analytics
function loadAnalytics() {
    const totalClients = allClients.length;
    const activeClients = allClients.filter(c => c.status === 'active').length;
    
    const currentMonth = new Date().getMonth();
    const monthlyClients = allClients.filter(c => {
        const clientMonth = new Date(c.created_at).getMonth();
        return clientMonth === currentMonth;
    }).length;
    
    document.getElementById('totalClients').textContent = totalClients;
    document.getElementById('activeClients').textContent = activeClients;
    document.getElementById('monthlyClients').textContent = monthlyClients;
    document.getElementById('totalProjects').textContent = '0'; // Would need to fetch projects
}

// Show modals
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

// Show form message
function showFormMessage(formId, type, message) {
    const form = document.getElementById(formId);
    const messageDiv = form.querySelector('.form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
