// ========================================
// 赛场瞬间 - 主页面脚本
// ========================================

let allMatches = [];
let currentFilter = 'all';

// ========================================
// 页面加载
// ========================================

window.addEventListener('load', () => {
    loadMatches();
    setupEventListeners();
});

function setupEventListeners() {
    // 拖拽上传支持
    const videoFileDisplay = document.getElementById('videoFileDisplay');
    if (videoFileDisplay) {
        videoFileDisplay.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoFileDisplay.style.borderColor = 'var(--primary-color)';
        });
        
        videoFileDisplay.addEventListener('dragleave', (e) => {
            e.preventDefault();
            videoFileDisplay.style.borderColor = '';
        });
        
        videoFileDisplay.addEventListener('drop', (e) => {
            e.preventDefault();
            videoFileDisplay.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('video/')) {
                document.getElementById('videoFile').files = e.dataTransfer.files;
                handleVideoSelect(document.getElementById('videoFile'));
            }
        });
    }
    
    // 表单提交
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
}

// ========================================
// 加载比赛列表
// ========================================

async function loadMatches() {
    const matchList = document.getElementById('matchList');
    matchList.innerHTML = '<div class="loading">加载比赛数据中...</div>';
    
    try {
        const response = await fetch(
            AZURE_CONFIG.apiEndpoints.getMatches,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // 修复数据格式：将字符串转换为对象/数组
            allMatches = result.data.map(match => {
                try {
                    // 解析 result 字段（如果是字符串）
                    if (typeof match.result === 'string') {
                        match.result = JSON.parse(match.result);
                    }
                    // 解析 tags 字段（如果是字符串）
                    if (typeof match.tags === 'string') {
                        match.tags = JSON.parse(match.tags);
                    }
                } catch (e) {
                    console.warn('解析数据失败:', e, match);
                }
                return match;
            });
            
            renderMatches(allMatches);
            updateStats(allMatches);
        } else {
            matchList.innerHTML = '<div class="loading">暂无比赛数据</div>';
        }
    } catch (error) {
        console.error('加载比赛失败:', error);
        matchList.innerHTML = `<div class="loading">加载失败: ${error.message}<br><small>请检查API端点配置</small></div>`;
    }
}

// ========================================
// 渲染比赛列表
// ========================================

function renderMatches(matches) {
    const matchList = document.getElementById('matchList');
    
    if (!matches || matches.length === 0) {
        matchList.innerHTML = '<div class="loading">暂无比赛记录<br><button class="btn btn-primary" onclick="showUploadModal()">上传第一场比赛</button></div>';
        return;
    }
    
    matchList.innerHTML = matches.map(match => `
        <div class="match-card" onclick="viewMatchDetail('${match.id}')">
            <div class="match-thumbnail">
                ${match.thumbnailUrl ? 
                    `<img src="${match.thumbnailUrl}" alt="${match.matchTitle}">` :
                    '🏀'
                }
            </div>
            <div class="match-card-content">
                <h3 class="match-title">${match.matchTitle}</h3>
                <div class="match-score ${getScoreClass(match.result?.outcome)}">
                    ${getResultText(match.result)}
                </div>
                <div class="match-meta">
                    <span>📅 ${formatDate(match.matchDate)}</span>
                    <span>📍 ${match.location || '未知'}</span>
                    <span>👁️ ${match.viewCount || 0} 次观看</span>
                </div>
                ${match.tags && match.tags.length > 0 ? `
                    <div class="match-tags">
                        ${match.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="match-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-secondary btn-sm" onclick="viewMatchDetail('${match.id}')">
                        📊 查看详情
                    </button>
                    ${canEdit(match.uploadedBy) ? `
                        <button class="btn btn-secondary btn-sm" onclick="editMatch('${match.id}')">
                            ✏️ 编辑
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// 辅助函数
// ========================================

function getScoreClass(outcome) {
    const classes = {
        'win': 'score-win',
        'loss': 'score-loss',
        'draw': 'score-draw'
    };
    return classes[outcome] || '';
}

function getResultText(result) {
    if (!result || result.ourScore === undefined) {
        return '未记录';
    }
    
    const outcome = result.outcome === 'win' ? '胜利 🏆' : 
                   result.outcome === 'loss' ? '失利 😔' : 
                   '平局 🤝';
    
    return `${result.ourScore} : ${result.opponentScore} ${outcome}`;
}

function formatDate(dateString) {
    if (!dateString) return '未知时间';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';
    
    return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ========================================
// 统计信息
// ========================================

function updateStats(matches) {
    const total = matches.length;
    const wins = matches.filter(m => m.result?.outcome === 'win').length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    const totalSize = matches.reduce((sum, m) => sum + (m.videoSize || 0), 0);
    
    document.getElementById('totalMatches').textContent = total;
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('totalStorage').textContent = `${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// ========================================
// 筛选功能
// ========================================

function filterMatches() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = allMatches;
    
    // 按标签筛选
    if (currentFilter !== 'all') {
        filtered = filtered.filter(match => 
            match.tags && match.tags.includes(currentFilter)
        );
    }
    
    // 按搜索词筛选
    if (searchTerm) {
        filtered = filtered.filter(match => 
            match.matchTitle.toLowerCase().includes(searchTerm) ||
            match.opponent.toLowerCase().includes(searchTerm)
        );
    }
    
    renderMatches(filtered);
}

function filterByTag(tag) {
    currentFilter = tag;
    
    // 更新按钮状态
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    filterMatches();
}

// ========================================
// 上传模态框
// ========================================

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.add('show');
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('matchDate').value = today;
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('show');
    document.getElementById('uploadForm').reset();
    hideProgress();
}

// ========================================
// 文件处理
// ========================================

function handleVideoSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!AZURE_CONFIG.app.supportedVideoFormats.includes(file.type)) {
        alert('不支持的视频格式！请上传 MP4, WebM 或 OGG 格式的视频。');
        input.value = '';
        return;
    }
    
    // 验证文件大小
    if (file.size > AZURE_CONFIG.app.maxVideoSize) {
        alert(`视频文件太大！最大支持 ${AZURE_CONFIG.app.maxVideoSize / 1024 / 1024} MB`);
        input.value = '';
        return;
    }
    
    // 更新显示
    document.getElementById('videoFileDisplay').innerHTML = `
        <span>📹 ${file.name}</span><br>
        <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
    `;
    
    // 显示预览
    const preview = document.getElementById('videoPreview');
    const previewVideo = document.getElementById('previewVideo');
    preview.style.display = 'block';
    previewVideo.src = URL.createObjectURL(file);
}

function handleThumbnailSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!AZURE_CONFIG.app.supportedImageFormats.includes(file.type)) {
        alert('不支持的图片格式！');
        input.value = '';
        return;
    }
    
    // 验证文件大小
    if (file.size > AZURE_CONFIG.app.maxThumbnailSize) {
        alert(`缩略图太大！最大支持 ${AZURE_CONFIG.app.maxThumbnailSize / 1024 / 1024} MB`);
        input.value = '';
        return;
    }
    
    // 更新显示
    document.getElementById('thumbnailFileDisplay').innerHTML = `
        <span>🖼️ ${file.name}</span>
    `;
    
    // 显示预览
    const preview = document.getElementById('thumbnailPreview');
    const previewImg = document.getElementById('previewThumbnail');
    preview.style.display = 'block';
    previewImg.src = URL.createObjectURL(file);
}

// ========================================
// 标签辅助功能
// ========================================

function addTag(tag) {
    const tagsInput = document.getElementById('tags');
    const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
    
    if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        tagsInput.value = currentTags.join(', ');
    }
}

// ========================================
// 表单提交
// ========================================

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const videoFile = document.getElementById('videoFile').files[0];
    const thumbnailFile = document.getElementById('thumbnailFile').files[0];
    
    if (!videoFile) {
        alert('请选择视频文件！');
        return;
    }
    
    // 显示进度
    showProgress();
    updateProgress(0, '准备上传...');
    
    try {
        // 1. 转换视频为Base64
        updateProgress(10, '处理视频文件...');
        const videoBase64 = await fileToBase64(videoFile);
        
        // 2. 转换缩略图（如果有）
        let thumbnailBase64 = null;
        if (thumbnailFile) {
            updateProgress(20, '处理缩略图...');
            thumbnailBase64 = await fileToBase64(thumbnailFile);
        }
        
        // 3. 准备数据
        updateProgress(30, '准备数据...');
        const matchDate = document.getElementById('matchDate').value;
        const matchTime = document.getElementById('matchTime').value;
        const dateTime = `${matchDate}T${matchTime}:00Z`;
        
        const tags = document.getElementById('tags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        
        const outcome = document.querySelector('input[name="outcome"]:checked').value;
        
        const uploadData = {
            teamId: AZURE_CONFIG.teamId,
            matchTitle: document.getElementById('matchTitle').value,
            matchDate: dateTime,
            opponent: document.getElementById('opponent').value,
            location: document.getElementById('location').value || '未知',
            result: {
                ourScore: parseInt(document.getElementById('ourScore').value) || 0,
                opponentScore: parseInt(document.getElementById('opponentScore').value) || 0,
                outcome: outcome
            },
            videoContent: videoBase64.split(',')[1], // 移除data:video/...;base64,前缀
            videoType: videoFile.type,
            videoSize: videoFile.size,
            thumbnailContent: thumbnailBase64 ? thumbnailBase64.split(',')[1] : null,
            tags: tags,
            uploadedBy: AZURE_CONFIG.currentUser.userId
        };
        
        // 4. 调用API
        updateProgress(40, '上传中...');
        
        // ========================================
        // 🔍 调试日志 - 输出上传地址和数据
        // ========================================
        console.log('========================================');
        console.log('📤 上传比赛 - API 调用信息');
        console.log('========================================');
        console.log('🌐 API 地址:', AZURE_CONFIG.apiEndpoints.uploadMatch);
        console.log('📝 请求方法: POST');
        console.log('📦 请求数据:', {
            teamId: uploadData.teamId,
            matchTitle: uploadData.matchTitle,
            matchDate: uploadData.matchDate,
            opponent: uploadData.opponent,
            location: uploadData.location,
            result: uploadData.result,
            tags: uploadData.tags,
            videoSize: uploadData.videoSize,
            videoType: uploadData.videoType,
            thumbnailIncluded: !!uploadData.thumbnailContent,
            videoContentLength: uploadData.videoContent ? uploadData.videoContent.length : 0
        });
        console.log('========================================');
        
        const response = await fetch(AZURE_CONFIG.apiEndpoints.uploadMatch, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        updateProgress(90, '处理响应...');
        const result = await response.json();
        
        if (result.success) {
            updateProgress(100, '上传成功！');
            
            // 跟踪比赛上传（Application Insights）
            if (window.AppInsightsTracking) {
                window.AppInsightsTracking.trackMatchUpload(result.matchId, uploadData.videoSize);
            }
            
            setTimeout(() => {
                closeUploadModal();
                loadMatches(); // 刷新列表
                alert('比赛上传成功！');
            }, 1000);
        } else {
            throw new Error(result.error || '上传失败');
        }
        
    } catch (error) {
        console.error('上传失败:', error);
        hideProgress();
        alert(`上传失败: ${error.message}`);
    }
}

// ========================================
// 进度条
// ========================================

function showProgress() {
    document.getElementById('uploadProgress').style.display = 'block';
    document.getElementById('uploadBtn').disabled = true;
}

function hideProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadBtn').disabled = false;
}

function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressText').textContent = `${text} ${percent}%`;
}

// ========================================
// 文件转Base64
// ========================================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ========================================
// 导航功能
// ========================================

function viewMatchDetail(matchId) {
    window.location.href = `match-detail.html?id=${matchId}`;
}

function editMatch(matchId) {
    // TODO: 实现编辑功能
    alert('编辑功能开发中...');
}

// ========================================
// 模态框外部点击关闭
// ========================================

window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target === modal) {
        closeUploadModal();
    }
}

