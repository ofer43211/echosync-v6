
// ?? EchoSync v6.0.4 - Secure, Asynchronous, UTF-8 Corrected, Multi-AI Orchestration
// Created for Ofer Erez & Team - Focus on Stability, Security, and Functionality
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
        gemini: { 
            key: process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', 
            endpoint: 'https://generativelanguage.googleapis.com/v1beta' 
        },
        openai: { 
            key: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', 
            endpoint: 'https://api.openai.com/v1' 
        },
        claude: { 
            key: process.env.CLAUDE_API_KEY,
            model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307', 
            endpoint: 'https://api.anthropic.com/v1', 
            maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 1024, 
            temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7 
        },
        perplexity: { 
            key: process.env.PERPLEXITY_API_KEY,
            model: process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online', 
            endpoint: 'https://api.perplexity.ai'
        }
    },
    features: {
        logging: process.env.ENABLE_LOGGING !== 'false',
        realtime: process.env.ENABLE_REALTIME !== 'false'
    }
};

// --- Logger Class ---
class Logger {
    static log(level, module, message, data = null) {
        if (!CONFIG.features.logging && level !== 'error' && CONFIG.server.env !== 'development') return;
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()} [${module}]: ${message}`;
        const colors = { INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', DEBUG: '\x1b[36m', RESET: '\x1b[0m' };
        console.log(`${colors[level.toUpperCase()] || colors.RESET}${logMessage}${colors.RESET}`);
        if (data && (typeof data !== 'object' || Object.keys(data).length > 0)) { 
             const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
             console.log(`  ?? Data: ${dataString}`);
        }
        const logDir = path.join(__dirname, 'logs');
        ensureDirectoryExists(logDir); 
        const logFile = path.join(logDir, `echosync-${new Date().toISOString().split('T')[0]}.log`);
        const logEntryToFile = { timestamp, level, module, message, data: data ? (data.stack || data) : undefined };
        try { fsSync.appendFileSync(logFile, JSON.stringify(logEntryToFile) + '\n'); } catch (error) { console.error('? Failed to write to log file:', error); }
    }
    static info(module, message, data) { this.log('info', module, message, data); }
    static warn(module, message, data) { this.log('warn', module, message, data); }
    static error(module, message, data) { this.log('error', module, message, data); }
    static debug(module, message, data) { if (CONFIG.server.env === 'development') this.log('debug', module, message, data); }
}

Logger.info('System', `EchoSync v6.0.4 Initializing... Port: ${CONFIG.server.port}`, { configLoaded: !!CONFIG, env: CONFIG.server.env });

// --- TaskAnalyzer Class ---
class TaskAnalyzer {
    constructor() {
        this.patterns = {
            creative: ['???', '???', '?????', '????', '????', '???', '?????'],
            analytical: ['???', '?????', '????', '????', '?????????', '??????'],
            conversational: ['????', '???', '??', '????', '?????'],
            technical: ['???', '?????????', 'API', '????', '????', '????????']
        };
        this.influenceHistory = new Map();
        Logger.debug('TaskAnalyzer', 'TaskAnalyzer initialized.');
    }
    
    analyzeTask(message, context = {}) {
        const analysis = {
            primaryType: 'general',
            confidence: 0.5,
            suggestedAgents: ['gpt', 'claude'],
            taskComplexity: 1,
            urgency: 'normal',
            estimatedDuration: 'medium',
            adaptiveScore: 0.5
        };
        
        const lowerMessage = message.toLowerCase();
        
        for (const [type, patterns] of Object.entries(this.patterns)) {
            const matches = patterns.filter(pattern => lowerMessage.includes(pattern));
            if (matches.length > 0) {
                analysis.primaryType = type;
                analysis.confidence = Math.min(0.9, 0.3 + (matches.length * 0.2));
                break;
            }
        }
        
        switch (analysis.primaryType) {
            case 'creative':
                analysis.suggestedAgents = ['gpt', 'claude', 'gemini'];
                break;
            case 'analytical':
                analysis.suggestedAgents = ['claude', 'perplexity'];
                break;
            case 'technical':
                analysis.suggestedAgents = ['gpt', 'claude'];
                break;
            default:
                analysis.suggestedAgents = ['gpt', 'gemini'];
        }
        
        return analysis;
    }
    
    calculateAdaptiveScore(suggestedAgents) { return 0.5; }
    updateInfluenceHistory(agentKey, rating, context = '') {
        if (!this.influenceHistory.has(agentKey)) {
            this.influenceHistory.set(agentKey, []);
        }
        this.influenceHistory.get(agentKey).push({ rating, context, timestamp: Date.now() });
    }
}

// --- Secure Credentials Manager ---
class SecureCredentialsManager {
    constructor() {
        this.credentialsFile = path.join(__dirname, 'encrypted_credentials.json');
        this.encryptionKeyPath = path.join(__dirname, '.encryption_key');
        this.encryptionKey = this._generateOrLoadEncryptionKey();
        this.credentials = new Map();
        this.initialized = false;
        Logger.info('SecureCredentialsManager', 'Instance created.');
    }
    
    _generateOrLoadEncryptionKey() {
        if (fsSync.existsSync(this.encryptionKeyPath)) {
            try {
                return fsSync.readFileSync(this.encryptionKeyPath, 'utf8').trim();
            } catch (error) {
                Logger.warn('SecureCredentialsManager', 'Failed to load encryption key, generating new one');
            }
        }
        
        const newKey = crypto.randomBytes(32).toString('hex');
        try {
            fsSync.writeFileSync(this.encryptionKeyPath, newKey);
            Logger.info('SecureCredentialsManager', 'New encryption key generated and saved');
        } catch (error) {
            Logger.error('SecureCredentialsManager', 'Failed to save encryption key', error);
        }
        return newKey;
    }
    
    encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            Logger.error('SecureCredentialsManager', 'Encryption failed', error);
            return null;
        }
    }
    
    decrypt(encryptedText) {
        try {
            const parts = String(encryptedText).split(':');
            if (parts.length < 2) return null;
            
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedData = parts[1];
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            Logger.error('SecureCredentialsManager', 'Decryption failed', error);
            return null;
        }
    }
    
    async loadCredentials() {
        Logger.info('SecureCredentialsManager', 'Loading credentials...');
        
        // Load from .env file first
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            claude: process.env.CLAUDE_API_KEY,
            gemini: process.env.GEMINI_API_KEY,
            perplexity: process.env.PERPLEXITY_API_KEY
        };
        
        for (const [service, key] of Object.entries(envKeys)) {
            if (key && key.trim() !== '') {
                this.credentials.set(service, key.trim());
                Logger.info('SecureCredentialsManager', `Loaded ${service} key from .env`);
            }
        }
        
        // Try to load from encrypted file as well
        try {
            if (fsSync.existsSync(this.credentialsFile)) {
                const encryptedData = await fsp.readFile(this.credentialsFile, 'utf8');
                const data = JSON.parse(encryptedData);
                
                for (const [service, encryptedKey] of Object.entries(data)) {
                    const decryptedKey = this.decrypt(encryptedKey);
                    if (decryptedKey && !this.credentials.has(service.toLowerCase())) {
                        this.credentials.set(service.toLowerCase(), decryptedKey);
                        Logger.info('SecureCredentialsManager', `Loaded ${service} key from encrypted file`);
                    }
                }
            }
        } catch (error) {
            Logger.error('SecureCredentialsManager', 'Failed to load encrypted credentials', error);
        }
        
        this.initialized = true;
        Logger.info('SecureCredentialsManager', `Credentials manager initialized with ${this.credentials.size} keys`);
    }
    
    async saveCredentials() {
        try {
            const dataToSave = {};
            for (const [service, key] of this.credentials.entries()) {
                const encrypted = this.encrypt(key);
                if (encrypted) {
                    dataToSave[service] = encrypted;
                }
            }
            
            await fsp.writeFile(this.credentialsFile, JSON.stringify(dataToSave, null, 2));
            Logger.info('SecureCredentialsManager', 'Credentials saved successfully');
            return true;
        } catch (error) {
            Logger.error('SecureCredentialsManager', 'Failed to save credentials', error);
            return false;
        }
    }
    
    async setCredential(service, key) {
        if (!this.initialized) await this.loadCredentials();
        
        const serviceLower = String(service).toLowerCase();
        if (!key || String(key).trim() === '') {
            this.credentials.delete(serviceLower);
            Logger.info('SecureCredentialsManager', `Credential for ${serviceLower} removed.`);
        } else {
            this.credentials.set(serviceLower, String(key).trim());
            Logger.info('SecureCredentialsManager', `Credential for ${serviceLower} set/updated.`);
        }
        
        return await this.saveCredentials();
    }
    
    getCredential(service) { 
        return this.credentials.get(String(service).toLowerCase()) || null; 
    }
    
    hasCredential(service) { 
        const key = this.credentials.get(String(service).toLowerCase()); 
        return !!key && key !== ''; 
    }
    
    getStatus() { 
        const services = ['gemini', 'openai', 'claude', 'perplexity'];
        return services.map(s => {
            const key = this.getCredential(s);
            return { 
                service: s, 
                status: key ? 'active' : 'missing', 
                hasKey: !!key, 
                keyPreview: key ? `${key.substring(0,4)}...${key.substring(key.length-4)}` : '?? ?????'
            };
        });
    }
}

// --- AdvancedEchoNode Class ---
class AdvancedEchoNode {
    constructor(name, apiType = 'simulation') {
        this.name = name; 
        this.apiType = apiType; 
        this.personalPrompt = ''; 
        this.mood = 'neutral'; 
        this.specializations = [];
        this.metrics = { 
            totalCalls: 0, 
            successfulCalls: 0, 
            failedCalls: 0, 
            avgResponseTime: 0, 
            lastUsed: null, 
            totalResponseTime: 0 
        };
        this.conversationHistory = []; 
        this.socketIO = null;
        Logger.info('AdvancedEchoNode', `${this.name} initialized as ${this.apiType}.`);
    }
    
    setPersonalPrompt(prompt) { this.personalPrompt = prompt; }
    setSocketIO(io) { this.socketIO = io; }
    
    async send(message, context = {}, credentialsManager) {
        const startTime = Date.now();
        this.metrics.totalCalls++;
        this.metrics.lastUsed = new Date().toISOString();
        
        let response = '';
        let success = false;
        
        try {
            response = await this.callModel(message, context, credentialsManager);
            this.metrics.successfulCalls++;
            success = true;
        } catch (error) {
            Logger.error('AdvancedEchoNode', `Error in send for ${this.name}`, error);
            this.metrics.failedCalls++;
            response = `? ${this.name}: ????? - ${error.message}`;
        }
        
        const responseTime = Date.now() - startTime;
        this.metrics.totalResponseTime += responseTime;
        this.metrics.avgResponseTime = this.metrics.successfulCalls > 0 ? 
            this.metrics.totalResponseTime / this.metrics.successfulCalls : responseTime;
        
        return {
            message: response,
            timestamp: new Date().toISOString(),
            apiType: this.apiType,
            responseTime,
            mood: this.mood,
            nodeId: this.name,
            success
        };
    }
    
    async callModel(message, context, credentialsManager) {
        const effectiveApiType = credentialsManager.hasCredential(this.apiType) ? this.apiType : 'simulation';
        Logger.debug('AdvancedEchoNode', `Effective API type for ${this.name}: ${effectiveApiType}`);
        const apiKey = credentialsManager.getCredential(effectiveApiType);

        switch (effectiveApiType) {
            case 'gemini':
                return await this.callGemini(message, context, apiKey);
            case 'openai':
                return await this.callOpenAI(message, context, apiKey);
            case 'claude':
                return await this.callClaude(message, context, apiKey);
            case 'perplexity':
                return await this.callPerplexity(message, context, apiKey);
            default:
                return await this.simulate(message, context, `No API key for '${this.apiType}' or type '${effectiveApiType}' not supported`);
        }
    }
    
    async callGemini(message, context, apiKey) {
        if (!apiKey) return this.simulate(message, context, "Gemini key missing");
        
        try {
            const response = await axios.post(
                `${CONFIG.apis.gemini.endpoint}/models/${CONFIG.apis.gemini.model}:generateContent?key=${apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `${this.personalPrompt}\n${message}`
                        }]
                    }]
                },
                { timeout: 20000 }
            );
            
            return `?? ${this.name} (Gemini): ${response.data.candidates[0].content.parts[0].text}`;
        } catch (error) {
            Logger.error('GeminiAPI', error.message);
            throw error;
        }
    }
    
    async callOpenAI(message, context, apiKey) {
        if (!apiKey) return this.simulate(message, context, "OpenAI key missing");
        
        try {
            const response = await axios.post(
                `${CONFIG.apis.openai.endpoint}/chat/completions`,
                {
                    model: CONFIG.apis.openai.model,
                    messages: [
                        { role: 'system', content: this.personalPrompt },
                        { role: 'user', content: message }
                    ]
                },
                {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    timeout: 20000
                }
            );
            
            return `?? ${this.name} (OpenAI): ${response.data.choices[0].message.content}`;
        } catch (error) {
            Logger.error('OpenAIAPI', error.message);
            throw error;
        }
    }
    
    async callClaude(message, context, apiKey) {
        if (!apiKey) return this.simulate(message, context, "Claude key missing");
        
        try {
            const response = await axios.post(
                `${CONFIG.apis.claude.endpoint}/messages`,
                {
                    model: CONFIG.apis.claude.model,
                    max_tokens: CONFIG.apis.claude.maxTokens,
                    messages: [{ role: 'user', content: message }],
                    system: this.personalPrompt
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    timeout: 25000
                }
            );
            
            return `?? ${this.name} (Claude): ${response.data.content[0].text}`;
        } catch (error) {
            Logger.error('ClaudeAPI', error.message);
            throw error;
        }
    }
    
    async callPerplexity(message, context, apiKey) {
        if (!apiKey) return this.simulate(message, context, "Perplexity key missing");
        
        try {
            const response = await axios.post(
                `${CONFIG.apis.perplexity.endpoint}/chat/completions`,
                {
                    model: CONFIG.apis.perplexity.model,
                    messages: [
                        { role: 'system', content: this.personalPrompt },
                        { role: 'user', content: message }
                    ]
                },
                {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    timeout: 25000
                }
            );
            
            return `?? ${this.name} (Perplexity): ${response.data.choices[0].message.content}`;
        } catch (error) {
            Logger.error('PerplexityAPI', error.message);
            throw error;
        }
    }
    
    async simulate(message, context, reason = "Simulation mode") {
        await new Promise(r => setTimeout(r, 100 + Math.random() * 100));
        const responses = [
            `??? ???? ?? ????? ???: "${String(message).substring(0, 30)}..."`,
            `?? ???? ???????! ???? ???? ?? ?? ???.`,
            `??? ??? ????? ?? ??: "${String(message).substring(0, 25)}..."`,
            `???? ?? ?????! ?? ???? ????.`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return `?? ${this.name} (???????? - ${reason}): ${randomResponse}`;
    }
    
    getStatus() { 
        return { 
            name: this.name, 
            apiType: this.apiType, 
            mood: this.mood, 
            metrics: this.metrics 
        }; 
    }
    
    getNodeEmoji() { 
        const emojis = { 
            'GPT-רמי': '??', 
            'קלוד-עסקים': '??', 
            'גמיני-רכז': '??', 
            'פרפלקסיטי-חוקר': '??'
        }; 
        return emojis[this.name] || '??'; 
    }
}

// --- EchoSyncOrchestrator Class ---
class EchoSyncOrchestrator {
    constructor() {
        this.credentialsManager = new SecureCredentialsManager();
        this.nodes = new Map();
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, { cors: { origin: "*", methods: ["GET", "POST"] } });
        this.sessionHistory = [];
        this.systemMetrics = { 
            startTime: null, 
            totalRequests: 0, 
            successfulRequests: 0, 
            failedRequests: 0, 
            avgResponseTime: 0, 
            totalResponseTime: 0 
        };
        this.taskAnalyzer = new TaskAnalyzer(); 
        
        const requiredDirs = ['public', 'logs']; 
        requiredDirs.forEach(dir => ensureDirectoryExists(path.join(__dirname, dir)));
    }

    async initialize() {
        Logger.info('Orchestrator', 'Starting asynchronous initialization...');
        await this.credentialsManager.loadCredentials();
        Logger.info('Orchestrator', '? SecureCredentialsManager initialized!');
        this.systemMetrics.startTime = new Date();

        const apiStatusLog = this.credentialsManager.getStatus();
        Logger.info('Orchestrator', '?? Initial API Status from SecureCredentialsManager:');
        apiStatusLog.forEach(({service, status, keyPreview}) => {
            const icon = status === 'active' ? '??' : '??';
            Logger.info('Orchestrator', `   ${service.padEnd(12)}: ${icon} ${status.padEnd(10)} (${keyPreview})`);
        });

        this.initializeNodes();
        this.setupMiddleware();
        this.setupRoutes();
        if (CONFIG.features.realtime) { this.setupSocketIO(); }
        
        Logger.info('EchoOrchestrator', `EchoSync v6.0.4 fully initialized. Env: ${CONFIG.server.env}`);
    }

    initializeNodes() {
        Logger.info('Orchestrator', 'Initializing AI Nodes...');
        const nodeTemplates = [
            { key: 'gpt', name: 'GPT-רמי', apiType: 'openai', prompt: '??? GPT-רמי, ????? ??????, ????? ????????? ????? ?????.' },
            { key: 'claude', name: 'קלוד-עסקים', apiType: 'claude', prompt: '??? קלוד-עסקים, ???? ???? ??????? ?????.' },
            { key: 'gemini', name: 'גמיני-רכז', apiType: 'gemini', prompt: '??? גמיני-רכז, ???? ?????? ?????.' },
            { key: 'perplexity', name: 'פרפלקסיטי-חוקר', apiType: 'perplexity', prompt: '??? פרפלקסיטי-חוקר, ???? ????? ????? ???? ?????.' }
        ];
        
        nodeTemplates.forEach(t => {
            const effectiveApiType = this.credentialsManager.hasCredential(t.apiType) ? t.apiType : 'simulation';
            const node = new AdvancedEchoNode(t.name, effectiveApiType); 
            node.setPersonalPrompt(t.prompt);
            if (CONFIG.features.realtime && this.io) node.setSocketIO(this.io);
            this.nodes.set(t.key, node);
        });
        Logger.info('EchoOrchestrator', `${this.nodes.size} nodes configured.`);
    }
    
    setupMiddleware() {
        Logger.info('Orchestrator', 'Setting up middleware...');
        this.app.use(express.json({limit: '10mb'}));
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); 
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');
            if (req.method === 'OPTIONS') return res.sendStatus(200);
            next(); 
        });
        
        this.app.use((req, res, next) => {
            const startReqTime = Date.now();
            req.sessionId = req.headers['x-session-id'] || `anon-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
            Logger.debug('HTTP', `${req.method} ${req.path} started`, {ip: req.ip, sid: req.sessionId}); 
            res.on('finish', () => {
                Logger.info('HTTP', `${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - startReqTime}ms)`, {ip: req.ip, sid: req.sessionId});
            });
            next(); 
        });
        Logger.info('Orchestrator', 'Middleware setup complete.');
    }
    
    setupRoutes() {
        Logger.info('Orchestrator', 'Setting up routes...');
        
        this.app.get('/', (req, res) => {
            try {
                const apiStatuses = this.credentialsManager.getStatus();
                const nodeStatuses = Array.from(this.nodes.values()).map(node => node.getStatus());
                const uptime = this.systemMetrics.startTime ? Math.floor((Date.now() - this.systemMetrics.startTime) / 1000) : 0;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.send(this.generateHomePage(apiStatuses, nodeStatuses, uptime));
            } catch (e) { 
                Logger.error("Route '/'", "Error generating homepage", e); 
                res.status(500).send("????? ?????? ?? ????");
            }
        });

        this.app.get('/credentials', (req, res) => {
            try {
                const apiStatuses = this.credentialsManager.getStatus();
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.send(this.generateSecurityPage(apiStatuses));
            } catch (e) { 
                Logger.error("Route '/credentials'", "Error generating security page", e); 
                res.status(500).send("????? ?????? ?? ?????");
            }
        });
        
        this.app.post('/api/credentials', async (req, res) => {
            const { service, key } = req.body;
            Logger.info('Route /api/credentials', `Attempting to set/remove key for ${service}`);
            if (!service) return res.status(400).json({ success: false, error: 'Service name required' });
            
            try {
                const success = await this.credentialsManager.setCredential(service, key);
                if (success) {
                    this.nodes.forEach(node => {
                        if (node.apiType === service || (node.apiType === 'simulation' && this.credentialsManager.hasCredential(service))) {
                             node.apiType = this.credentialsManager.hasCredential(service) ? service : 'simulation';
                             Logger.info('Orchestrator', `Node ${node.name} apiType updated to ${node.apiType} after credential change for ${service}.`);
                        }
                    });
                    
                    if (this.io && CONFIG.features.realtime) { 
                        this.io.emit('system_status_update', this.generateSystemStatus());
                    }
                    res.json({ success: true, message: `???? ${service} ?????`, hasKey: this.credentialsManager.hasCredential(service) });
                } else { 
                    res.status(500).json({ success: false, error: 'Failed to save credentials' }); 
                }
            } catch (error) { 
                Logger.error("Route /api/credentials", "Error setting credential", error); 
                res.status(500).json({ success: false, error: error.message }); 
            }
        });
        
        this.app.get('/api/credentials/status', (req, res) => {
             if (!this.credentialsManager.initialized) return res.status(503).json({success: false, error: "Credentials not loaded yet"});
             res.json({ success: true, credentials: this.credentialsManager.getStatus() });
        });
        
        this.app.get('/status', (req, res) => res.json(this.generateSystemStatus()));
        this.app.get('/health', (req, res) => res.json(this.generateSystemHealthData()));
        
        this.app.post('/echo-all', async (req, res) => {
            Logger.info('EchoOrchestrator', '>>> /echo-all RAW HIT <<<', { body: req.body });
            
            try {
                const { message, nodes = 'all', context = {} } = req.body;
                
                if (!message || typeof message !== 'string' || message.trim() === '') {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Message is required' 
                    });
                }
                
                const taskAnalysis = this.taskAnalyzer.analyzeTask(message, context);
                let agentKeysToUse;
                
                if (nodes === 'all') {
                    agentKeysToUse = Array.from(this.nodes.keys());
                } else if (Array.isArray(nodes)) {
                    agentKeysToUse = nodes.filter(key => this.nodes.has(key));
                } else if (this.nodes.has(nodes)) {
                    agentKeysToUse = [nodes];
                } else {
                    agentKeysToUse = Array.from(this.nodes.keys());
                }

                const results = {};
                const promises = agentKeysToUse.map(key => {
                    const node = this.nodes.get(key);
                    if (node) {
                        return node.send(message, { taskAnalysis, _requester: 'echo-all' }, this.credentialsManager)
                            .then(response => { 
                                results[key] = response; 
                            })
                            .catch(e => { 
                                results[key] = { 
                                    error: e.message, 
                                    timestamp: new Date().toISOString()
                                }; 
                                Logger.error('EchoAll', `Node ${key} error`, e); 
                            });
                    }
                    return Promise.resolve();
                });
                
                await Promise.all(promises);
                
                this.systemMetrics.totalRequests++;
                this.systemMetrics.successfulRequests++;
                
                res.json({ 
                    success: true, 
                    message, 
                    taskAnalysis, 
                    responses: results, 
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.systemMetrics.failedRequests++;
                Logger.error('EchoOrchestrator', '/echo-all critical error', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Server error: ' + error.message 
                });
            }
        });
        
        Logger.info('Orchestrator', 'Routes setup complete.');
    }
    
    setupSocketIO() { 
        Logger.info('SocketIO', 'Setting up Socket.IO...');
        
        this.io.on('connection', (socket) => {
            Logger.info('SocketIO', `Client connected: ${socket.id}`);
            
            socket.emit('system_status', this.generateSystemStatus());
            
            socket.on('disconnect', () => {
                Logger.info('SocketIO', `Client disconnected: ${socket.id}`);
            });
            
            socket.on('get_status', () => {
                socket.emit('system_status', this.generateSystemStatus());
            });
        });
        
        Logger.info('SocketIO', 'Socket.IO setup complete and listening.'); 
    }

    generateHomePage(apiStatuses, nodeStatuses, uptime) { 
        const activeApis = apiStatuses.filter(api => api.status === 'active').length;
        const totalNodes = nodeStatuses.length;
        
        return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EchoSync v6.0.4 - ????? AI ??????</title>
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
            <h1>?? EchoSync v6.0.4</h1>
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
    <title>?? ???? ????? - EchoSync v6.0.4</title>
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

    generateSystemStatus() { 
        return { 
            echosync_status: 'active', 
            version: '6.0.4',
            uptime: this.systemMetrics.startTime ? 
                Math.floor((Date.now() - this.systemMetrics.startTime) / 1000) : 0,
            nodes: Array.from(this.nodes.values()).map(node => node.getStatus()),
            apis: this.credentialsManager.getStatus()
        }; 
    }
    
    generateSystemHealthData() { 
        const uptime = this.systemMetrics.startTime ? 
            Math.floor((Date.now() - this.systemMetrics.startTime) / 1000) : 0;
        
        return {
            status: 'healthy',
            version: '6.0.4',
            uptime: uptime,
            metrics: this.systemMetrics,
            nodes: this.nodes.size,
            credentials: this.credentialsManager.getStatus().filter(c => c.status === 'active').length
        }; 
    }

    async start(port = CONFIG.server.port) {
        try {
            await this.initialize();
            this.server.listen(port, () => {
                Logger.info('EchoOrchestrator', `?? EchoSync v6.0.4 Server running on port ${port}`);
                Logger.info('EchoOrchestrator', `?? Homepage: http://localhost:${port}/`);
                Logger.info('EchoOrchestrator', `?? Security Center: http://localhost:${port}/credentials`);
                Logger.info('EchoOrchestrator', `?? API Endpoint: POST http://localhost:${port}/echo-all`);
            });
        } catch (error) {
            Logger.error('Orchestrator', 'Failed to start EchoSync Orchestrator', error);
            process.exit(1);
        }
    }
    
    stop() { 
        if (this.server) { 
            this.server.close(() => Logger.info('Orchestrator', 'EchoSync server stopped.')); 
        } 
    }
}

// --- Application Start ---
(async () => {
    try {
        const initialDirs = ['logs', 'public']; 
        initialDirs.forEach(dir => ensureDirectoryExists(path.join(__dirname, dir)));
        Logger.info('Application', 'Starting EchoSync v6.0.4...');
        const echoSync = new EchoSyncOrchestrator();
        await echoSync.start();
    } catch (error) {
        console.error('?? CRITICAL ERROR ON STARTUP:', error);
        Logger.error('Application', 'CRITICAL: Failed to start EchoSync Orchestrator', { message: error.message, stack: error.stack });
        process.exit(1);
    }
})();

// Graceful shutdown
const gracefulShutdown = () => { 
    console.log('\n?? EchoSync is shutting down...'); 
    process.exit(0);
}; 
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { EchoSyncOrchestrator, AdvancedEchoNode, SecureCredentialsManager, Logger, CONFIG, TaskAnalyzer };

