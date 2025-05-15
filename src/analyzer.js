const { logMessage } = require('./logger');

function analyzeLogs(logs) {
    const stats = {
        totalVisitors: new Set(),       
        nonBotVisitors: new Set(), 
        visitorActions: {},         
        electionVisitors: {},  
        ridingVisitors: {},          
        uniqueVisitors: 0,   
        nonBotCount: 0,
        dailyVisitors: {},         
        dailyNonBotVisitors: {},  
        dailyElectionVisitors: {},
        dailyRidingVisitors: {}    
    };

    try {
        logs.forEach(log => {
            // Track unique visitors
            stats.totalVisitors.add(log.visitor_token);

            // Initialize visitor actions if not present
            if (!stats.visitorActions[log.visitor_token]) {
                stats.visitorActions[log.visitor_token] = 0;
            }
            stats.visitorActions[log.visitor_token]++;

            // Determine non-bot visitors
            const isSignedIn = log.signedin === 1;
            const hasPageValue = log.page && log.page.trim().length > 0;
            const hasAdditionalKeys = log.election || log.riding || log.candidate;
            const isPageWithOtherKeys = hasPageValue && hasAdditionalKeys;

            if (isSignedIn || isPageWithOtherKeys) {
                stats.nonBotVisitors.add(log.visitor_token);
            }

            // visits per election
            if (log.election) {
                if (!stats.electionVisitors[log.election]) {
                    stats.electionVisitors[log.election] = 0;
                }
                stats.electionVisitors[log.election]++;
            }

            // visits per riding
            const ridingKey = log.riding || 'null';
            if (!stats.ridingVisitors[ridingKey]) {
                stats.ridingVisitors[ridingKey] = 0;
            }
            stats.ridingVisitors[ridingKey]++;

            // Track how far each visitor got on the HowTo page
            if (log.page === "howto" && log.checkpoint) {
                if (!stats.visitorCheckpoints[log.visitor_token]) {
                    stats.visitorCheckpoints[log.visitor_token] = [];
                }
                stats.visitorCheckpoints[log.visitor_token].push(log.checkpoint);
            }

            if (log.timestamp) {
                const day = log.timestamp.split('T')[0];

                // Track total visitors by day
                if (!stats.dailyVisitors[day]) stats.dailyVisitors[day] = new Set();
                stats.dailyVisitors[day].add(log.visitor_token);

                // Track non-bot visitors by day
                if (isSignedIn || isPageWithOtherKeys) {
                    if (!stats.dailyNonBotVisitors[day]) stats.dailyNonBotVisitors[day] = new Set();
                    stats.dailyNonBotVisitors[day].add(log.visitor_token);
                }

                // Track non-bot visitors per election by day
                if (log.election) {
                    if (!stats.dailyElectionVisitors[day]) stats.dailyElectionVisitors[day] = {};
                    if (!stats.dailyElectionVisitors[day][log.election]) stats.dailyElectionVisitors[day][log.election] = new Set();
                    stats.dailyElectionVisitors[day][log.election].add(log.visitor_token);
                }

                // Track non-bot visitors per riding by day
                if (log.riding) {
                    if (!stats.dailyRidingVisitors[day]) stats.dailyRidingVisitors[day] = {};
                    if (!stats.dailyRidingVisitors[day][log.riding]) stats.dailyRidingVisitors[day][log.riding] = new Set();
                    stats.dailyRidingVisitors[day][log.riding].add(log.visitor_token);
                }
            }
        });

        // unique visitor count
        stats.uniqueVisitors = stats.totalVisitors.size;
        stats.nonBotCount = stats.nonBotVisitors.size;

        // Calculate average visit length 
        let totalVisitLength = 0;
        let multiPageVisitCount = 0;

        // Iterate over visitor actions to calculate visit lengths
        for (const [visitor, actions] of Object.entries(stats.visitorActions)) {
            if (actions > 1) { 
                totalVisitLength += actions;
                multiPageVisitCount++;
            }
        }
        // Calculate average visit length
        stats.averageVisitLength = multiPageVisitCount > 0 ? (totalVisitLength / multiPageVisitCount) : 0;

        //visitors sets to counts
        for (const day in stats.dailyVisitors) {
            stats.dailyVisitors[day] = stats.dailyVisitors[day].size;
        }
        for (const day in stats.dailyNonBotVisitors) {
            stats.dailyNonBotVisitors[day] = stats.dailyNonBotVisitors[day].size;
        }
        for (const day in stats.dailyElectionVisitors) {
            for (const election in stats.dailyElectionVisitors[day]) {
                stats.dailyElectionVisitors[day][election] = stats.dailyElectionVisitors[day][election].size;
            }
        }
        for (const day in stats.dailyRidingVisitors) {
            for (const riding in stats.dailyRidingVisitors[day]) {
                stats.dailyRidingVisitors[day][riding] = stats.dailyRidingVisitors[day][riding].size;
            }
        }

        logMessage('info', 'Average visit length calculated', {
            averageVisitLength: stats.averageVisitLength.toFixed(2)
        });

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