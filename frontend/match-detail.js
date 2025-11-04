// ========================================
// Sports Moments - Match Detail Page Script
// ========================================

let currentMatch = null;
let currentVideo = null;
let annotations = [];
let comments = [];

// Tactical Drawing Tools
let canvas, ctx;
let isDrawing = false;
let currentTool = 'arrow';
let drawingHistory = [];
let currentColor = '#ff0000';

// ========================================
// Page Load
// ========================================

window.addEventListener('load', () => {
    const matchId = getMatchIdFromUrl();
    if (matchId) {
        loadMatchDetail(matchId);
        loadAnnotations(matchId);
        loadComments(matchId);
    } else {
        alert('Match ID not found');
        window.location.href = 'index.html';
    }
    
    setupVideoPlayer();
    setupCanvas();
});

function getMatchIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ========================================
// Load Match Detail
// ========================================

async function loadMatchDetail(matchId) {
    try {
        const response = await fetch(
            `${AZURE_CONFIG.apiEndpoints.getMatchById}&id=${matchId}&teamId=${AZURE_CONFIG.teamId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Fix data format: convert strings to objects/arrays
            currentMatch = result.data;
            try {
                if (typeof currentMatch.result === 'string') {
                    currentMatch.result = JSON.parse(currentMatch.result);
                }
                if (typeof currentMatch.tags === 'string') {
                    currentMatch.tags = JSON.parse(currentMatch.tags);
                }
            } catch (e) {
                console.warn('Parse data failed:', e);
            }
            
            renderMatchDetail(currentMatch);
        } else {
            throw new Error('Failed to load match detail');
        }
    } catch (error) {
        console.error('Load failed:', error);
        alert('Failed to load match detail: ' + error.message);
    }
}

function renderMatchDetail(match) {
    // Update page title
    document.title = `${match.matchTitle} - Match Detail - Sports Moments`;
    
    // Match title
    document.getElementById('matchTitle').textContent = match.matchTitle;
    
    // Match info
    document.getElementById('matchDate').textContent = `📅 ${formatDate(match.matchDate)}`;
    document.getElementById('matchLocation').textContent = `📍 ${match.location || 'Unknown'}`;
    
    // Result badge
    const resultBadge = document.getElementById('matchResult');
    const outcome = match.result?.outcome;
    const badgeClass = outcome === 'win' ? 'badge-win' : 
                       outcome === 'loss' ? 'badge-loss' : 'badge-draw';
    const resultText = outcome === 'win' ? 'Win 🏆' : 
                      outcome === 'loss' ? 'Loss 😔' : 'Draw 🤝';
    resultBadge.className = `badge ${badgeClass}`;
    resultBadge.textContent = `${resultText} ${match.result?.ourScore || 0}:${match.result?.opponentScore || 0}`;
    
    // Tags
    const tagsContainer = document.getElementById('matchTags');
    if (match.tags && match.tags.length > 0) {
        tagsContainer.innerHTML = match.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
    
    // Video
    if (match.videoUrl) {
        document.getElementById('videoSource').src = match.videoUrl;
        currentVideo = document.getElementById('matchVideo');
        currentVideo.load();
    }
    
    // Permission check：只有上传者才能看到编辑/删除按钮
    const actionsSection = document.querySelector('.match-actions');
    if (actionsSection) {
        if (canEdit(match.uploadedBy)) {
            actionsSection.style.display = 'flex';
        } else {
            actionsSection.style.display = 'none';
        }
    }
    
    // Permission check：只有上传者才能添加战术标注
    const addAnnotationBtn = document.querySelector('.annotations-section .btn-primary');
    if (addAnnotationBtn) {
        if (canEdit(match.uploadedBy)) {
            addAnnotationBtn.style.display = 'inline-block';
        } else {
            addAnnotationBtn.style.display = 'none';
        }
    }
    
    // 更新浏览次数
    updateViewCount(match.id);
}

async function updateViewCount(matchId) {
    // TODO: 调用API更新浏览次数
}

// ========================================
// 视频播放器
// ========================================

function setupVideoPlayer() {
    const video = document.getElementById('matchVideo');
    const progressSlider = document.getElementById('videoProgress');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (!video) return;
    
    // 如果自定义控件不存在（使用原生控件），则不需要设置
    if (!progressSlider || !timeDisplay) return;
    
    video.addEventListener('loadedmetadata', () => {
        progressSlider.max = video.duration;
    });
    
    video.addEventListener('timeupdate', () => {
        progressSlider.value = video.currentTime;
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });
    
    progressSlider.addEventListener('input', (e) => {
        video.currentTime = e.target.value;
    });
}

function togglePlay() {
    const video = document.getElementById('matchVideo');
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function toggleFullscreen() {
    const video = document.getElementById('matchVideo');
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
    if (!dateString) return '未知时间';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';
    
    return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========================================
// 时间轴标记
// ========================================

function addTimelineMarker() {
    const video = document.getElementById('matchVideo');
    const currentTime = video.currentTime;
    const title = prompt('请输入标记标题：');
    
    if (title) {
        // TODO: 保存到数据库
        renderTimelineMarker({
            timestamp: currentTime,
            title: title
        });
    }
}

function renderTimelineMarker(marker) {
    const container = document.getElementById('timelineMarkers');
    const markerElement = document.createElement('div');
    markerElement.className = 'timeline-marker';
    markerElement.innerHTML = `
        <div>
            <span class="marker-time">${formatTime(marker.timestamp)}</span>
            <span>${marker.title}</span>
        </div>
    `;
    markerElement.onclick = () => {
        document.getElementById('matchVideo').currentTime = marker.timestamp;
    };
    container.appendChild(markerElement);
}

// ========================================
// 战术标注
// ========================================

async function loadAnnotations(matchId) {
    const annotationList = document.getElementById('annotationList');
    
    try {
        const response = await fetch(
            `${AZURE_CONFIG.apiEndpoints.getAnnotations}&matchId=${matchId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // 修复数据格式：解析字符串字段
            annotations = result.data.map(annotation => {
                try {
                    // 解析 tags 字段（如果是字符串）
                    if (typeof annotation.tags === 'string') {
                        annotation.tags = JSON.parse(annotation.tags);
                    }
                } catch (e) {
                    console.warn('解析标注数据失败:', e, annotation);
                    annotation.tags = [];
                }
                return annotation;
            });
            renderAnnotations(annotations);
        } else {
            renderAnnotations([]);
        }
    } catch (error) {
        console.error('加载战术标注失败:', error);
        renderAnnotations([]);
    }
}

function renderAnnotations(annotations) {
    const annotationList = document.getElementById('annotationList');
    
    if (!annotations || annotations.length === 0) {
        annotationList.innerHTML = '<div style="text-align:center;padding:30px;color:#999;">暂无战术标注</div>';
        return;
    }
    
    annotationList.innerHTML = annotations.map(annotation => `
        <div class="annotation-card">
            ${annotation.imageUrl ? 
                `<img src="${annotation.imageUrl}" alt="${annotation.title}" class="annotation-image">` :
                '<div class="annotation-image" style="display:flex;align-items:center;justify-content:center;background:#f0f0f0;">📋</div>'
            }
            <div class="annotation-content">
                <h3 class="annotation-title">${annotation.title}</h3>
                <div class="annotation-meta">
                    <span>⏱️ ${formatTime(annotation.timestamp)}</span>
                    <span>👤 ${annotation.createdBy}</span>
                </div>
                <p class="annotation-description">${annotation.description || '无描述'}</p>
                ${annotation.tags && annotation.tags.length > 0 ? `
                    <div class="match-tags">
                        ${annotation.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function jumpToTimestamp(timestamp) {
    const video = document.getElementById('matchVideo');
    video.currentTime = timestamp;
    video.scrollIntoView({ behavior: 'smooth' });
    video.play();
}

// ========================================
// 战术标注模态框
// ========================================

function showAnnotationModal() {
    const modal = document.getElementById('annotationModal');
    modal.classList.add('show');
    
    // 设置当前时间
    const video = document.getElementById('matchVideo');
    document.getElementById('annotationTimestamp').value = formatTime(video.currentTime);
    
    // 清空画布
    clearCanvas();
}

function closeAnnotationModal() {
    const modal = document.getElementById('annotationModal');
    modal.classList.remove('show');
}

async function saveAnnotation() {
    const title = document.getElementById('annotationTitle').value;
    const description = document.getElementById('annotationDescription').value;
    const tags = document.getElementById('annotationTags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
    
    if (!title) {
        alert('请输入标注标题！');
        return;
    }
    
    try {
        // 将画布转换为图片
        const canvas = document.getElementById('tacticalCanvas');
        const imageBase64 = canvas.toDataURL('image/png');
        
        const video = document.getElementById('matchVideo');
        
        const annotationData = {
            matchId: currentMatch.id,
            teamId: AZURE_CONFIG.teamId,
            timestamp: video.currentTime,
            title: title,
            description: description,
            tags: tags,
            imageContent: imageBase64.split(',')[1], // 移除前缀
            createdBy: AZURE_CONFIG.currentUser.userId
        };
        
        const response = await fetch(AZURE_CONFIG.apiEndpoints.createAnnotation, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(annotationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 跟踪战术标注创建（Application Insights）
            if (window.AppInsightsTracking) {
                window.AppInsightsTracking.trackAnnotationCreate(result.annotationId, currentMatch.id);
            }
            
            alert('战术标注保存成功！');
            closeAnnotationModal();
            loadAnnotations(currentMatch.id); // 刷新列表
        } else {
            throw new Error(result.error || '保存失败');
        }
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
    }
}

// ========================================
// 画布绘制工具
// ========================================

function setupCanvas() {
    canvas = document.getElementById('tacticalCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // 设置浅灰色背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制球场（简化版）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 500, 300);
    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(300, 350);
    ctx.stroke();
    
    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 颜色选择器
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
        });
    }
}

function selectTool(tool) {
    currentTool = tool;
    
    // 更新按钮状态
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

let startX, startY;

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = 3;
    
    switch (currentTool) {
        case 'arrow':
            drawArrow(startX, startY, x, y);
            break;
        case 'circle':
            drawCircle(startX, startY, x, y);
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'text':
            const text = prompt('输入文字：');
            if (text) {
                ctx.font = '20px Arial';
                ctx.fillText(text, x, y);
            }
            break;
    }
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        // 保存到历史记录
        drawingHistory.push(canvas.toDataURL());
    }
}

function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setupCanvas(); // 重新绘制球场
    drawingHistory = [];
}

function undoCanvas() {
    if (drawingHistory.length > 0) {
        drawingHistory.pop();
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = drawingHistory[drawingHistory.length - 1] || '';
    }
}

// ========================================
// 评论功能
// ========================================

async function loadComments(matchId) {
    const commentList = document.getElementById('commentList');
    
    try {
        const response = await fetch(
            `${AZURE_CONFIG.apiEndpoints.getComments}&matchId=${matchId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success && result.data) {
            comments = result.data;
            renderComments(comments);
        } else {
            renderComments([]);
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        renderComments([]);
    }
}

function renderComments(comments) {
    const commentList = document.getElementById('commentList');
    
    if (!comments || comments.length === 0) {
        commentList.innerHTML = '<div style="text-align:center;padding:30px;color:#999;">暂无评论，快来抢沙发！</div>';
        return;
    }
    
    commentList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-date">${formatDate(comment.createdAt || comment.createdDate)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

async function addComment() {
    const content = document.getElementById('commentInput').value.trim();
    
    if (!content) {
        alert('请输入评论内容！');
        return;
    }
    
    try {
        const commentData = {
            matchId: currentMatch.id,
            userId: AZURE_CONFIG.currentUser.userId,
            userName: AZURE_CONFIG.currentUser.userName,
            content: content
        };
        
        const response = await fetch(AZURE_CONFIG.apiEndpoints.addComment, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 跟踪评论添加（Application Insights）
            if (window.AppInsightsTracking) {
                window.AppInsightsTracking.trackCommentAdd(result.commentId, currentMatch.id);
            }
            
            document.getElementById('commentInput').value = '';
            loadComments(currentMatch.id); // 刷新评论列表
        } else {
            throw new Error(result.error || '发表评论失败');
        }
    } catch (error) {
        console.error('发表评论失败:', error);
        alert('发表评论失败: ' + error.message);
    }
}

// ========================================
// 编辑和删除功能
// ========================================

function editMatch() {
    // 打开编辑模态框
    const modal = document.getElementById('editModal');
    modal.classList.add('show');
    
    // 预填充当前比赛信息
    document.getElementById('editMatchTitle').value = currentMatch.matchTitle;
    
    // 处理日期和时间
    const matchDate = new Date(currentMatch.matchDate);
    document.getElementById('editMatchDate').value = matchDate.toISOString().split('T')[0];
    const hours = matchDate.getUTCHours().toString().padStart(2, '0');
    const minutes = matchDate.getUTCMinutes().toString().padStart(2, '0');
    document.getElementById('editMatchTime').value = `${hours}:${minutes}`;
    
    document.getElementById('editOpponent').value = currentMatch.opponent;
    document.getElementById('editLocation').value = currentMatch.location || '';
    
    // 处理 result 字段
    const result = currentMatch.result;
    document.getElementById('editOurScore').value = result.ourScore || 0;
    document.getElementById('editOpponentScore').value = result.opponentScore || 0;
    
    // 设置比赛结果单选按钮
    const outcomeRadios = document.querySelectorAll('input[name="editOutcome"]');
    outcomeRadios.forEach(radio => {
        radio.checked = (radio.value === result.outcome);
    });
    
    // 处理标签
    if (currentMatch.tags && Array.isArray(currentMatch.tags)) {
        document.getElementById('editTags').value = currentMatch.tags.join(', ');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const editBtn = document.getElementById('editBtn');
    editBtn.disabled = true;
    editBtn.textContent = '保存中...';
    
    try {
        const matchDate = document.getElementById('editMatchDate').value;
        const matchTime = document.getElementById('editMatchTime').value;
        const dateTime = `${matchDate}T${matchTime}:00Z`;
        
        const tags = document.getElementById('editTags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        
        const outcome = document.querySelector('input[name="editOutcome"]:checked').value;
        
        const updateData = {
            id: currentMatch.id,
            teamId: AZURE_CONFIG.teamId,
            matchTitle: document.getElementById('editMatchTitle').value,
            matchDate: dateTime,
            opponent: document.getElementById('editOpponent').value,
            location: document.getElementById('editLocation').value || '未知',
            result: {
                ourScore: parseInt(document.getElementById('editOurScore').value) || 0,
                opponentScore: parseInt(document.getElementById('editOpponentScore').value) || 0,
                outcome: outcome
            },
            tags: tags
        };
        
        const response = await fetch(AZURE_CONFIG.apiEndpoints.updateMatch, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('修改成功！');
            closeEditModal();
            // 重新加载页面以显示更新后的数据
            window.location.reload();
        } else {
            throw new Error(result.error || '修改失败');
        }
        
    } catch (error) {
        console.error('修改失败:', error);
        alert('修改失败: ' + error.message);
        editBtn.disabled = false;
        editBtn.textContent = '保存修改';
    }
}

async function deleteMatch() {
    if (!confirm('确定要删除这场比赛吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        // DELETE 请求通过 URL 参数传递
        const response = await fetch(
            `${AZURE_CONFIG.apiEndpoints.deleteMatch}&id=${currentMatch.id}&teamId=${AZURE_CONFIG.teamId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (result.success) {
            alert('删除成功！');
            window.location.href = 'index.html';
        } else {
            throw new Error(result.error || '删除失败');
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
    }
}

