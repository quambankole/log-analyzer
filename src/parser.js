const fs = require('fs');
const readline = require('readline');
const { logMessage } = require('./logger');

// Summary stats
const logSummary = {
    filesProcessed: 0,
    filesSkipped: 0,
    totalLogsParsed: 0,
    jsonParseErrors: 0,
    lineParseErrors: 0
};

function logFinalSummary() {
    logMessage('info', 'Log processing completed', {
        totalFilesProcessed: logSummary.filesProcessed,
        totalFilesSkipped: logSummary.filesSkipped,
        totalLogsParsed: logSummary.totalLogsParsed,
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
                const jsonStringStart = line.indexOf('{');
                const jsonStringEnd = line.lastIndexOf('}') + 1;
                if (jsonStringStart === -1 || jsonStringEnd === 0) {
                    logSummary.lineParseErrors++;
                    return;
                }

                let jsonString = line.substring(jsonStringStart, jsonStringEnd).trim();

                let data;

                try {
                    data = JSON.parse(jsonString);
                } 
                
                catch {
                    logSummary.jsonParseErrors++;
                    return;
                }
                logs.push(data);
                
                logSummary.totalLogsParsed++;
            } 
            catch {
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
        const files = fs.readdirSync(directory).filter(file => file.endsWith('.log'));

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


