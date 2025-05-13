const pino = require('pino');
const pinoLoki = require('pino-loki');

require('dotenv').config();

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-loki',
        options: {
            host: process.env.LOKI_HOST,
            basicAuth: {
				username: process.env.LOKI_AUTH_USERNAME,
				password: process.env.LOKI_AUTH_PASSWORD,
			},
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
