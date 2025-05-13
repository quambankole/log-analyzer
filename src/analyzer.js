const { logMessage } = require('./logger');

function analyzeLogs(logs) {
    const stats = {
        totalVisitors: new Set(),
        nonBotVisitors: new Set(),
        visitsByDay: {},
        pageVisits: {},
        visitorActions: {},
        checkpointStats: {},      
        visitorCheckpoints: {},   
        electionVisitors: {},     
        ridingVisitors: {},       
        visitLengths: [],         
        totalEvents: 0,
        uniqueVisitors: 0,
        nonBotCount: 0
    };

    try {
        logs.forEach(log => {
            stats.totalEvents++;

            // unique visitors
            stats.totalVisitors.add(log.visitor_token);

            //  single-page visits (bots)
            if (stats.visitorActions[log.visitor_token]) {
                stats.visitorActions[log.visitor_token]++;
                stats.nonBotVisitors.add(log.visitor_token);
            } else {
                stats.visitorActions[log.visitor_token] = 1;
            }

            // visits per election
            if (log.election) {
                if (!stats.electionVisitors[log.election]) {
                    stats.electionVisitors[log.election] = new Set();
                }
                stats.electionVisitors[log.election].add(log.visitor_token);
            }

            // visits per riding
            if (log.riding) {
                if (!stats.ridingVisitors[log.riding]) {
                    stats.ridingVisitors[log.riding] = new Set();
                }
                stats.ridingVisitors[log.riding].add(log.visitor_token);
            }

            // visit length
            if (stats.visitorActions[log.visitor_token] > 1) {
                stats.visitLengths.push(stats.visitorActions[log.visitor_token]);
            }

            // Group by page type
            if (log.page) {
                stats.pageVisits[log.page] = (stats.pageVisits[log.page] || 0) + 1;
            }

            // Group by day
            if (log.timestamp) {
                stats.visitsByDay[log.timestamp] = (stats.visitsByDay[log.timestamp] || 0) + 1;
            }

            // checkpoint-events
            if (log.checkpoint) {
                stats.checkpointStats[log.checkpoint] = (stats.checkpointStats[log.checkpoint] || 0) + 1;
                if (!stats.visitorCheckpoints[log.visitor_token]) {
                    stats.visitorCheckpoints[log.visitor_token] = [];
                }
                stats.visitorCheckpoints[log.visitor_token].push(log.checkpoint);
            }
        });

        // unique visitor count
        stats.uniqueVisitors = stats.totalVisitors.size;
        stats.nonBotCount = stats.nonBotVisitors.size;

        // average visit length
        const totalLength = stats.visitLengths.reduce((sum, length) => sum + length, 0);
        stats.averageVisitLength = (totalLength / stats.visitLengths.length) || 0;

        logMessage('info', 'Log analysis completed successfully', {
            totalEvents: stats.totalEvents,
            uniqueVisitors: stats.uniqueVisitors,
            nonBotCount: stats.nonBotCount,
            averageVisitLength: stats.averageVisitLength.toFixed(2)
        });

        return stats;
    } catch (err) {
        logMessage('error', 'Error analyzing logs', { error: err.message });
        return null;
    }
}

module.exports = { analyzeLogs };