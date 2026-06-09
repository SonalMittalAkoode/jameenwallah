const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
