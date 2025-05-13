
const { parseLogFile, parseAllLogFiles } = require('./parser');
const { analyzeLogs } = require('./analyzer');
const { generateCheckpointGraph, generateReferrerGraph, generateDailyVisitorsGraph, generateElectionVisitorsGraph } = require('./graph');
const { logMessage } = require('./logger');

async function main(logFilePath) {
    try {
        logMessage('info', 'Starting log analysis', { filePath: logFilePath });

        const logs = await parseLogFile(logFilePath);
        if (!logs || logs.length === 0) {
            logMessage('warn', 'No logs found to analyze', { filePath: logFilePath });
            return;
        }

        const analysis = analyzeLogs(logs);
        if (!analysis) {
            logMessage('error', 'Log analysis failed');
            return;
        }

        console.log('Analysis Summary:', {
            totalVisitors: analysis.uniqueVisitors,
            nonBotVisitors: analysis.nonBotCount,
            averageVisitLength: analysis.averageVisitLength,
            pageVisits: analysis.pageVisits,
            electionVisitors: Object.keys(analysis.electionVisitors).map(election => ({
                election,
                count: analysis.electionVisitors[election].size
            })),
            ridingVisitors: Object.keys(analysis.ridingVisitors).map(riding => ({
                riding,
                count: analysis.ridingVisitors[riding].size
            })),
        });

        await generateCheckpointGraph(analysis.checkpointStats);
        await generateReferrerGraph(analysis.referrerStats);
        await generateDailyVisitorsGraph(analysis.visitsByDay);
        await generateElectionVisitorsGraph(analysis.electionVisitors);

        logMessage('info', 'Log analysis & graph generation successful');
    } catch (err) {
        logMessage('error', 'Error in log analysis process', { error: err.message });
    }
}

const logFilePath = process.argv[2] || './src/data/vm-logs/visitor_tracking.log';
main(logFilePath);