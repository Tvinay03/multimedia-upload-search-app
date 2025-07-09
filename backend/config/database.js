const mongoose = require('mongoose');

/**
 * Database configuration and connection management
 */
class DatabaseConfig {
  
  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  static async connect() {
    try {
      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 8000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      };
      
      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
      // Handle app termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('📀 MongoDB connection closed due to app termination');
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }
  
  /**
   * Get database connection status
   * @returns {Object} Connection status
   */
  static getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      state: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port
    };
  }
}

module.exports = DatabaseConfig;
