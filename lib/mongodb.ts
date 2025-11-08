import mongoose from "mongoose";

const connectMongoDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("✅ Connected to MongoDB");
    }
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
};

export default connectMongoDB;
