let adminAuthToken = localStorage.getItem('adminAuthToken') || 'your-default-token';


let username = localStorage.getItem('adminUsername') || null;
let password = localStorage.getItem('adminPassword') || null;


function checkAuthentication() {
    if (!username || !password) {
        loginPrompt();
    } else if (username !== 'admin' || password !== 'admin') {
        logout();
        loginPrompt();
    }
}


function loginPrompt() {
    username = prompt("Enter username:");
    if (!username) {
        alert("Login cancelled");
        return;
    }
    
    password = prompt("Enter password:");
    if (!password) {
        alert("Login cancelled");
        return;
    }
    
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('adminPassword', password);
        alert('Login successful!');
    } else {
        alert('Invalid credentials');
        username = null;
        password = null;
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminPassword');
    }
}

// Logout function
function logout() {
    username = null;
    password = null;
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminPassword');
    alert('Logged out successfully!');
}


document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    
    
    fetchDashboardStats();
    
    
    loadUsers(1);
    
    
    loadCrops(1);
    
    
    loadContacts(1);
    
   
    setupEventListeners();
    
    
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});

// Existing functions remain here...

const API_BASE_URL = 'http://localhost:3000/api/admin';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    
    fetchDashboardStats();
    
   
    loadUsers(1);
    
   
    loadCrops(1);
    
    
    setupEventListeners();
});

// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard statistics');
        }
        
        const stats = await response.json();
        
       
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('active-sessions').textContent = stats.activeSessions;
        document.getElementById('new-signups').textContent = stats.newSignups;
        document.getElementById('pending-requests').textContent = stats.pendingRequests;
        
       
        renderUserGrowthChart(stats.monthlyGrowth);
        renderUserTypeChart(stats.usersByType);
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}


function renderUserGrowthChart(data) {
    const ctx = document.getElementById('userGrowthChart').getContext('2d');
    
    const labels = data.map(item => item.month);
    const values = data.map(item => item.new_users);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Users',
                data: values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Render user type distribution chart
function renderUserTypeChart(data) {
    const ctx = document.getElementById('userTypeChart').getContext('2d');
    
    const labels = data.map(item => item.user_type);
    const values = data.map(item => item.count);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(33, 150, 243, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}


async function loadUsers(page, search = '', userType = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=10&search=${search}&userType=${userType}`, {
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const result = await response.json();
        
       
        const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
        usersTable.innerHTML = '';
        
        result.users.forEach(user => {
            const row = usersTable.insertRow();
            
            row.insertCell(0).textContent = user.id;
            row.insertCell(1).textContent = user.fullname;
            row.insertCell(2).textContent = user.email;
            row.insertCell(3).textContent = user.user_type;
            row.insertCell(4).textContent = new Date(user.created_at).toLocaleDateString();
            row.insertCell(5).textContent = user.auth ? 'Active' : 'Inactive';
            
            const actionsCell = row.insertCell(6);
            actionsCell.innerHTML = `
                <button class="btn view-user" data-user-id="${user.id}">View</button>
                <button class="btn edit-user" data-user-id="${user.id}">Edit</button>
            `;
        });
        
        // Update pagination
        updatePagination('users-pagination', result.pagination);
        
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load crops with pagination
async function loadCrops(page) {
    try {
        const response = await fetch(`${API_BASE_URL}/crops?page=${page}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch crops');
        }
        
        const result = await response.json();
        
        // Update crops grid
        const cropsGrid = document.getElementById('crops-grid');
        cropsGrid.innerHTML = '';
        
        result.crops.forEach(crop => {
            // Construct the full URL for the image
            const imageUrl = crop.file_url 
                ? `http://localhost:3000${crop.file_url.startsWith('/') ? crop.file_url : `/${crop.file_url}`}`
                : null;
            
            const cropCard = document.createElement('div');
            cropCard.style = `
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                background-color: white;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            `;
            cropCard.onmouseover = () => {
                cropCard.style.transform = 'translateY(-5px)';
                cropCard.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
            };
            cropCard.onmouseout = () => {
                cropCard.style.transform = 'translateY(0)';
                cropCard.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
            };
            
            cropCard.innerHTML = `
                ${imageUrl ? `
                    <img src="${imageUrl}" alt="${crop.crop_type}" style="width: 100%; height: 200px; object-fit: cover;">
                ` : ''}
                <div style="padding: 20px;">
                    <h3 style="margin-top: 0; color: #2E7D32; font-size: 20px; margin-bottom: 15px; font-weight: 600;">
                        ${crop.crop_type}
                    </h3>
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">
                            <strong>Quantity:</strong> ${crop.quantity} kg
                        </p>
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">
                            <strong>Price:</strong> $${crop.price_per_kg}/kg
                        </p>
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">
                            <strong>Location:</strong> ${crop.location}
                        </p>
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">
                            <strong>Uploaded:</strong> ${new Date(crop.uploaded_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="approve-crop" data-crop-id="${crop.id}" style="flex: 1; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background-color 0.3s;">
                            Approve
                        </button>
                        <button class="reject-crop" data-crop-id="${crop.id}" style="flex: 1; padding: 10px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background-color 0.3s;">
                            Reject
                        </button>
                    </div>
                </div>
            `;
            cropsGrid.appendChild(cropCard);
        });
        
       
        document.querySelectorAll('.approve-crop').forEach(button => {
            button.onclick = () => {
                const cropId = button.getAttribute('data-crop-id');
                approveCrop(cropId);
            };
        });
        
        document.querySelectorAll('.reject-crop').forEach(button => {
            button.onclick = () => {
                const cropId = button.getAttribute('data-crop-id');
                rejectCrop(cropId);
            };
        });
        
       
        updatePagination('crops-pagination', result.pagination);
        
    } catch (error) {
        console.error('Error loading crops:', error);
    }
}

function updatePagination(paginationId, paginationData) {
    const pagination = document.getElementById(paginationId);
    const pageNumbers = pagination.querySelector('.page-numbers');
    
    pageNumbers.innerHTML = `
        <span class="current-page">${paginationData.page}</span> 
        of <span class="total-pages">${paginationData.pages}</span>
    `;
    
    // Add event listeners for pagination buttons
    pagination.querySelector('.prev-page').onclick = () => {
        if (paginationData.page > 1) {
            if (paginationId === 'users-pagination') {
                const search = document.getElementById('user-search').value;
                const userType = document.getElementById('user-type-filter').value;
                loadUsers(paginationData.page - 1, search, userType);
            } else {
                loadCrops(paginationData.page - 1);
            }
        }
    };
    
    pagination.querySelector('.next-page').onclick = () => {
        if (paginationData.page < paginationData.pages) {
            if (paginationId === 'users-pagination') {
                const search = document.getElementById('user-search').value;
                const userType = document.getElementById('user-type-filter').value;
                loadUsers(paginationData.page + 1, search, userType);
            } else {
                loadCrops(paginationData.page + 1);
            }
        }
    };
}

// Set up event listeners
function setupEventListeners() {
    // Search users
    document.getElementById('search-users-btn').addEventListener('click', () => {
        const search = document.getElementById('user-search').value;
        const userType = document.getElementById('user-type-filter').value;
        loadUsers(1, search, userType);
    });
    
    // Search crops
    document.getElementById('search-crops-btn').addEventListener('click', () => {
        const search = document.getElementById('crop-search').value;
        // You would need to modify the API call to include cropType filter
        loadCrops(1);
    });
    
    // User actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-user')) {
            const userId = e.target.getAttribute('data-user-id');
            viewUserDetails(userId);
        }
        
        if (e.target.classList.contains('approve-crop')) {
            const cropId = e.target.getAttribute('data-crop-id');
            approveCrop(cropId);
        }
        
        if (e.target.classList.contains('reject-crop')) {
            const cropId = e.target.getAttribute('data-crop-id');
            rejectCrop(cropId);
        }
    });
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('href').substring(1);
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
            
            // Load data for the selected section
            if (targetSection === 'users') {
                loadUsers(1);
            } else if (targetSection === 'crops') {
                loadCrops(1);
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-status')) {
            const contactId = e.target.getAttribute('data-contact-id');
            updateContactStatus(contactId);
        }
        
        if (e.target.classList.contains('delete-contact')) {
            const contactId = e.target.getAttribute('data-contact-id');
            deleteContact(contactId);
        }
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('href').substring(1);
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
            
            // Load data for the selected section
            if (targetSection === 'users') {
                loadUsers(1);
            } else if (targetSection === 'crops') {
                loadCrops(1);
            } else if (targetSection === 'contacts') {
                loadContacts(1);
            }
        });
    });
}

// View user details
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        
        const user = await response.json();
        
        // Update modal with user details
        document.getElementById('modal-user-id').textContent = user.id;
        document.getElementById('modal-user-name').textContent = user.fullname;
        document.getElementById('modal-user-email').textContent = user.email;
        document.getElementById('modal-user-type').textContent = user.user_type;
        document.getElementById('modal-user-registered').textContent = new Date(user.created_at).toLocaleDateString();
        document.getElementById('modal-user-status').textContent = user.auth ? 'Active' : 'Inactive';
        document.getElementById('modal-user-login').textContent = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
        document.getElementById('modal-user-crops').textContent = user.crop_count || 0;
        document.getElementById('modal-user-location').textContent = user.location || 'Not specified';
        
        // Show modal
        document.getElementById('user-details-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error viewing user details:', error);
    }
}

// Load contacts with pagination
async function loadContacts(page) {
    try {
        const response = await fetch(`${API_BASE_URL}/contacts?page=${page}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }
        
        const result = await response.json();
        
        // Update contacts grid
        const contactsGrid = document.getElementById('contacts-grid');
        contactsGrid.innerHTML = '';
        
        result.contacts.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.style = `
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 15px;
                background-color: white;
            `;
            contactCard.innerHTML = `
                <div style="padding: 15px;">
                    <h3 style="margin-top: 0; color: #333; font-size: 18px; margin-bottom: 10px;">${contact.fullname}</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Email:</strong> ${contact.email}</p>
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Mobile:</strong> ${contact.mobile_number}</p>
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Subject:</strong> ${contact.email_subject}</p>
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Message:</strong> ${contact.message}</p>
                        <p style="margin: 0; font-size: 14px; color: ${contact.STATUS ? '#4CAF50' : '#f44336'};">
                            <strong>Status:</strong> ${contact.STATUS || 'Pending'}
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #777;">
                            <strong>Created:</strong> ${new Date(contact.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div style="display: flex; padding: 10px 15px; border-top: 1px solid #e0e0e0; gap: 10px;">
                    <button class="btn update-status" data-contact-id="${contact.id}" style="padding: 6px 12px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; flex: 1;">
                        Update Status
                    </button>
                    <button class="btn delete-contact" data-contact-id="${contact.id}" style="padding: 6px 12px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; flex: 1;">
                        Delete
                    </button>
                </div>
            `;
            contactsGrid.appendChild(contactCard);
        });
        
        // Update pagination
        const pagination = document.getElementById('contacts-pagination');
        const pageNumbers = pagination.querySelector('.page-numbers');
        pageNumbers.innerHTML = `
            <span class="current-page" style="margin: 0 5px; font-weight: bold;">${result.pagination.page}</span> 
            of <span class="total-pages" style="margin: 0 5px; font-weight: bold;">${result.pagination.pages}</span>
        `;
        
        // Add event listeners for pagination buttons
        pagination.querySelector('.prev-page').onclick = () => {
            if (result.pagination.page > 1) {
                loadContacts(result.pagination.page - 1);
            }
        };
        
        pagination.querySelector('.next-page').onclick = () => {
            if (result.pagination.page < result.pagination.pages) {
                loadContacts(result.pagination.page + 1);
            }
        };
        
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Approve crop
async function approveCrop(cropId) {
    try {
        const response = await fetch(`${API_BASE_URL}/crops/${cropId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to approve crop');
        }
        
        alert('Crop approved successfully!');
        loadCrops(document.querySelector('.current-page').textContent);
        
    } catch (error) {
        console.error('Error approving crop:', error);
    }
}

// Reject crop
async function rejectCrop(cropId) {
    try {
        const response = await fetch(`${API_BASE_URL}/crops/${cropId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminAuthToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to reject crop');
        }
        
        alert('Crop rejected successfully!');
        loadCrops(document.querySelector('.current-page').textContent);
        
    } catch (error) {
        console.error('Error rejecting crop:', error);
    }
}

// Close modal when clicking the close button
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('user-details-modal').style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('user-details-modal')) {
        document.getElementById('user-details-modal').style.display = 'none';
    }
});