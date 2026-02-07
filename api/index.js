const server = require('../server/server');

// Export for Vercel serverless functions
module.exports = async (req, res) => {
    // Handle serverless function execution
    return server(req, res);
};
