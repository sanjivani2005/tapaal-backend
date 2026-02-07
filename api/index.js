const server = require('../server/server');

// Export for Vercel serverless functions
module.exports = async (req, res) => {
    try {
        console.log('🚀 Serverless function called:', req.method, req.url);

        // Set NODE_ENV for serverless
        process.env.NODE_ENV = 'production';
        process.env.VERCEL = 'true';

        // Handle serverless function execution
        server(req, res);
    } catch (error) {
        console.error('❌ Serverless function error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
