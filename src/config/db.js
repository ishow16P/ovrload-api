import mongoose from 'mongoose';

export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is not set');
  // Railway's MONGO_URL has no database path → pick one explicitly with MONGODB_DB
  await mongoose.connect(uri, process.env.MONGODB_DB ? { dbName: process.env.MONGODB_DB } : {});
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
