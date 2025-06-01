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
        // --->>> ???? ??? ?? ?? ??? ?-HTML ?? generateHomePage ????? 6.0.5 (?? Unicode escapes ?????? Heebo) <<<---
        // ?? ???? ?????? ?- const liveAPIs = apiStatuses.filter...
        // ??????? ?- </script></body></html>`;
        Logger.debug('Orchestrator', 'Generating HomePage HTML...');
        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&display=swap" rel="stylesheet"><title>EchoSync v6.0.7</title><style>body{font-family:'Heebo',Arial,sans-serif;}</style></head><body><h1>EchoSync v6.0.7 - \u05D3\u05E3 \u05D4\u05D1\u05D9\u05EA (\u05E0\u05D0 \u05DC\u05D4\u05E9\u05DC\u05D9\u05DD \u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D6\u05D5)</h1><p><a href="/credentials">\u05E0\u05D4\u05DC \u05DE\u05E4\u05EA\u05D7\u05D5\u05EA</a></p></body></html>`;
    }
    generateSecurityPage(apiStatuses) { 
        // --->>> ???? ??? ?? ?? ??? ?-HTML ?? generateSecurityPage ????? 6.0.5 (?? Unicode escapes ?????? Heebo) <<<---
        Logger.debug('Orchestrator', 'Generating SecurityPage HTML...');
        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&display=swap" rel="stylesheet"><title>EchoSync v6.0.7 - Security</title><style>body{font-family:'Heebo',Arial,sans-serif;}</style></head><body><h1>\u05DE\u05E8\u05DB\u05D6 \u05D0\u05D1\u05D8\u05D7\u05D4 (\u05E0\u05D0 \u05DC\u05D4\u05E9\u05DC\u05D9\u05DD \u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D6\u05D5)</h1></body></html>`;
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