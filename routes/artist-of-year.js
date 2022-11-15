var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");
var async = require("async");
var s3Utility = require("../utilities/s3-bucket");
var multer = require("multer");
var fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

router.post("/",jwt.authenticateToken, function (req, res, next) {
  const body = req.body
  const data = {
    heading: body.heading ? body.heading : "",
              title: body.title ? body.title : "",
              subtitle: body.subtitle ? body.subtitle : "",
              description: body.description ? body.description : "",
              points: body.points ? body.points : [],
              artist_id : body.artist_Id,
              // updatedAt: Date.now(),
    // type: req.body.type ? req.body.type : "",
    createdAt: Date.now(),
    updatedAt: null,
  };
  db.get()
    .collection("artist-of-year")
    .insertOne(data, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Artist Of Year Creation Failed."));
      }
      res.send(httpUtil.success(200, "Artist Of Year Created."));
    });
});

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const aoy_id = req.query.aoy_id ? ObjectId(req.query.aoy_id) : "";
  if (aoy_id) {
    db.get()
      .collection("artist-of-year")
      .deleteOne({ _id: aoy_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "artist-of-year deletion error."));
        res.send(httpUtil.success(200, "artist-of-year deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "artist-of-year ID is missing."));
  }
});

router.get("/", function (req, res, next) {
  db.get()
    .collection("artist-of-year")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/",jwt.authenticateToken, upload.single("file"), function (req, res, next) {
  const body = JSON.parse(req.body.data);
  const aoty_id = body.aoty_id ? ObjectId(body.aoty_id) : "";
  if (aoty_id) {
    async.waterfall(
      [
        function (callback) {
          const data = {
            $set: {
              heading: body.heading ? body.heading : "",
              title: body.title ? body.title : "",
              subtitle: body.subtitle ? body.subtitle : "",
              description: body.description ? body.description : "",
              points: body.points ? body.points : [],
              updatedAt: Date.now(),
            },
          };
          db.get()
            .collection("artist-of-year")
            .updateOne({ _id: aoty_id }, data, function (err, dbresult) {
              if (err) {
                callback(err, null);
              }
              callback(null, dbresult);
            });
        },
        function (result, callback) {
          if (req.file) {
            db.get()
              .collection("artist-of-year")
              .find({ _id: aoty_id })
              .toArray(function (err, dbresult) {
                if (err) callback(err, null);
                callback(null, dbresult[0]["image"]["name"]);
              });
          } else {
            callback(null, "No File.");
          }
        },
        function (result, callback) {
          if (req.file) {
            s3Utility
              .uploadFile("artist-of-year/" + aoty_id + "/", req.file)
              .then((uploadresult) => {
                const data = {
                  $set: {
                    image: {
                      name: req.file.originalname,
                      mimetype: req.file.mimetype,
                      path: uploadresult,
                      size: req.file.size,
                    },
                  },
                };
                db.get()
                  .collection("artist-of-year")
                  .updateOne({ _id: aoty_id }, data, function (err, dbresult) {
                    if (err) {
                      callback(err, null);
                    }
                    s3Utility
                      .deleteFile("artist-of-year/" + aoty_id + "/", result)
                      .then((s3result) => {
                        fs.unlinkSync("./uploads/" + req.file.originalname);
                        callback(null, dbresult);
                      })
                      .catch((error) => {
                        callback(error, null);
                      });
                  });
              })
              .catch((err) => {
                console.log(err);
                callback(err, null);
              });
          } else {
            callback(null, "No File.");
          }
        },
      ],
      function (err, result) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "AOTY updating Failed."));
        } else {
          res.send(httpUtil.success(200, "AOTY updated."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "AOTY ID is missing."));
  }
});

module.exports = router;
