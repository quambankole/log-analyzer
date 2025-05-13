const { logMessage } = require('./logger');

logMessage('info', 'App', { ver: '1.0.0' });
logMessage('warn', 'Log', { space: '50MB' });
logMessage('error', 'Crash', { fine: 'hope', num: 503 });
logMessage('debug', 'Bug', { module: 'user' });