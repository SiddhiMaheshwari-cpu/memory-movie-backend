const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_EXPIRY",
  "GROQ_API_KEY",
];

const validateEnv = () => {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.Cloud_name;
  const cloudKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
  const cloudSecret =
    process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (!cloudName || !cloudKey || !cloudSecret) {
    missing.push("CLOUDINARY credentials");
  }

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }
};

module.exports = { validateEnv };
