// ========================================
// Application Insights 监控配置
// ========================================

// 配置说明：
// 1. 在 Azure 创建 Application Insights 资源
// 2. 复制 "连接字符串" 或 "Instrumentation Key"
// 3. 替换下面的 YOUR_CONNECTION_STRING

const APPINSIGHTS_CONFIG = {
    // 使用 Instrumentation Key
    instrumentationKey: 'b86132f4-262b-4a38-acf1-2dfa2ada6256'
};

// 初始化 Application Insights（使用 CDN）
(function() {
    // 如果没有配置，跳过初始化
    if (!APPINSIGHTS_CONFIG.instrumentationKey || APPINSIGHTS_CONFIG.instrumentationKey === 'YOUR_INSTRUMENTATION_KEY') {
        console.log('Application Insights 未配置，跳过初始化');
        return;
    }
    
    var sdkInstance = "appInsightsSDK";
    window[sdkInstance] = "appInsights";
    
    var aiName = window[sdkInstance];
    var aisdk = window[aiName] || function(e) {
        function n(e) {
            i[e] = function() {
                var n = arguments;
                i.queue.push(function() {
                    i[e].apply(i, n)
                })
            }
        }
        var i = {
            config: e
        };
        i.initialize = !0;
        var a = document,
            t = window;
        setTimeout(function() {
            var n = a.createElement("script");
            n.src = e.url || "https://az416426.vo.msecnd.net/scripts/b/ai.2.min.js";
            a.getElementsByTagName("script")[0].parentNode.appendChild(n)
        });
        try {
            i.cookie = a.cookie
        } catch (e) {}
        i.queue = [];
        i.version = 2;
        for (var r = ["Event", "PageView", "Exception", "Trace", "DependencyData", "Metric", "PageViewPerformance"]; r.length;) n("track" + r.pop());
        n("startTrackPage");
        n("stopTrackPage");
        var s = "Track" + r[0];
        if (n("start" + s), n("stop" + s), n("setAuthenticatedUserContext"), n("clearAuthenticatedUserContext"), n("flush"), !(!0 === e.disableExceptionTracking || e.extensionConfig && e.extensionConfig.ApplicationInsightsAnalytics && !0 === e.extensionConfig.ApplicationInsightsAnalytics.disableExceptionTracking)) {
            n("_" + (r = "onerror"));
            var o = t[r];
            t[r] = function(e, n, a, t, s) {
                var c = o && o(e, n, a, t, s);
                return !0 !== c && i["_" + r]({
                    message: e,
                    url: n,
                    lineNumber: a,
                    columnNumber: t,
                    error: s
                }), c
            }, e.autoExceptionInstrumented = !0
        }
        return i
    }({
        instrumentationKey: APPINSIGHTS_CONFIG.instrumentationKey
    });
    
    window[aiName] = aisdk;
    aisdk.queue && 0 === aisdk.queue.length && aisdk.trackPageView({});
})();

// ========================================
// 自定义跟踪事件（可选）
// ========================================

// 跟踪用户登录
function trackUserLogin(userId, username) {
    if (window.appInsights) {
        window.appInsights.setAuthenticatedUserContext(userId);
        window.appInsights.trackEvent({
            name: 'UserLogin',
            properties: {
                username: username,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// 跟踪比赛上传
function trackMatchUpload(matchId, videoSize) {
    if (window.appInsights) {
        window.appInsights.trackEvent({
            name: 'MatchUpload',
            properties: {
                matchId: matchId,
                videoSize: videoSize,
                timestamp: new Date().toISOString()
            },
            measurements: {
                videoSizeMB: videoSize / 1024 / 1024
            }
        });
    }
}

// 跟踪战术标注创建
function trackAnnotationCreate(annotationId, matchId) {
    if (window.appInsights) {
        window.appInsights.trackEvent({
            name: 'AnnotationCreate',
            properties: {
                annotationId: annotationId,
                matchId: matchId,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// 跟踪评论添加
function trackCommentAdd(commentId, matchId) {
    if (window.appInsights) {
        window.appInsights.trackEvent({
            name: 'CommentAdd',
            properties: {
                commentId: commentId,
                matchId: matchId,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// 跟踪页面性能
function trackPagePerformance(pageName) {
    if (window.appInsights) {
        window.appInsights.trackPageView({
            name: pageName,
            properties: {
                timestamp: new Date().toISOString()
            }
        });
    }
}

// 导出函数供其他脚本使用
if (typeof window !== 'undefined') {
    window.AppInsightsTracking = {
        trackUserLogin: trackUserLogin,
        trackMatchUpload: trackMatchUpload,
        trackAnnotationCreate: trackAnnotationCreate,
        trackCommentAdd: trackCommentAdd,
        trackPagePerformance: trackPagePerformance
    };
}

