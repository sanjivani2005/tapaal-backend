const server = require('../server/server');

// Export for Vercel serverless functions
module.exports = (req, res) => {
    console.log('🚀 Serverless function called:', req.method, req.url);

    // Handle serverless function execution
    server(req, res);
};
