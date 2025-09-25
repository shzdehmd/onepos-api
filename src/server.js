require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./core/config/db');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');

        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
