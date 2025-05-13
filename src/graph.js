const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const { logMessage } = require('./logger');

// Chart canvas settings
const width = 800;
const height = 600;

function ensureOutputDirectory() {
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        logMessage('info', 'Created output directory', { path: outputDir });
    }
}

async function generateCheckpointGraph(data) {
    try {
        if (!data || Object.keys(data).length === 0) {
            logMessage('warn', 'No checkpoint data to generate graph');
            return;
        }

        ensureOutputDirectory();
        const canvas = new ChartJSNodeCanvas({ width, height });
        const config = {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Checkpoint Visits',
                    data: Object.values(data),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Checkpoint Event Statistics'
                    }
                }
            }
        };
        const image = await canvas.renderToBuffer(config);
        const filePath = path.join(__dirname, 'output', 'checkpoint-graph.png');
        fs.writeFileSync(filePath, image);
        logMessage('info', 'Generated checkpoint graph', { path: filePath });
        console.log(`Checkpoint graph saved at: ${filePath}`);
    } catch (err) {
        logMessage('error', 'Failed to generate checkpoint graph', { error: err.message });
    }
}

async function generateReferrerGraph(data) {
    try {
        if (!data || Object.keys(data).length === 0) {
            logMessage('warn', 'No referrer data to generate graph');
            return;
        }

        ensureOutputDirectory();
        const canvas = new ChartJSNodeCanvas({ width, height });
        const config = {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Referrer Visits',
                    data: Object.values(data),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Referrer Statistics'
                    }
                }
            }
        };
        const image = await canvas.renderToBuffer(config);
        const filePath = path.join(__dirname, 'output', 'referrer-graph.png');
        fs.writeFileSync(filePath, image);
        logMessage('info', 'Generated referrer graph', { path: filePath });
    } catch (err) {
        logMessage('error', 'Failed to generate referrer graph', { error: err.message });
    }
}

module.exports = { generateCheckpointGraph, generateReferrerGraph };