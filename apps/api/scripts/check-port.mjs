#!/usr/bin/env node

import net from 'net';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get port from environment variable or use default
const port = parseInt(process.env.DB_PORT || '1433', 10);
const host = process.env.DB_SERVER || 'localhost';

/**
 * Check if a port is already in use
 */
function isPortInUse(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is already in use
        resolve(true);
      } else {
        // Some other error occurred
        console.error(`Error checking port: ${err.message}`);
        resolve(false);
      }
    });

    server.once('listening', () => {
      // Port is available, close the server
      server.close(() => {
        resolve(false);
      });
    });

    // Try to listen on the port
    server.listen(port, host);
  });
}

async function checkPort() {
  console.log(`Checking if port ${port} is available...`);

  try {
    const inUse = await isPortInUse(port, host);

    if (inUse) {
      console.warn(
        `Port ${port} is already in use. This might be an issue if you're trying to start a new database instance.`
      );

      // Check if it's our SQL Server that's running
      console.log('Checking if SQL Server is already running...');
      // You could add more sophisticated checks here if needed

      console.log(
        'Proceeding with database startup command. If this fails, you may need to manually stop the service using the port.'
      );
    } else {
      console.log(`Port ${port} is available.`);
    }

    // Exit with success either way - let the docker-compose step handle any issues
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkPort().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export default checkPort;
