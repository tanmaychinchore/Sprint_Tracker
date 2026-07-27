const mongoose = require("mongoose");

const DEFAULT_FALLBACK_URI = "mongodb://127.0.0.1:27017/sprint_tracker";

const resolveMongoUris = (env = process.env) => {
  const uris = [];
  if (env.MONGO_URI) {
    uris.push(env.MONGO_URI);
  }
  if (env.MONGO_URI_FALLBACK) {
    uris.push(env.MONGO_URI_FALLBACK);
  } else if (env.MONGO_URI && env.MONGO_URI !== DEFAULT_FALLBACK_URI) {
    uris.push(DEFAULT_FALLBACK_URI);
  }
  if (!uris.length) {
    uris.push(DEFAULT_FALLBACK_URI);
  }
  return uris;
};

const connectDB = async () => {
  const uris = resolveMongoUris();

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected using ${uri}`);
      return true;
    } catch (error) {
      console.log(`DB Error for ${uri}:`, error.message);
    }
  }

  console.warn("MongoDB unavailable; continuing without database connection.");
  return false;
};

module.exports = connectDB;
module.exports.resolveMongoUris = resolveMongoUris;