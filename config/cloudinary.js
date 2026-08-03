const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.Cloud_name,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
console.log(process.env.Cloud_name);
console.log(process.env.API_KEY);
console.log(process.env.API_SECRET);

module.exports = cloudinary;