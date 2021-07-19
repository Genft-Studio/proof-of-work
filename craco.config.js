const WorkerPlugin = require('worker-plugin');

module.exports = {
    webpack: {
        plugins: [
            new WorkerPlugin()
        ],
        resolveLoader: {
            alias: {
                worker: 'worker-plugin'
            }
        }
    }
}