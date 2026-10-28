import mongoose from 'mongoose';

// Connects to MongoDB and keeps retrying if the connection drops.
const connectToMongo = async (onReady) => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_LINK);
    console.log('✅ Connected to MongoDB successfully');
    onReady?.();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(() => mongoose.connect(process.env.MONGODB_CONNECTION_LINK).catch(() => {}), 5000);
});

export default connectToMongo;
