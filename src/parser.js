const fs = require('fs');
const readline = require('readline');
const dayjs = require('dayjs');
const { logMessage } = require('./logger');

// Summary stats
const logSummary = {
    filesProcessed: 0,
    filesSkipped: 0,
    totalLogsParsed: 0,
    noTimestampCount: 0,
    jsonParseErrors: 0,
    lineParseErrors: 0
};

function logFinalSummary() {
    logMessage('info', 'Log processing completed', {
        totalFilesProcessed: logSummary.filesProcessed,
        totalFilesSkipped: logSummary.filesSkipped,
        totalLogsParsed: logSummary.totalLogsParsed,
        noTimestampCount: logSummary.noTimestampCount,
        jsonParseErrors: logSummary.jsonParseErrors,
        lineParseErrors: logSummary.lineParseErrors
    });
}

async function parseLogFile(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            logSummary.filesSkipped++;
            resolve([]);
            return;
        }

        const logs = [];
        const readStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({ input: readStream });

        rl.on('line', (line) => {
            try {
                const timestampMatch = line.match(/^\[([\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}\.[\d]{6}\+[\d]{2}:[\d]{2})\]/);
                if (!timestampMatch) {
                    logSummary.noTimestampCount++;
                    return;
                }

                const timestamp = timestampMatch[1];
                const jsonStringStart = line.indexOf('load ') + 5;
                let jsonString = line.substring(jsonStringStart).trim().replace(/\[\]$/, '');

                let data;
                try {
                    data = JSON.parse(jsonString);
                } catch {
                    logSummary.jsonParseErrors++;
                    return;
                }

                data.timestamp = dayjs(timestamp).format('YYYY-MM-DD');
                logs.push(data);
                logSummary.totalLogsParsed++;
            } catch {
                logSummary.lineParseErrors++;
            }
        });

        rl.on('close', () => {
            if (logs.length > 0) {
                logSummary.filesProcessed++;
            }
            resolve(logs);
        });

        rl.on('error', (err) => {
            logMessage('error', 'Error reading file', { error: err.message });
            reject(err);
        });
    });
}

// Parse all log files
async function parseAllLogFiles(directory) {
    try {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            logMessage('warn', 'Directory created', { directory });
        }

        const files = fs.readdirSync(directory).filter(file => file.endsWith('.log'));
        if (files.length === 0) {
            logMessage('warn', 'No log files found in the directory', { directory });
            return [];
        }

        const allLogs = [];
        for (const file of files) {
            const filePath = `${directory}/${file}`;

            try {
                const parsedLogs = await parseLogFile(filePath);
                allLogs.push(...parsedLogs);
            } catch (err) {
                logSummary.filesSkipped++;
                logMessage('error', 'Failed to process file', { filePath, error: err.message });
            }
        }

        logFinalSummary();
        return allLogs;
    } catch (err) {
        logMessage('error', 'Error reading directory', { error: err.message });
        return [];
    }
}

module.exports = { parseLogFile, parseAllLogFiles };
console.log("Parser working...");
parseAllLogFiles('./data/vm-logs');