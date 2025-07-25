module.exports = {
    apps: [
        {
            script: './dist/index.js',
            name: 'api-v1',
            min_uptime: 10000,
            max_restarts: 15,
            restart_delay: 2000,
            kill_timeout: 3000,
            /* dev */
            instances: 1,
            /* production */
            // instances: 'max',
            exec_mode: 'cluster',
        },
        {
            script: './dist/index-worker.js',
            name: 'worker-v1',
            min_uptime: 10000,
            max_restarts: 15,
            restart_delay: 2000,
            kill_timeout: 3000,
            /* dev */
            instances: 1,
            /* production */
            // instances: 'max',
            exec_mode: 'cluster',
        },
    ],
};
