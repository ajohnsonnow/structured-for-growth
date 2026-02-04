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
            // Show the dashboard content for authenticated users
            document.querySelector('.dashboard-nav').classList.add('authenticated');
            document.querySelector('.dashboard-container').classList.add('authenticated');
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
            // Show the dashboard content after login
            document.querySelector('.dashboard-nav').classList.add('authenticated');
            document.querySelector('.dashboard-container').classList.add('authenticated');
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
    
    // Messages
    const threadForm = document.getElementById('threadComposeForm');
    if (threadForm) {
        threadForm.addEventListener('submit', handleThreadReply);
    }
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    // Campaigns
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
        campaignForm.addEventListener('submit', handleCampaignSubmit);
    }
    const segmentForm = document.getElementById('segmentForm');
    if (segmentForm) {
        segmentForm.addEventListener('submit', handleSegmentSubmit);
    }
    const templateForm = document.getElementById('templateForm');
    if (templateForm) {
        templateForm.addEventListener('submit', handleTemplateSubmit);
    }
    
    // Campaign tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCampaignTab(btn.dataset.tab));
    });
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
    } else if (view === 'messages') {
        loadMessages();
    } else if (view === 'campaigns') {
        loadCampaigns();
    }
}

function showLoginModal() {
    // Dashboard content is hidden by default via CSS
    // Just show the login modal
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

// ============ MESSAGES ============

let allConversations = [];
let currentConversationClientId = null;
let allSegments = [];
let allTemplates = [];
let allCampaigns = [];

async function loadMessages() {
    try {
        const response = await fetch('/api/messages', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allConversations = data.conversations;
            displayConversations(allConversations);
            updateUnreadBadge();
        }
    } catch (error) {
        console.error('Load messages error:', error);
    }
}

async function updateUnreadBadge() {
    try {
        const response = await fetch('/api/messages/unread/count', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('unreadBadge');
            if (badge) {
                badge.textContent = data.count || 0;
                badge.style.display = data.count > 0 ? 'inline-flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Unread count error:', error);
    }
}

function displayConversations(conversations) {
    const container = document.getElementById('conversationsList');
    
    if (conversations.length === 0) {
        container.innerHTML = '<p class="empty-message">No conversations yet. Start messaging clients!</p>';
        return;
    }
    
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${conv.unread_count > 0 ? 'unread' : ''} ${currentConversationClientId === conv.client_id ? 'active' : ''}" 
             onclick="openConversation(${conv.client_id})">
            <div class="conversation-avatar">${conv.client_name.charAt(0).toUpperCase()}</div>
            <div class="conversation-info">
                <div class="conversation-header">
                    <strong class="conversation-name">${conv.client_name}</strong>
                    <span class="conversation-time">${formatRelativeTime(conv.last_message_at)}</span>
                </div>
                <p class="conversation-preview">${conv.last_message || 'No messages yet'}</p>
            </div>
            ${conv.unread_count > 0 ? `<span class="conversation-badge">${conv.unread_count}</span>` : ''}
        </div>
    `).join('');
}

window.openConversation = async function(clientId) {
    currentConversationClientId = clientId;
    const conv = allConversations.find(c => c.client_id === clientId);
    
    // Update UI
    document.getElementById('threadClientName').textContent = conv?.client_name || 'Client';
    document.getElementById('messageThread').innerHTML = '<p class="loading-text">Loading messages...</p>';
    
    // Highlight active conversation
    document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.conversation-item[onclick="openConversation(${clientId})"]`)?.classList.add('active');
    
    try {
        const response = await fetch(`/api/messages/client/${clientId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayThread(data.messages);
            updateUnreadBadge();
            loadMessages(); // Refresh conversations to update unread counts
        }
    } catch (error) {
        console.error('Load thread error:', error);
        document.getElementById('messageThread').innerHTML = '<p class="error-message">Failed to load messages</p>';
    }
}

function displayThread(messages) {
    const container = document.getElementById('messageThread');
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="empty-thread">No messages in this conversation yet.</p>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.direction}">
            <div class="message-bubble">
                ${msg.subject ? `<div class="message-subject">${msg.subject}</div>` : ''}
                <div class="message-content">${msg.content.replace(/\n/g, '<br>')}</div>
                <div class="message-meta">
                    <span class="message-time">${formatRelativeTime(msg.created_at)}</span>
                    ${msg.direction === 'outgoing' && msg.sent_via ? `<span class="message-via">via ${msg.sent_via}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function handleThreadReply(e) {
    e.preventDefault();
    
    if (!currentConversationClientId) {
        alert('Please select a conversation first');
        return;
    }
    
    const content = document.getElementById('threadReplyContent').value.trim();
    if (!content) return;
    
    try {
        const response = await fetch(`/api/messages/client/${currentConversationClientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            document.getElementById('threadReplyContent').value = '';
            openConversation(currentConversationClientId);
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Connection error. Please try again.');
    }
}

window.openMessageModal = function() {
    const modal = document.getElementById('messageModal');
    const form = document.getElementById('messageForm');
    form.reset();
    
    // Populate client dropdown
    const select = document.getElementById('messageClient');
    select.innerHTML = '<option value="">Choose a client...</option>' +
        allClients.map(c => `<option value="${c.id}">${c.name}${c.company ? ` (${c.company})` : ''}</option>`).join('');
    
    modal.classList.add('active');
}

window.closeMessageModal = function() {
    document.getElementById('messageModal').classList.remove('active');
}

async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('messageClient').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    
    try {
        const response = await fetch(`/api/messages/client/${clientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ subject, content })
        });
        
        if (response.ok) {
            closeMessageModal();
            loadMessages();
            openConversation(parseInt(clientId));
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Connection error. Please try again.');
    }
}

// ============ CAMPAIGNS ============

async function loadCampaigns() {
    try {
        const [campaignsRes, segmentsRes, templatesRes] = await Promise.all([
            fetch('/api/campaigns', { headers: { 'Authorization': `Bearer ${authToken}` } }),
            fetch('/api/campaigns/segments/list', { headers: { 'Authorization': `Bearer ${authToken}` } }),
            fetch('/api/campaigns/templates/list', { headers: { 'Authorization': `Bearer ${authToken}` } })
        ]);
        
        if (campaignsRes.ok) {
            const data = await campaignsRes.json();
            allCampaigns = data.campaigns;
            displayCampaigns(allCampaigns);
        }
        
        if (segmentsRes.ok) {
            const data = await segmentsRes.json();
            allSegments = data.segments;
            displaySegments(allSegments);
            populateSegmentDropdowns();
        }
        
        if (templatesRes.ok) {
            const data = await templatesRes.json();
            allTemplates = data.templates;
            displayTemplates(allTemplates);
            populateTemplateDropdowns();
        }
    } catch (error) {
        console.error('Load campaigns error:', error);
    }
}

function displayCampaigns(campaigns) {
    const container = document.getElementById('campaignsGrid');
    
    if (campaigns.length === 0) {
        container.innerHTML = '<p class="empty-message">No campaigns yet. Create your first campaign!</p>';
        return;
    }
    
    container.innerHTML = campaigns.map(campaign => `
        <div class="campaign-card">
            <div class="campaign-header">
                <h4>${campaign.name}</h4>
                <span class="badge badge-${getCampaignStatusBadge(campaign.status)}">${campaign.status}</span>
            </div>
            <p class="campaign-subject">${campaign.subject}</p>
            <div class="campaign-stats">
                <span title="Sent"><span class="stat-icon">📤</span> ${campaign.sent_count || 0}</span>
                <span title="Opened"><span class="stat-icon">👁️</span> ${campaign.open_count || 0}</span>
                <span title="Clicked"><span class="stat-icon">🖱️</span> ${campaign.click_count || 0}</span>
            </div>
            <div class="campaign-meta">
                ${campaign.segment_name ? `<span class="campaign-segment">🎯 ${campaign.segment_name}</span>` : ''}
                <span class="campaign-date">${campaign.sent_at ? formatRelativeTime(campaign.sent_at) : 'Not sent'}</span>
            </div>
            <div class="campaign-actions">
                ${campaign.status === 'draft' ? `
                    <button class="btn btn-sm btn-primary" onclick="sendCampaign(${campaign.id})">Send Now</button>
                    <button class="btn btn-sm btn-outline" onclick="editCampaign(${campaign.id})">Edit</button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteCampaign(${campaign.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function displaySegments(segments) {
    const container = document.getElementById('segmentsGrid');
    
    if (segments.length === 0) {
        container.innerHTML = '<p class="empty-message">No segments yet. Create segments to target specific clients!</p>';
        return;
    }
    
    container.innerHTML = segments.map(segment => `
        <div class="segment-card">
            <h4>${segment.name}</h4>
            <p class="segment-description">${segment.description || 'No description'}</p>
            <div class="segment-meta">
                <span class="segment-count"><strong>${segment.client_count || 0}</strong> clients</span>
            </div>
            <div class="segment-actions">
                <button class="btn btn-sm btn-outline" onclick="editSegment(${segment.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSegment(${segment.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayTemplates(templates) {
    const container = document.getElementById('templatesGrid');
    
    if (templates.length === 0) {
        container.innerHTML = '<p class="empty-message">No templates yet. Create reusable email templates!</p>';
        return;
    }
    
    container.innerHTML = templates.map(template => `
        <div class="template-card">
            <div class="template-header">
                <h4>${template.name}</h4>
                <span class="badge badge-${getTemplateCategoryBadge(template.category)}">${template.category}</span>
            </div>
            <p class="template-subject"><strong>Subject:</strong> ${template.subject}</p>
            <p class="template-preview">${template.content.substring(0, 100)}${template.content.length > 100 ? '...' : ''}</p>
            <div class="template-actions">
                <button class="btn btn-sm btn-outline" onclick="editTemplate(${template.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function populateSegmentDropdowns() {
    const select = document.getElementById('campaignSegment');
    if (select) {
        select.innerHTML = '<option value="">All Clients</option>' +
            allSegments.map(s => `<option value="${s.id}">${s.name} (${s.client_count || 0} clients)</option>`).join('');
    }
}

function populateTemplateDropdowns() {
    const select = document.getElementById('campaignTemplate');
    if (select) {
        select.innerHTML = '<option value="">None (Write Custom)</option>' +
            allTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }
}

window.loadTemplate = function(templateId) {
    if (!templateId) return;
    
    const template = allTemplates.find(t => t.id == templateId);
    if (template) {
        document.getElementById('campaignSubject').value = template.subject;
        document.getElementById('campaignContent').value = template.content;
    }
}

window.switchCampaignTab = function(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab content - tabs are named "campaigns-list", "segments-list", "templates-list"
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tab);
    });
}

// Campaign Modal
window.openCampaignModal = function(campaignId = null) {
    const modal = document.getElementById('campaignModal');
    const form = document.getElementById('campaignForm');
    
    form.reset();
    document.getElementById('campaignId').value = '';
    document.getElementById('campaignModalTitle').textContent = 'Create Campaign';
    
    if (campaignId) {
        const campaign = allCampaigns.find(c => c.id === campaignId);
        if (campaign) {
            document.getElementById('campaignId').value = campaign.id;
            document.getElementById('campaignName').value = campaign.name;
            document.getElementById('campaignSegment').value = campaign.segment_id || '';
            document.getElementById('campaignSubject').value = campaign.subject;
            document.getElementById('campaignContent').value = campaign.content;
            document.getElementById('campaignModalTitle').textContent = 'Edit Campaign';
        }
    }
    
    modal.classList.add('active');
}

window.closeCampaignModal = function() {
    document.getElementById('campaignModal').classList.remove('active');
}

window.saveCampaignAsDraft = async function() {
    await submitCampaign('draft');
}

async function handleCampaignSubmit(e) {
    e.preventDefault();
    await submitCampaign('sending');
}

async function submitCampaign(status) {
    const campaignId = document.getElementById('campaignId').value;
    const campaignData = {
        name: document.getElementById('campaignName').value,
        subject: document.getElementById('campaignSubject').value,
        content: document.getElementById('campaignContent').value,
        segment_id: document.getElementById('campaignSegment').value || null,
        status
    };
    
    try {
        let response;
        
        if (campaignId) {
            // Update existing campaign
            response = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(campaignData)
            });
        } else {
            // Create new campaign
            response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(campaignData)
            });
        }
        
        if (response.ok) {
            const data = await response.json();
            
            // If sending, actually send the campaign
            if (status === 'sending') {
                const sendRes = await fetch(`/api/campaigns/${data.campaign?.id || campaignId}/send`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                
                if (sendRes.ok) {
                    const sendData = await sendRes.json();
                    alert(`Campaign sent to ${sendData.sent_count} recipients!`);
                } else {
                    alert('Campaign saved but sending failed');
                }
            }
            
            closeCampaignModal();
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Campaign submit error:', error);
        alert('Connection error. Please try again.');
    }
}

window.editCampaign = function(campaignId) {
    openCampaignModal(campaignId);
}

window.sendCampaign = async function(campaignId) {
    if (!confirm('Are you sure you want to send this campaign now?')) return;
    
    try {
        const response = await fetch(`/api/campaigns/${campaignId}/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`Campaign sent to ${data.sent_count} recipients!`);
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to send campaign');
        }
    } catch (error) {
        console.error('Send campaign error:', error);
        alert('Connection error. Please try again.');
    }
}

window.deleteCampaign = async function(campaignId) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete campaign');
        }
    } catch (error) {
        console.error('Delete campaign error:', error);
        alert('Connection error. Please try again.');
    }
}

// Segment Modal
window.openSegmentModal = function(segmentId = null) {
    const modal = document.getElementById('segmentModal');
    const form = document.getElementById('segmentForm');
    
    form.reset();
    document.getElementById('segmentId').value = '';
    document.getElementById('segmentModalTitle').textContent = 'Create Segment';
    
    if (segmentId) {
        const segment = allSegments.find(s => s.id === segmentId);
        if (segment) {
            document.getElementById('segmentId').value = segment.id;
            document.getElementById('segmentName').value = segment.name;
            document.getElementById('segmentDescription').value = segment.description || '';
            document.getElementById('segmentFilter').value = segment.filter_rules || '';
            document.getElementById('segmentModalTitle').textContent = 'Edit Segment';
        }
    }
    
    modal.classList.add('active');
}

window.closeSegmentModal = function() {
    document.getElementById('segmentModal').classList.remove('active');
}

async function handleSegmentSubmit(e) {
    e.preventDefault();
    
    const segmentId = document.getElementById('segmentId').value;
    const segmentData = {
        name: document.getElementById('segmentName').value,
        description: document.getElementById('segmentDescription').value || null,
        filter_rules: document.getElementById('segmentFilter').value || null
    };
    
    try {
        const url = segmentId ? `/api/campaigns/segments/${segmentId}` : '/api/campaigns/segments';
        const method = segmentId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(segmentData)
        });
        
        if (response.ok) {
            closeSegmentModal();
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Segment submit error:', error);
        alert('Connection error. Please try again.');
    }
}

window.editSegment = function(segmentId) {
    openSegmentModal(segmentId);
}

window.deleteSegment = async function(segmentId) {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
        const response = await fetch(`/api/campaigns/segments/${segmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete segment');
        }
    } catch (error) {
        console.error('Delete segment error:', error);
        alert('Connection error. Please try again.');
    }
}

// Template Modal
window.openTemplateModal = function(templateId = null) {
    const modal = document.getElementById('templateModal');
    const form = document.getElementById('templateForm');
    
    form.reset();
    document.getElementById('templateId').value = '';
    document.getElementById('templateModalTitle').textContent = 'Create Template';
    
    if (templateId) {
        const template = allTemplates.find(t => t.id === templateId);
        if (template) {
            document.getElementById('templateId').value = template.id;
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateCategory').value = template.category || 'general';
            document.getElementById('templateSubject').value = template.subject;
            document.getElementById('templateContent').value = template.content;
            document.getElementById('templateModalTitle').textContent = 'Edit Template';
        }
    }
    
    modal.classList.add('active');
}

window.closeTemplateModal = function() {
    document.getElementById('templateModal').classList.remove('active');
}

async function handleTemplateSubmit(e) {
    e.preventDefault();
    
    const templateId = document.getElementById('templateId').value;
    const templateData = {
        name: document.getElementById('templateName').value,
        subject: document.getElementById('templateSubject').value,
        content: document.getElementById('templateContent').value,
        category: document.getElementById('templateCategory').value
    };
    
    try {
        const url = templateId ? `/api/campaigns/templates/${templateId}` : '/api/campaigns/templates';
        const method = templateId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(templateData)
        });
        
        if (response.ok) {
            closeTemplateModal();
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Template submit error:', error);
        alert('Connection error. Please try again.');
    }
}

window.editTemplate = function(templateId) {
    openTemplateModal(templateId);
}

window.deleteTemplate = async function(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
        const response = await fetch(`/api/campaigns/templates/${templateId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadCampaigns();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete template');
        }
    } catch (error) {
        console.error('Delete template error:', error);
        alert('Connection error. Please try again.');
    }
}

// Helper functions
function getCampaignStatusBadge(status) {
    const badges = {
        'draft': 'secondary',
        'scheduled': 'info',
        'sending': 'warning',
        'sent': 'success',
        'failed': 'danger'
    };
    return badges[status] || 'secondary';
}

function getTemplateCategoryBadge(category) {
    const badges = {
        'general': 'secondary',
        'welcome': 'success',
        'follow-up': 'info',
        'promotional': 'warning',
        'newsletter': 'primary'
    };
    return badges[category] || 'secondary';
}

function formatRelativeTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeProjectModal();
        closeRegisterModal();
        closeCampaignModal();
        closeSegmentModal();
        closeTemplateModal();
        closeMessageModal();
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
