const { parseLogFile, parseAllLogFiles } = require('./parser');
const { analyzeLogs } = require('./analyzer');
const { logMessage } = require('./logger');

async function main(logFilePath) {
    try {
        logMessage('info', 'Starting log analysis', { filePath: logFilePath });

        const logs = await parseAllLogFiles(logFilePath);
        if (!logs || logs.length === 0) {
            logMessage('warn', 'No logs found to analyze', { filePath: logFilePath });
            return;
        }

        const analysis = analyzeLogs(logs);
        if (!analysis) {
            logMessage('error', 'Log analysis failed');
            return;
        }

        console.log('Election Visitors:');
        for (const [election, count] of Object.entries(analysis.electionVisitors)) {
            console.log(`  Election ${election}: ${count} visitors`);
        }

        console.log('Riding Visitors:');
        for (const [riding, count] of Object.entries(analysis.ridingVisitors)) {
            console.log(`  Riding ${riding}: ${count} visitors`);
        }

        logMessage('info', 'Log analysis completed successfully');
    } catch (err) {
        logMessage('error', 'Error in log analysis process', { error: err.message });
    }
}

const logFilePath = process.argv[2] || './data/vm-logs';
main(logFilePath);