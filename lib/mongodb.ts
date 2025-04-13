import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const opts: mongoose.ConnectOptions = {
      retryWrites: true,
      w: 'majority' as const,
    };

    try {
      await mongoose.connect(process.env.MONGODB_URI as string, opts);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error in connect:', error);
      throw error; // Re-throw to be caught by the outer try-catch
    }

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error in event:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectMongoDB;