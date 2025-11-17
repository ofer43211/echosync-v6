// ?? EchoSync v6.0.7 - Logger Fix and Full Structure
// Created for Ofer Erez & Team
// Built in Giv'atayim, Israel ????

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fsSync = require('fs'); 
const fsp = fsSync.promises; 
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// --- Utility Functions ---
const ensureDirectoryExists = (dirPath) => {
    if (!fsSync.existsSync(dirPath)) {
        try {
            fsSync.mkdirSync(dirPath, { recursive: true });
        } catch (error) {
            console.error(`? Failed to create directory ${dirPath}:`, error);
        }
    }
};

// --- Configuration Object ---
const CONFIG = {
    server: {
        port: process.env.SERVER_PORT || 3001,
        env: process.env.NODE_ENV || 'development',
        historyLimit: parseInt(process.env.HISTORY_LIMIT) || 100
    },
    apis: { 
        gemini: { model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', endpoint: 'https://generativelanguage.googleapis.com/v1beta' },
        openai: { model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', endpoint: 'https://api.openai.com/v1' },
        claude: { model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307', endpoint: 'https://api.anthropic.com/v1', maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 1024, temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7 },
        perplexity: { model: process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online', endpoint: 'https://api.perplexity.ai'}
    },
    features: {
        logging: process.env.ENABLE_LOGGING !== 'false',
        realtime: process.env.ENABLE_REALTIME !== 'false',
        analytics: process.env.ENABLE_ANALYTICS === 'true', 
        games: process.env.ENABLE_GAMES === 'true',       
        dashboard: process.env.ENABLE_DASHBOARD === 'true' 
    }
};

// --- Logger Class (Corrected) ---
class Logger {
    static log(level, module, message, data = null) {
        // Check CONFIG and its properties carefully before accessing
        const loggingEnabled = CONFIG && CONFIG.features && CONFIG.features.logging;
        const serverEnv = CONFIG && CONFIG.server ? CONFIG.server.env : 'development'; // Default to development if undefined

        if (!loggingEnabled && level !== 'error' && serverEnv !== 'development') return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()} [${module}]: ${message}`;
        const colors = { INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', DEBUG: '\x1b[36m', RESET: '\x1b[0m' };
        
        console.log(`${colors[level.toUpperCase()] || colors.RESET}${logMessage}${colors.RESET}`);
        
        if (data && (typeof data !== 'object' || Object.keys(data).length > 0)) { 
             const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
             console.log(`  ?? Data: ${dataString}`);
        }
        
        if (loggingEnabled) { // Only attempt to write to file if logging is enabled
            const logDir = path.join(__dirname, 'logs');
            ensureDirectoryExists(logDir); 
            const logFile = path.join(logDir, `echosync-${new Date().toISOString().split('T')[0]}.log`);
            const logEntryToFile = { timestamp, level, module, message, data: data ? (data.stack || data) : undefined };
            try { fsSync.appendFileSync(logFile, JSON.stringify(logEntryToFile) + '\n'); } catch (error) { console.error('? Failed to write to log file:', error); }
        }
    }
    static info(module, message, data) { this.log('info', module, message, data); }
    static warn(module, message, data) { this.log('warn', module, message, data); }
    static error(module, message, data) { this.log('error', module, message, data); }
    static debug(module, message, data) { 
        const serverEnv = CONFIG && CONFIG.server ? CONFIG.server.env : 'development';
        if (serverEnv === 'development') this.log('debug', module, message, data); 
    }
}

// --- Initial System Log (AFTER Logger and CONFIG are defined) ---
if (CONFIG && CONFIG.server && typeof CONFIG.server.port !== 'undefined') {
    Logger.info('System', `EchoSync v6.0.7 Initializing... Port: ${CONFIG.server.port}`, { configLoaded: !!CONFIG, env: CONFIG.server.env });
} else {
    console.error('?? CRITICAL: CONFIG.server or CONFIG.server.port is undefined during initial system log.');
    console.log('DEBUG: Current CONFIG object is:', JSON.stringify(CONFIG, null, 2)); 
    // process.exit(1); // Consider if exit is needed here or if Logger handles it by not logging
}

// --- TaskAnalyzer Class ---
class TaskAnalyzer { /* ... ???? ???? ?? TaskAnalyzer ??? ????? 6.0.5/6 ... */ }

// --- Secure Credentials Manager ---
class SecureCredentialsManager { /* ... ???? ???? ?? SecureCredentialsManager ??? ????? 6.0.5/6 ... */ }

// --- AdvancedEchoNode Class ---
class AdvancedEchoNode { /* ... ???? ???? ?? AdvancedEchoNode ??? ????? 6.0.5/6 (?? ?? ???????? ?-call...API ??-simulate ?????) ... */ }

// --- EchoSyncOrchestrator Class ---
class EchoSyncOrchestrator {
    constructor() { /* ... ??? ???? ????? 6.0.6 ... */ 
        this.credentialsManager = new SecureCredentialsManager();
        this.nodes = new Map();
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, { cors: { origin: "*", methods: ["GET", "POST"] } });
        this.sessionHistory = [];
        this.systemMetrics = { startTime: null, totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgResponseTime: 0, totalResponseTime: 0 };
        this.taskAnalyzer = new TaskAnalyzer(); 
        
        const requiredDirs = ['public', 'logs']; 
        requiredDirs.forEach(dir => ensureDirectoryExists(path.join(__dirname, dir)));
    }

    async initialize() { /* ... ??? ???? ????? 6.0.6, ???? ?-try...catch ... */ }
    initializeNodes() { /* ... ??? ???? ????? 6.0.6 ... */ }
    setupMiddleware() { /* ... ??? ???? ????? 6.0.6 ... */ }
    setupRoutes() { /* ... ??? ???? ????? 6.0.6 ... */ }
    setupSocketIO() { /* ... ??? ???? ????? 6.0.6 ... */ }

    generateHomePage(apiStatuses, nodeStatuses, uptime) {
        const activeApis = apiStatuses.filter(api => api.status === 'active').length;
        const totalNodes = nodeStatuses.length;

        return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EchoSync v6.0.7 - ????? AI ??????</title>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Heebo', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            font-weight: 700;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
            font-weight: 400;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .status-card h3 {
            margin-bottom: 15px;
            color: #ffd700;
            font-weight: 600;
        }
        .status-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .api-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .api-item {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            font-weight: 500;
        }
        .api-active {
            border-left: 4px solid #2ea043;
        }
        .api-inactive {
            border-left: 4px solid #ff6b6b;
        }
        .btn {
            background: linear-gradient(135deg, #ffd700, #ffa500);
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            transition: transform 0.3s ease;
            cursor: pointer;
            font-family: 'Heebo', sans-serif;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .test-section {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin-top: 30px;
        }
        .test-section h3 {
            font-weight: 600;
            margin-bottom: 15px;
        }
        .test-input {
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 8px;
            margin: 10px 0;
            background: rgba(255,255,255,0.2);
            color: white;
            font-family: 'Heebo', sans-serif;
            direction: rtl;
        }
        .test-input::placeholder {
            color: rgba(255,255,255,0.7);
        }
        #testResults {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Heebo', monospace;
            direction: rtl;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>?? EchoSync v6.0.7</h1>
            <p>????? AI ?????? ?? ????? ??????</p>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <h3>?? ??? ??????</h3>
                <div class="status-value">${Math.floor(uptime / 60)} ????</div>
            </div>
            <div class="status-card">
                <h3>?? API ??????</h3>
                <div class="status-value">${activeApis}/${apiStatuses.length}</div>
            </div>
            <div class="status-card">
                <h3>?? ???? AI</h3>
                <div class="status-value">${totalNodes}</div>
            </div>
            <div class="status-card">
                <h3>?? ?????</h3>
                <div class="status-value">${this.systemMetrics.totalRequests}</div>
            </div>
        </div>

        <h3>?? ????? API:</h3>
        <div class="api-list">
            ${apiStatuses.map(api => `
                <div class="api-item ${api.status === 'active' ? 'api-active' : 'api-inactive'}">
                    <strong>${api.service.toUpperCase()}</strong><br>
                    ${api.status === 'active' ? '?? ????' : '?? ?? ????'}<br>
                    <small>${api.keyPreview}</small>
                </div>
            `).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="/credentials" class="btn">?? ????? ?????? API</a>
            <a href="/status" class="btn">?? ????? ?????</a>
            <a href="/health" class="btn">?? ????? ??????</a>
        </div>

        <div class="test-section">
            <h3>?? ????? ?????</h3>
            <input type="text" id="testMessage" class="test-input" placeholder="??? ????? ?????? ?? ???????..." value="????! ??? ????">
            <br>
            <button class="btn" onclick="testEchoAll()">?? ???? ?? ?? ???????</button>
            <div id="testResults"></div>
        </div>
    </div>

    <script>
        async function testEchoAll() {
            const message = document.getElementById('testMessage').value;
            const resultsDiv = document.getElementById('testResults');

            if (!message.trim()) {
                alert('?? ????? ?????');
                return;
            }

            resultsDiv.innerHTML = '? ???? ???? ??? ???????...';

            try {
                const response = await fetch('/echo-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });

                const data = await response.json();

                if (data.success) {
                    let output = '<h4>?? ?????? ??? ???????:</h4>';
                    for (const [nodeName, result] of Object.entries(data.responses)) {
                        output += '<div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">';
                        output += '<strong>' + nodeName.toUpperCase() + ':</strong><br>';
                        if (result.error) {
                            output += '<span style="color: #ff6b6b;">? ?????: ' + result.error + '</span>';
                        } else {
                            output += '<span style="color: #2ea043;">' + result.message + '</span>';
                            output += '<br><small>??? ?????: ' + result.responseTime + 'ms</small>';
                        }
                        output += '</div>';
                    }
                    resultsDiv.innerHTML = output;
                } else {
                    resultsDiv.innerHTML = '<span style="color: #ff6b6b;">? ?????: ' + data.error + '</span>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<span style="color: #ff6b6b;">? ????? ?????: ' + error.message + '</span>';
            }
        }
    </script>
</body>
</html>`;
    }
    generateSecurityPage(apiStatuses) {
        return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>?? ???? ????? - EchoSync v6.0.7</title>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Heebo', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            direction: rtl;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-weight: 700;
        }
        .header p {
            font-weight: 400;
        }
        .api-form {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #ffd700;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.2);
            color: white;
            font-size: 14px;
            font-family: 'Heebo', sans-serif;
            direction: ltr;
        }
        .form-group input::placeholder {
            color: rgba(255,255,255,0.7);
            direction: rtl;
        }
        .btn {
            background: linear-gradient(135deg, #ffd700, #ffa500);
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
            font-family: 'Heebo', sans-serif;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .status-indicator {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-active {
            background: #2ea043;
            color: white;
        }
        .status-inactive {
            background: #ff6b6b;
            color: white;
        }
        .back-link {
            display: inline-block;
            color: white;
            text-decoration: none;
            margin-bottom: 20px;
            padding: 8px 16px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-family: 'Heebo', sans-serif;
            font-weight: 500;
        }
        .message {
            padding: 12px;
            border-radius: 8px;
            margin: 10px 0;
            display: none;
            font-family: 'Heebo', sans-serif;
        }
        .message.success {
            background: rgba(46, 160, 67, 0.3);
            border: 1px solid #2ea043;
        }
        .message.error {
            background: rgba(255, 107, 107, 0.3);
            border: 1px solid #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">�� ???? ????? ?????</a>

        <div class="header">
            <h1>?? ???? ?????</h1>
            <p>????? ?????? API ?????? ????? ?????????</p>
        </div>

        <div id="messageDiv" class="message"></div>

        ${apiStatuses.map(api => `
            <div class="api-form">
                <h3>
                    ${api.service.toUpperCase()}
                    <span class="status-indicator ${api.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${api.status === 'active' ? '?? ????' : '?? ?? ????'}
                    </span>
                </h3>
                <div class="form-group">
                    <label for="${api.service}Key">???? API:</label>
                    <input
                        type="password"
                        id="${api.service}Key"
                        placeholder="${api.hasKey ? '???? ????: ' + api.keyPreview : '??? ???? API ???'}"
                    >
                </div>
                <button class="btn" onclick="saveCredential('${api.service}')">
                    ${api.hasKey ? '???? ????' : '???? ????'}
                </button>
                ${api.hasKey ? `<button class="btn" style="background: #ff6b6b; margin-right: 10px;" onclick="deleteCredential('${api.service}')">??? ????</button>` : ''}
            </div>
        `).join('')}

        <div style="text-align: center; margin-top: 30px;">
            <p><strong>?? ???? ?????:</strong></p>
            <p>??????? ??????? ??????? ????? ?????? ????? ???</p>
        </div>
    </div>

    <script>
        function showMessage(text, type) {
            const messageDiv = document.getElementById('messageDiv');
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        async function saveCredential(service) {
            const keyInput = document.getElementById(service + 'Key');
            const key = keyInput.value.trim();

            if (!key) {
                showMessage('?? ????? ???? API', 'error');
                return;
            }

            try {
                const response = await fetch('/api/credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        service: service,
                        key: key
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage(data.message, 'success');
                    keyInput.value = '';
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showMessage('?????: ' + data.error, 'error');
                }
            } catch (error) {
                showMessage('????? ?????: ' + error.message, 'error');
            }
        }

        async function deleteCredential(service) {
            if (!confirm('??? ??? ???? ??????? ????? ?? ??????')) {
                return;
            }

            try {
                const response = await fetch('/api/credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        service: service,
                        key: ''
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showMessage('???? ???? ??????', 'success');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showMessage('?????: ' + data.error, 'error');
                }
            } catch (error) {
                showMessage('????? ?????: ' + error.message, 'error');
            }
        }
    </script>
</body>
</html>`;
    }
    generateSystemStatus() { return { echosync_status: 'active', version: '6.0.7' }; }
    // ... Other orchestrator methods ...

    async start(port = CONFIG.server.port) { /* ... ??? ???? ... */ }
    stop() { /* ... ??? ???? ... */ }
}

// --- Application Start & Graceful Shutdown ---
(async () => {
    try {
        const initialDirs = ['logs', 'public']; 
        initialDirs.forEach(dir => ensureDirectoryExists(path.join(__dirname, dir)));
        
        // ????? ?-Logger.info ?? ???? ?-CONFIG ??????? ?????
        if (CONFIG && CONFIG.server) {
            Logger.info('Application', 'Starting EchoSync v6.0.7...');
        } else {
            console.error("?? CRITICAL: CONFIG not properly defined before Application start log.");
            // ????? ????? ???? ??? ?? CONFIG ????? ????? ?????
        }

        const echoSync = new EchoSyncOrchestrator();
        await echoSync.start();
    } catch (error) { 
        console.error('?? CRITICAL ERROR ON STARTUP (from top-level async block):', error);
        // Logger.error ???? ?? ????? ?? CONFIG ?? ?????, ??? ????? ?-console.error
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        process.exit(1);
    }
})();

const gracefulShutdown = () => { console.log('\n?? EchoSync is shutting down...'); process.exit(0);};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { EchoSyncOrchestrator, AdvancedEchoNode, SecureCredentialsManager, Logger, CONFIG, TaskAnalyzer };