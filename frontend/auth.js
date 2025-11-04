// ========================================
// 用户认证和权限管理
// ========================================

// 获取当前登录用户
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

// 检查是否已登录
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && getCurrentUser() !== null;
}

// 要求登录（如果未登录则跳转到登录页）
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 登出
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// 检查用户是否有权限编辑/删除内容
function canEdit(uploadedBy) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // 检查是否是内容的上传者
    return currentUser.userId === uploadedBy || 
           currentUser.username === uploadedBy;
}

// 更新 AZURE_CONFIG 中的用户信息
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

// 显示用户信息
function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    // 查找用户信息显示区域
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <span class="user-greeting">
                👤 ${user.displayName}
            </span>
            <button class="btn btn-secondary btn-sm" onclick="logout()">退出</button>
        `;
    }
}

// 页面加载时初始化
window.addEventListener('load', () => {
    // 更新配置
    updateConfigWithCurrentUser();
    
    // 显示用户信息
    displayUserInfo();
});

