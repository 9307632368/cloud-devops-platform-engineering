import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT should be an integer from 1 to 65535');
  process.exit(1);
}
const maintenance = process.env.MAINTENANCE_MODE === 'true';
const server = createApp({ maintenance });
server.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({ message: 'service listening', port, maintenance }));
});

function shutdown(signal) {
  console.log(JSON.stringify({ message: 'stopping service', signal }));
  server.close((error) => process.exit(error ? 1 : 0));
  // Closing a long-running connection should not hang a container forever.
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
