import app from '../server/src/app'

/**
 * Vercel serverless entry.
 *
 * The build bundles this file and everything it imports — including the whole
 * Express app and its routes — into one Node function that answers /api/*.
 * Express is detected as a request listener, so no adapter is needed.
 *
 * Client and API share one origin here, so the browser makes same-origin
 * /api calls and CORS stays out of the way.
 */
export default app