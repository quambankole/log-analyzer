const pino = require('pino');
const pinoLoki = require('pino-loki');

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-loki',
        options: {
            host: 'https://logs-prod-018.grafana.net', 
            basicAuth: '',
            labels: { app: 'log-analyzer', job: 'js-app' },
            interval: 5,                    
            timeout: 2000,                 
            silenceErrors: false           
        }
    }
});

function logMessage(level, message, extra = {}) {
    try {
        logger[level](message, extra);
        const formattedExtra = Object.keys(extra).length > 0 ? JSON.stringify(extra) : '';
        console.log(`[${level.toUpperCase()}] ${message} ${formattedExtra}`);
    } catch (error) {
        console.error(`[LOG ERROR] Failed to send log: ${error.message}`);
    }
}

module.exports = { logMessage };