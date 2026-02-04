// Dashboard JavaScript - Structured For Growth CMS
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let allClients = [];
let allProjects = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initEventListeners();
});

// ============ AUTHENTICATION ============

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
            onAuthSuccess();
        } else {
            localStorage.removeItem('authToken');
            showLoginModal();
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLoginModal();
    }
}

function onAuthSuccess() {
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('userRole').textContent = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
    
    // Show/hide admin elements
    const isAdmin = currentUser.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });
    
    // Load initial data
    loadDashboard();
    loadClients();
    loadProjects();
}

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
            onAuthSuccess();
        } else {
            showFormMessage('loginForm', 'error', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormMessage('loginForm', 'error', 'Connection error. Please try again.');
    }
}

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
            showFormMessage('registerForm', 'success', data.message || 'Registration successful! Please login.');
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

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    window.location.reload();
}

// ============ DASHBOARD ============

async function loadDashboard() {
    try {
        const response = await fetch('/api/clients/stats/overview', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const stats = data.stats;
            
            document.getElementById('statTotalClients').textContent = stats.totalClients;
            document.getElementById('statActiveClients').textContent = stats.activeClients;
            document.getElementById('statTotalProjects').textContent = stats.totalProjects;
            document.getElementById('statMonthlyRevenue').textContent = formatCurrency(stats.monthlyRevenue);
            
            document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
        }
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
    
    // Load recent clients
    updateRecentClients();
    updateActiveProjects();
}

function updateRecentClients() {
    const container = document.getElementById('recentClients');
    const recent = allClients.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-message">No clients yet</p>';
        return;
    }
    
    container.innerHTML = recent.map(client => `
        <div class="list-item" onclick="viewClient(${client.id})">
            <div class="list-item-main">
                <strong>${client.name}</strong>
                <span class="text-muted">${client.company || 'No company'}</span>
            </div>
            <span class="badge badge-${client.status === 'active' ? 'success' : 'warning'}">${client.status}</span>
        </div>
    `).join('');
}

function updateActiveProjects() {
    const container = document.getElementById('activeProjects');
    const active = allProjects.filter(p => p.status === 'in-progress' || p.status === 'planning').slice(0, 5);
    
    if (active.length === 0) {
        container.innerHTML = '<p class="empty-message">No active projects</p>';
        return;
    }
    
    container.innerHTML = active.map(project => `
        <div class="list-item" onclick="viewProject(${project.id})">
            <div class="list-item-main">
                <strong>${project.title}</strong>
                <span class="text-muted">${project.client_name || 'Unknown client'}</span>
            </div>
            <span class="badge badge-${getStatusBadge(project.status)}">${project.status}</span>
        </div>
    `).join('');
}

// ============ CLIENTS ============

async function loadClients() {
    document.querySelector('#clientsTableContainer .loading-spinner').style.display = 'flex';
    document.getElementById('clientsTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    
    try {
        const response = await fetch('/api/clients', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allClients = data.clients;
            displayClients(allClients);
            updateRecentClients();
            populateClientDropdowns();
        }
    } catch (error) {
        console.error('Load clients error:', error);
    } finally {
        document.querySelector('#clientsTableContainer .loading-spinner').style.display = 'none';
    }
}

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
        row.innerHTML = `
            <td><strong>${client.name}</strong></td>
            <td><a href="mailto:${client.email}">${client.email}</a></td>
            <td>${client.company || '-'}</td>
            <td>${client.phone || '-'}</td>
            <td><span class="badge badge-info">${client.project_count || 0}</span></td>
            <td><span class="badge badge-${client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'secondary'}">${client.status}</span></td>
            <td class="action-btns">
                <button class="btn-icon" onclick="editClient(${client.id})" title="Edit">✏️</button>
                <button class="btn-icon btn-danger" onclick="deleteClient(${client.id})" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

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

window.openClientModal = function(clientId = null) {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    
    form.reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientModalTitle').textContent = 'Add Client';
    
    if (clientId) {
        const client = allClients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.phone || '';
            document.getElementById('clientCompany').value = client.company || '';
            document.getElementById('clientWebsite').value = client.website || '';
            document.getElementById('clientStatus').value = client.status;
            document.getElementById('clientRetainer').value = client.monthly_retainer || '';
            document.getElementById('clientContractStart').value = client.contract_start || '';
            document.getElementById('clientAddress').value = client.address || '';
            document.getElementById('clientNotes').value = client.notes || '';
            document.getElementById('clientModalTitle').textContent = 'Edit Client';
        }
    }
    
    modal.classList.add('active');
}

window.closeModal = function() {
    document.getElementById('clientModal').classList.remove('active');
}

async function handleClientSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value || null,
        company: document.getElementById('clientCompany').value || null,
        website: document.getElementById('clientWebsite').value || null,
        status: document.getElementById('clientStatus').value,
        monthly_retainer: document.getElementById('clientRetainer').value || null,
        contract_start: document.getElementById('clientContractStart').value || null,
        address: document.getElementById('clientAddress').value || null,
        notes: document.getElementById('clientNotes').value || null
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
            loadDashboard();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Client submit error:', error);
        alert('Connection error. Please try again.');
    }
}

window.editClient = function(clientId) {
    openClientModal(clientId);
}

window.viewClient = function(clientId) {
    // Switch to clients view and highlight/edit the client
    switchView('clients');
    editClient(clientId);
}

window.deleteClient = async function(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!confirm(`Are you sure you want to delete ${client?.name || 'this client'}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadClients();
            loadDashboard();
        } else {
            const data = await response.json();
            alert(data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Connection error. Please try again.');
    }
}

// ============ PROJECTS ============

async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allProjects = data.projects;
            displayProjects(allProjects);
            updateActiveProjects();
        }
    } catch (error) {
        console.error('Load projects error:', error);
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectCards');
    const emptyState = document.getElementById('projectsEmptyState');
    
    if (projects.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" onclick="viewProject(${project.id})">
            <div class="project-card-header">
                <h3>${project.title}</h3>
                <span class="badge badge-${getPriorityBadge(project.priority)}">${project.priority}</span>
            </div>
            <p class="project-client">${project.client_name || 'Unknown client'}</p>
            <p class="project-description">${project.description || 'No description'}</p>
            <div class="project-card-footer">
                <span class="badge badge-${getStatusBadge(project.status)}">${project.status}</span>
                ${project.budget ? `<span class="project-budget">${formatCurrency(project.budget)}</span>` : ''}
            </div>
            ${project.task_count ? `
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.round((project.tasks_completed / project.task_count) * 100)}%"></div>
                    </div>
                    <span class="progress-text">${project.tasks_completed}/${project.task_count} tasks</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filterProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const statusFilter = document.getElementById('projectStatusFilter').value;
    const clientFilter = document.getElementById('projectClientFilter').value;
    
    let filtered = allProjects.filter(project => {
        const matchesSearch = 
            project.title.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm)) ||
            (project.client_name && project.client_name.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || project.status === statusFilter;
        const matchesClient = !clientFilter || project.client_id == clientFilter;
        
        return matchesSearch && matchesStatus && matchesClient;
    });
    
    displayProjects(filtered);
}

function populateClientDropdowns() {
    const projectClientSelect = document.getElementById('projectClient');
    const filterSelect = document.getElementById('projectClientFilter');
    
    const options = allClients
        .filter(c => c.status === 'active')
        .map(c => `<option value="${c.id}">${c.name}${c.company ? ` (${c.company})` : ''}</option>`)
        .join('');
    
    projectClientSelect.innerHTML = '<option value="">Select a client</option>' + options;
    filterSelect.innerHTML = '<option value="">All Clients</option>' + options;
}

window.openProjectModal = function(projectId = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    
    form.reset();
    document.getElementById('projectId').value = '';
    document.getElementById('projectModalTitle').textContent = 'New Project';
    
    if (projectId) {
        const project = allProjects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectClient').value = project.client_id;
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectPriority').value = project.priority || 'medium';
            document.getElementById('projectBudget').value = project.budget || '';
            document.getElementById('projectHours').value = project.hours_estimated || '';
            document.getElementById('projectStart').value = project.start_date || '';
            document.getElementById('projectEnd').value = project.end_date || '';
            document.getElementById('projectModalTitle').textContent = 'Edit Project';
        }
    }
    
    modal.classList.add('active');
}

window.closeProjectModal = function() {
    document.getElementById('projectModal').classList.remove('active');
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    const projectData = {
        title: document.getElementById('projectTitle').value,
        client_id: document.getElementById('projectClient').value,
        description: document.getElementById('projectDescription').value || null,
        status: document.getElementById('projectStatus').value,
        priority: document.getElementById('projectPriority').value,
        budget: document.getElementById('projectBudget').value || null,
        hours_estimated: document.getElementById('projectHours').value || null,
        start_date: document.getElementById('projectStart').value || null,
        end_date: document.getElementById('projectEnd').value || null
    };
    
    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            closeProjectModal();
            loadProjects();
            loadDashboard();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Project submit error:', error);
        alert('Connection error. Please try again.');
    }
}

window.viewProject = function(projectId) {
    // For now, open edit modal. Could expand to full project detail view
    openProjectModal(projectId);
}

// ============ ADMIN: USERS ============

async function loadUsers() {
    if (currentUser?.role !== 'admin') return;
    
    try {
        const response = await fetch('/api/auth/users', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUsers(data.users);
        }
    } catch (error) {
        console.error('Load users error:', error);
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        const isCurrentUser = user.id === currentUser.id;
        
        row.innerHTML = `
            <td><strong>${user.username}</strong>${isCurrentUser ? ' (you)' : ''}</td>
            <td>${user.email}</td>
            <td>
                <select class="role-select" onchange="updateUserRole(${user.id}, this.value)" ${isCurrentUser ? 'disabled' : ''}>
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>
                <span class="badge badge-${user.is_active ? 'success' : 'danger'}">${user.is_active ? 'Active' : 'Disabled'}</span>
            </td>
            <td>${lastLogin}</td>
            <td class="action-btns">
                <button class="btn-icon" onclick="toggleUserStatus(${user.id}, ${!user.is_active})" title="${user.is_active ? 'Disable' : 'Enable'}" ${isCurrentUser ? 'disabled' : ''}>
                    ${user.is_active ? '🚫' : '✅'}
                </button>
                <button class="btn-icon btn-danger" onclick="deleteUser(${user.id})" title="Delete" ${isCurrentUser ? 'disabled' : ''}>🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.updateUserRole = async function(userId, role) {
    try {
        const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ role })
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.message || 'Failed to update user');
            loadUsers();
        }
    } catch (error) {
        console.error('Update user error:', error);
        loadUsers();
    }
}

window.toggleUserStatus = async function(userId, isActive) {
    try {
        const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ is_active: isActive })
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('Toggle user status error:', error);
    }
}

window.deleteUser = async function(userId) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Delete user error:', error);
    }
}

// ============ ADMIN: ACTIVITY LOG ============

async function loadActivity() {
    if (currentUser?.role !== 'admin') return;
    
    try {
        const response = await fetch('/api/auth/activity?limit=50', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayActivity(data.activities);
        }
    } catch (error) {
        console.error('Load activity error:', error);
    }
}

function displayActivity(activities) {
    const container = document.getElementById('activityList');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-message">No activity recorded yet</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => {
        const date = new Date(activity.created_at).toLocaleString();
        const icon = getActivityIcon(activity.action);
        
        return `
            <div class="activity-item">
                <span class="activity-icon">${icon}</span>
                <div class="activity-content">
                    <p class="activity-text">
                        <strong>${activity.username || 'System'}</strong> ${activity.action.toLowerCase().replace('_', ' ')}
                        ${activity.details || ''}
                    </p>
                    <span class="activity-time">${date}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getActivityIcon(action) {
    const icons = {
        'CREATE': '➕',
        'UPDATE': '✏️',
        'DELETE': '🗑️',
        'LOGIN': '🔐',
        'REGISTER': '👤',
        'PASSWORD_CHANGE': '🔑',
        'UPDATE_USER': '👥',
        'DELETE_USER': '❌'
    };
    return icons[action] || '📝';
}

// ============ UI HELPERS ============

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
    
    // Add project button
    document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal());
    
    // Client form
    document.getElementById('clientForm').addEventListener('submit', handleClientSubmit);
    
    // Project form
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    
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
    
    // Search and filter - Clients
    document.getElementById('searchClients').addEventListener('input', filterClients);
    document.getElementById('statusFilter').addEventListener('change', filterClients);
    
    // Search and filter - Projects
    document.getElementById('searchProjects').addEventListener('input', filterProjects);
    document.getElementById('projectStatusFilter').addEventListener('change', filterProjects);
    document.getElementById('projectClientFilter').addEventListener('change', filterProjects);
}

function switchView(view) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    document.querySelectorAll('.dashboard-view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}View`)?.classList.add('active');
    
    // Load view-specific data
    if (view === 'dashboard') {
        loadDashboard();
    } else if (view === 'users' && currentUser?.role === 'admin') {
        loadUsers();
    } else if (view === 'activity' && currentUser?.role === 'admin') {
        loadActivity();
    }
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

window.closeRegisterModal = function() {
    document.getElementById('registerModal').classList.remove('active');
}

function showFormMessage(formId, type, message) {
    const form = document.getElementById(formId);
    const messageDiv = form.querySelector('.form-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function getStatusBadge(status) {
    const badges = {
        'planning': 'info',
        'in-progress': 'primary',
        'on-hold': 'warning',
        'completed': 'success',
        'cancelled': 'danger',
        'active': 'success',
        'inactive': 'warning',
        'archived': 'secondary'
    };
    return badges[status] || 'secondary';
}

function getPriorityBadge(priority) {
    const badges = {
        'low': 'secondary',
        'medium': 'info',
        'high': 'warning',
        'urgent': 'danger'
    };
    return badges[priority] || 'secondary';
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeProjectModal();
        closeRegisterModal();
    }
});

// Close modals on overlay click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal && modal.id !== 'loginModal') {
            modal.classList.remove('active');
        }
    });
});
