'use strict';
const { readConfig } = require('./config');
const { createApp } = require('./app');
const config = readConfig();
const server = createApp(config);
server.listen(config.port, '0.0.0.0', () => {
  console.log(JSON.stringify({ event: 'server_started', port: config.port, pod: config.pod }));
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(JSON.stringify({ event: 'shutdown', signal }));
    server.close(() => process.exit(0));
    // Do not leave the process hanging forever if there are stale connections.
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
