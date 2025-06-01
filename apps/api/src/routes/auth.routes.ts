import { Router } from 'express';
import jwtRoutes from './auth/jwt.routes';
import siweRoutes from './auth/siwe.routes';
import protectedRoutes from './auth/protected.routes';
import devRoutes from './auth/dev.routes';

// Create router
const router: Router = Router();

/**
 * JWT-based Authentication Routes
 * Traditional authentication flow with JWT tokens
 */
router.use('/jwt', jwtRoutes);

/**
 * SIWE Authentication Routes
 * Sign-In With Ethereum authentication flow
 */
router.use('/siwe', siweRoutes);

/**
 * Protected Routes
 * These endpoints are accessible via any auth method
 */
router.use('/protected', protectedRoutes);

/**
 * Development/Admin Routes
 * These endpoints are only available in non-production environments
 */
if (process.env.NODE_ENV !== 'production') {
  router.use('/dev', devRoutes);
}

/**
 * Proxy route for Merkle.io API to avoid CORS issues
 * This acts as a middleware to forward requests to Merkle.io
 */
router.all('/proxy/merkle/*', async (req, res) => {
  try {
    const path = req.path.replace('/proxy/merkle', '') || '/';
    const url = `https://eth.merkle.io${path}`;

    console.log(`Proxying request to: ${url}`);

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward only safe headers
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization as string }
          : {})
      },
      // Only include body for non-GET requests
      ...(req.method !== 'GET' && { body: JSON.stringify(req.body) })
    });

    // Get the response data
    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward the response status and data
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Merkle proxy error:', error);
    res.status(500).json({ error: 'Error proxying request to Merkle.io' });
  }
});

/**
 * Proxy route for Ethereum RPC to avoid CORS issues
 */
router.all('/proxy/ethereum', async (req, res) => {
  try {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
    console.log(`Proxying Ethereum RPC request to: ${rpcUrl}`);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Ethereum RPC proxy error:', error);
    res.status(500).json({ error: 'Error proxying request to Ethereum RPC' });
  }
});

// Export the router
export const authRouter: Router = router;
