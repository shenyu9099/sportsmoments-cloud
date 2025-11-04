// ========================================
// 赛场瞬间 - 登录/注册脚本
// ========================================

// 切换标签
function switchTab(tab) {
    // 更新标签样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 切换表单
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
    }
    
    // 清空消息
    document.getElementById('loginMessage').innerHTML = '';
    document.getElementById('registerMessage').innerHTML = '';
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        messageDiv.innerHTML = '<div class="error-message">请填写所有字段</div>';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    messageDiv.innerHTML = '';
    
    try {
        // 调用后端 API 验证登录
        const response = await fetch(AZURE_CONFIG.apiEndpoints.loginUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: btoa(password) // Base64 编码密码
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.user) {
            // 登录成功，保存会话
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
            
            // 跟踪用户登录（Application Insights）
            if (window.AppInsightsTracking) {
                window.AppInsightsTracking.trackUserLogin(sessionData.userId, sessionData.username);
            }
            
            messageDiv.innerHTML = '<div class="success-message">登录成功！正在跳转...</div>';
            
            // 跳转到首页
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error(result.error || '用户名或密码错误');
        }
        
    } catch (error) {
        console.error('登录失败:', error);
        messageDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const displayName = document.getElementById('registerDisplayName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const messageDiv = document.getElementById('registerMessage');
    const registerBtn = document.getElementById('registerBtn');
    
    // 验证
    if (!username || !displayName || !password || !passwordConfirm) {
        messageDiv.innerHTML = '<div class="error-message">请填写所有字段</div>';
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        messageDiv.innerHTML = '<div class="error-message">用户名长度应为3-20个字符</div>';
        return;
    }
    
    if (password.length < 6) {
        messageDiv.innerHTML = '<div class="error-message">密码至少需要6个字符</div>';
        return;
    }
    
    if (password !== passwordConfirm) {
        messageDiv.innerHTML = '<div class="error-message">两次输入的密码不一致</div>';
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = '注册中...';
    messageDiv.innerHTML = '';
    
    try {
        // 调用后端 API 注册用户
        const response = await fetch(AZURE_CONFIG.apiEndpoints.registerUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                displayName: displayName,
                password: btoa(password) // Base64 编码密码
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageDiv.innerHTML = '<div class="success-message">注册成功！请登录</div>';
            
            // 切换到登录标签
            setTimeout(() => {
                document.querySelectorAll('.tab-btn')[0].click();
                document.getElementById('loginUsername').value = username;
            }, 1500);
        } else {
            throw new Error(result.error || '注册失败');
        }
        
        registerBtn.disabled = false;
        registerBtn.textContent = '注册';
        
    } catch (error) {
        console.error('注册失败:', error);
        messageDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
        registerBtn.disabled = false;
        registerBtn.textContent = '注册';
    }
}

// 页面加载时检查登录状态
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // 已登录，跳转到首页
        window.location.href = 'index.html';
    }
});

