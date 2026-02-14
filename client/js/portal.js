// Client Portal JavaScript
let authToken = localStorage.getItem('portalToken');
let clientData = null;

// Initialize portal
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
        const response = await fetch('/api/portal/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            clientData = data.client;
            onAuthSuccess();
        } else {
            localStorage.removeItem('portalToken');
            showLoginModal();
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLoginModal();
    }
}

function onAuthSuccess() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('portalContent').style.display = 'block';
    
    // Set welcome name
    document.getElementById('clientName').textContent = clientData.name.split(' ')[0];
    
    // Load all data
    displayClientInfo();
    loadProjects();
    loadPaymentInfo();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    
    messageEl.textContent = '';
    messageEl.className = 'form-message';
    
    try {
        const response = await fetch('/api/portal/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('portalToken', authToken);
            clientData = data.client;
            onAuthSuccess();
        } else {
            messageEl.textContent = data.message || 'Login failed. Please check your credentials.';
            messageEl.className = 'form-message error';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageEl.textContent = 'Connection error. Please try again.';
        messageEl.className = 'form-message error';
    }
}

function logout() {
    localStorage.removeItem('portalToken');
    authToken = null;
    clientData = null;
    window.location.reload();
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('portalContent').style.display = 'none';
}

// ============ DISPLAY CLIENT INFO ============

function displayClientInfo() {
    if (!clientData) return;
    
    document.getElementById('infoName').textContent = clientData.name || '-';
    document.getElementById('infoEmail').textContent = clientData.email || '-';
    document.getElementById('infoCompany').textContent = clientData.company || '-';
    document.getElementById('infoPhone').textContent = clientData.phone || '-';
    
    const statusEl = document.getElementById('infoStatus');
    statusEl.textContent = clientData.status || 'active';
    statusEl.className = `info-value badge badge-${clientData.status === 'active' ? 'success' : 'warning'}`;
    
    const retainer = clientData.monthly_retainer;
    document.getElementById('infoRetainer').textContent = retainer ? formatCurrency(retainer) + '/month' : 'No retainer';
}

// ============ LOAD PROJECTS ============

async function loadProjects() {
    const container = document.getElementById('projectsList');
    
    try {
        const response = await fetch('/api/portal/projects', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayProjects(data.projects);
            updateSummary(data.projects);
        } else {
            container.innerHTML = '<p class="empty-message">Unable to load projects</p>';
        }
    } catch (error) {
        console.error('Load projects error:', error);
        container.innerHTML = '<p class="empty-message">Error loading projects</p>';
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsList');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="empty-message">No projects yet. Contact us to get started!</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-header">
                <h3>${project.title}</h3>
                <span class="badge badge-${getStatusBadge(project.status)}">${formatStatus(project.status)}</span>
            </div>
            ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
            <div class="project-details">
                <div class="project-detail">
                    <span class="detail-label">Budget</span>
                    <span class="detail-value">${project.budget ? formatCurrency(project.budget) : 'TBD'}</span>
                </div>
                <div class="project-detail">
                    <span class="detail-label">Estimated Hours</span>
                    <span class="detail-value">${project.hours_estimated || 'TBD'}</span>
                </div>
                <div class="project-detail">
                    <span class="detail-label">Start Date</span>
                    <span class="detail-value">${project.start_date ? formatDate(project.start_date) : 'Not started'}</span>
                </div>
                <div class="project-detail">
                    <span class="detail-label">Target Completion</span>
                    <span class="detail-value">${project.end_date ? formatDate(project.end_date) : 'TBD'}</span>
                </div>
            </div>
            ${project.status === 'in-progress' ? `
                <div class="project-progress">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${project.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function updateSummary(projects) {
    const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'planning');
    const totalValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    document.getElementById('activeProjectCount').textContent = activeProjects.length;
    document.getElementById('totalProjectValue').textContent = formatCurrency(totalValue);
}

// ============ LOAD PAYMENT INFO ============

async function loadPaymentInfo() {
    try {
        const response = await fetch('/api/portal/billing', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayPaymentInfo(data);
        }
    } catch (error) {
        console.error('Load billing error:', error);
    }
}

function displayPaymentInfo(billing) {
    const amountDue = billing.amount_due || 0;
    const nextDueDate = billing.next_due_date;
    
    document.getElementById('amountDue').textContent = formatCurrency(amountDue);
    document.getElementById('paymentAmountDue').textContent = formatCurrency(amountDue);
    
    if (nextDueDate) {
        document.getElementById('nextDueDate').textContent = formatDate(nextDueDate);
        document.getElementById('paymentDueText').textContent = `Due by ${formatDate(nextDueDate)}`;
    } else if (amountDue > 0) {
        document.getElementById('nextDueDate').textContent = 'Due Now';
        document.getElementById('paymentDueText').textContent = 'Payment due upon receipt';
    } else {
        document.getElementById('nextDueDate').textContent = '-';
        document.getElementById('paymentDueText').textContent = 'No payments due at this time';
    }
    
    // Display estimates if any
    if (billing.estimates && billing.estimates.length > 0) {
        displayEstimates(billing.estimates);
    }
}

function displayEstimates(estimates) {
    const container = document.getElementById('estimatesList');
    
    container.innerHTML = estimates.map(estimate => `
        <div class="estimate-card">
            <div class="estimate-header">
                <h4>${estimate.title}</h4>
                <span class="badge badge-${estimate.status === 'pending' ? 'warning' : 'success'}">${estimate.status}</span>
            </div>
            <p class="estimate-description">${estimate.description || ''}</p>
            <div class="estimate-amount">
                <span class="amount-label">Estimated Cost:</span>
                <span class="amount-value">${formatCurrency(estimate.amount)}</span>
            </div>
            ${estimate.status === 'pending' ? `
                <div class="estimate-actions">
                    <button class="btn btn-primary btn-small" onclick="approveEstimate(${estimate.id})">Approve</button>
                    <button class="btn btn-outline btn-small" onclick="requestChanges(${estimate.id})">Request Changes</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ============ EVENT LISTENERS ============

function initEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ============ UTILITY FUNCTIONS ============

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatStatus(status) {
    const statusMap = {
        'planning': 'Planning',
        'in-progress': 'In Progress',
        'on-hold': 'On Hold',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getStatusBadge(status) {
    const badges = {
        'planning': 'info',
        'in-progress': 'primary',
        'on-hold': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return badges[status] || 'secondary';
}

// Placeholder functions for estimate actions
window.approveEstimate = function(estimateId) {
    alert('Estimate approval feature coming soon! Please contact us to approve this estimate.');
}

window.requestChanges = function(estimateId) {
    alert('Please email us at contact@structuredforgrowth.com with your requested changes.');
}
