import mongoose from 'mongoose';

/**
 * Connect to MongoDB using process.env.MONGODB_URI
 */
export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing. Please set MONGODB_URI in your environment settings.');
  }

  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Successfully connected to MongoDB database!');
    console.log("MongoDB database:", mongoose.connection.name);
    console.log("MongoDB host:", mongoose.connection.host);
  } catch (error: any) {
    console.error('MongoDB Connection Failed:', error.message || error);
    throw error;
  }
}
