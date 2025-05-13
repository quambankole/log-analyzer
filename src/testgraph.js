const { generateCheckpointGraph, generateReferrerGraph } = require('./graph');

const mockCheckpointData = {
    "cow": 25,
    "dog": 20,
    "rat": 15,
    "cat": 5
};

const mockReferrerData = {
    "FB": 40,
    "X": 20,
    "newspaper": 10,
    "website": 5
};


generateCheckpointGraph(mockCheckpointData);
generateReferrerGraph(mockReferrerData);
