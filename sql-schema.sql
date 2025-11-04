-- ========================================
-- 赛场瞬间 - Azure SQL Database 简化版
-- ========================================

-- ========================================
-- Users 表（用户表）- 极简设计
-- ========================================
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,          -- 用户ID
    Username NVARCHAR(50) UNIQUE NOT NULL,    -- 用户名
    DisplayName NVARCHAR(100) NOT NULL,       -- 显示名称
    PasswordHash NVARCHAR(255) NOT NULL,      -- 密码（Base64或加密）
    TeamId NVARCHAR(50) DEFAULT 'basketball-club-001',  -- 团队ID
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()  -- 创建时间
);

-- ========================================
-- 插入测试数据
-- ========================================
-- 密码是 123456 的 Base64: MTIzNDU2
INSERT INTO Users (UserId, Username, DisplayName, PasswordHash, TeamId)
VALUES 
    ('user-test-001', 'test', '测试用户', 'MTIzNDU2', 'basketball-club-001');

-- ========================================
-- 常用查询
-- ========================================

-- 注册新用户（检查用户名是否存在）
-- IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'newuser')
-- BEGIN
--     INSERT INTO Users (UserId, Username, DisplayName, PasswordHash, TeamId)
--     VALUES ('user-xxx', 'newuser', '新用户', 'password_hash', 'basketball-club-001');
-- END

-- 登录验证
-- SELECT UserId, Username, DisplayName, TeamId 
-- FROM Users 
-- WHERE Username = 'test' AND PasswordHash = 'MTIzNDU2';

-- 查询所有用户
-- SELECT * FROM Users;

-- 删除用户
-- DELETE FROM Users WHERE UserId = 'user-xxx';

