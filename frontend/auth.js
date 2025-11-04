// ========================================
// User Authentication and Permission Management
// ========================================

// Get current logged in user
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

// Check if logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && getCurrentUser() !== null;
}

// Require login (redirect to login page if not logged in)
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// Check if user has permission to edit/delete content
function canEdit(uploadedBy) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Check if user is the uploader
    return currentUser.userId === uploadedBy || 
           currentUser.username === uploadedBy;
}

// Update AZURE_CONFIG with current user info
function updateConfigWithCurrentUser() {
    const user = getCurrentUser();
    if (user && typeof AZURE_CONFIG !== 'undefined') {
        AZURE_CONFIG.currentUser = {
            userId: user.userId,
            userName: user.displayName,
            role: user.role
        };
    }
}

// Display user info
function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Find user info display area
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <span class="user-greeting">
                👤 ${user.displayName}
            </span>
            <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
        `;
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    // Update config
    updateConfigWithCurrentUser();
    
    // Display user info
    displayUserInfo();
});

