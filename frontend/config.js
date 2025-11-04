 
const AZURE_CONFIG = {
    //  
    teamId: 'basketball-club-001',
    teamName: 'XXX',
    
     storage: {
        accountName: 'sports1357',  
        containerNames: {
            videos: 'match-videos',
            thumbnails: 'thumbnails',
            tactics: 'tactics'
        },
        // Blob Storage URL会在部署后自动生成
        getBlobUrl: function(containerName, blobName) {
            return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
        }
    },
    
    
    
    // Logic Apps API端点
    
    apiEndpoints: {
        // 用户相关
        registerUser: 'https://prod-05.francecentral.logic.azure.com:443/workflows/d4fec34ecdc947f7bc99666ae3e766ca/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=pGPmns0zOHpOexkvdDP_6g_9E4FrpnSlJiOyDKqJ9uQ',
        loginUser: 'https://prod-04.francecentral.logic.azure.com:443/workflows/25a379102d15477183031c2ae9469475/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=olXIvsNpGO5NQN2C2JVjFkuxWQst6HbaUBrThr72WNs',
        
        // 比赛相关
        uploadMatch: 'https://prod-14.francecentral.logic.azure.com:443/workflows/c7a229d6a2d64cee905b8336356c4207/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=xL4fyTVESTSqpH_x1Y5EQ3gkPpQ1e_SBZZLGeZZMdXM',        
        getMatches: 'https://prod-06.francecentral.logic.azure.com:443/workflows/0dce47db0ccd49e7bb4497e09cfe5161/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=mY4rXUDaTcybfqeu4iqSytZz1oObyVWAQJZo-SQDc-g',
        getMatchById: 'https://prod-06.francecentral.logic.azure.com:443/workflows/3709d717818f43b282cef4565ef6d3be/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=2IQTFc-OohfebYc5WT1ls7LcgIpsGu0mTMCAoZrjkZc',
        updateMatch: 'https://prod-04.francecentral.logic.azure.com:443/workflows/fbfe3e3645304450a6e0afe5bff853f6/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=64yHJaf9Ge1GJX4_8_w6kr-AydN8oOWfbiYlpXQ-0PA',
        deleteMatch: 'https://prod-18.francecentral.logic.azure.com:443/workflows/b97ad4e03ee745a58aae2d71438ababb/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=874qrSOv-YcQiPBd8m8YxuDzzYUtcB6L6JcZFcVmgmw',
        
        // 战术标注相关
        createAnnotation: 'https://prod-02.francecentral.logic.azure.com:443/workflows/5b4e3650cdd34f6fbcf0c7bc5f779b6d/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=73iNRkkxZhPbFRzGqBJds98lmsAwMaZM47jV0TRIe3k',
        getAnnotations: 'https://prod-21.francecentral.logic.azure.com:443/workflows/af3dd20152ad4cf682d6846dfad4f79d/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=HNsIL9asUr5TWFowgO7RphGU8415UOWBviWVsvNdLl8',
         
        // 评论相关
        addComment: 'https://prod-02.francecentral.logic.azure.com:443/workflows/41cb98b85464458fb45532f15c957282/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=Ozz9UT9rvoWLfm8AdzUSyTtRTwTymynXpJDHKWllu8A',
        getComments: 'https://prod-11.francecentral.logic.azure.com:443/workflows/9175f82b0cb24d089b8e881c085f9970/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=Is13dv1lHm8qkcmZR_1XpQHdDj8e1HkZbpPGsgUgCUI',
    },
    
    // 用户信息（实际应用中应该从登录系统获取）
    currentUser: {
        userId: 'user-001',
        userName: '未登录',
        role: 'member'
    },
    
    // 应用配置
    app: {
        maxVideoSize: 100 * 1024 * 1024, // 100MB
        maxThumbnailSize: 5 * 1024 * 1024, // 5MB
        supportedVideoFormats: ['video/mp4', 'video/webm', 'video/ogg'],
        supportedImageFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
};

// 导出配置（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AZURE_CONFIG;
}

