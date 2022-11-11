const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const secret = require("../conf/secrets");

var s3Utility = {};
const uploadDirectory = path.join(__dirname, "../uploads");
fs.existsSync(uploadDirectory) || fs.mkdirSync(uploadDirectory);

AWS.config.update({
  accessKeyId: secret.AWS_ACCESS_KEY,
  secretAccessKey: secret.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
s3Utility.uploadFile = (path, file) =>
  new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync("./uploads/" + file.originalname);
    const params = {
      Bucket: secret.BUCKET_NAME,
      Key: path + file.originalname,
      Body: fileContent,
    };
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });

s3Utility.deleteFile = (path, filename) =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: secret.BUCKET_NAME,
      Key: path + filename
    };
    s3.deleteObject(params, function (err, data) 
    {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });

module.exports = s3Utility;