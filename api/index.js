const server = require('../server/server');

// Export for Vercel serverless functions
module.exports = async (req, res) => {
    try {
        // Handle serverless function execution
        await server(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
