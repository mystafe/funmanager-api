const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI); // Deprecated seçenekler kaldırıldı
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // Hata durumunda uygulamayı sonlandır
  }
};

module.exports = connectDB;