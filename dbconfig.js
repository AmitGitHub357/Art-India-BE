const { MachineLearning } = require("aws-sdk");

var MongoClient = require("mongodb").MongoClient;

var URI = "mongodb+srv://rahat6713:1819rahat@cluster0.iee0y.mongodb.net/amit?retryWrites=true&w=majority";

var connection = null;

var option = {
  keepAlive: true,
  minPoolSize: 0,
  maxPoolSize: 100,
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

var MongoDBClient = new MongoClient(URI, option);

module.exports.connect = () =>
  new Promise((resolve, reject) => {
    MongoDBClient.connect(function (err, client) {
      if (err) {
        reject(err);
        return;
      }
      var db = client.db("artindiaart");
      resolve(db);
      connection = db;
    });
  });

module.exports.get = () => {
  if (!connection) {
    throw new Error("Call Connect First...");
  }
  return connection;
};

module.exports.close = () => {
  if (!connection) {
    throw new Error("Call Connect First...");
  }
  MongoDBClient.close();
};