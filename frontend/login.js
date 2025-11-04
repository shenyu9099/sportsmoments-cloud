// ========================================
// Sports Moments - Login/Register Script
// ========================================

// Switch Tab
function switchTab(tab) {
    // Update tab style
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Switch form
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
    }
    
    // Clear messages
    document.getElementById('loginMessage').innerHTML = '';
    document.getElementById('registerMessage').innerHTML = '';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        messageDiv.innerHTML = '<div class="error-message">Please fill in all fields</div>';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    messageDiv.innerHTML = '';
    
    try {
        // Call backend API to verify login
        const response = await fetch(AZURE_CONFIG.apiEndpoints.loginUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: btoa(password) // Base64 encode password
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.user) {
            // Login successful, save session
            const sessionData = {
                userId: result.user.userId,
                username: result.user.username,
                displayName: result.user.displayName,
                teamId: result.user.teamId,
                role: result.user.role,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Track user login (Application Insights)
            if (window.AppInsightsTracking) {
                window.AppInsightsTracking.trackUserLogin(sessionData.userId, sessionData.username);
            }
            
            messageDiv.innerHTML = '<div class="success-message">Login successful! Redirecting...</div>';
            
            // Redirect to homepage
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error(result.error || 'Incorrect username or password');
        }
        
    } catch (error) {
        console.error('Login failed:', error);
        messageDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const displayName = document.getElementById('registerDisplayName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const messageDiv = document.getElementById('registerMessage');
    const registerBtn = document.getElementById('registerBtn');
    
    // Validation
    if (!username || !displayName || !password || !passwordConfirm) {
        messageDiv.innerHTML = '<div class="error-message">Please fill in all fields</div>';
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        messageDiv.innerHTML = '<div class="error-message">Username should be 3-20 characters</div>';
        return;
    }
    
    if (password.length < 6) {
        messageDiv.innerHTML = '<div class="error-message">Password must be at least 6 characters</div>';
        return;
    }
    
    if (password !== passwordConfirm) {
        messageDiv.innerHTML = '<div class="error-message">Passwords do not match</div>';
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = 'Registering...';
    messageDiv.innerHTML = '';
    
    try {
        // Call backend API to register user
        const response = await fetch(AZURE_CONFIG.apiEndpoints.registerUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                displayName: displayName,
                password: btoa(password) // Base64 encode password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageDiv.innerHTML = '<div class="success-message">Registration successful! Please login</div>';
            
            // Switch to login tab
            setTimeout(() => {
                document.querySelectorAll('.tab-btn')[0].click();
                document.getElementById('loginUsername').value = username;
            }, 1500);
        } else {
            throw new Error(result.error || 'Registration failed');
        }
        
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        
    } catch (error) {
        console.error('Registration failed:', error);
        messageDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
    }
}

// Check login status on page load
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Already logged in, redirect to homepage
        window.location.href = 'index.html';
    }
});

