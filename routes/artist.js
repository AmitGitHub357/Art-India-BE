var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var bcrypt = require("bcrypt");
var jwt = require("../utilities/jwt");
var secret = require("../conf/secrets");
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

router.get("/:name",jwt.authenticateToken, function (req, res, next) {
  const name = req.params.name
  db.get()
    .collection("artist")
    .find({ name : name })
    // .project({ _id: 1, name: 1 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/",jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("artist")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/",jwt.authenticateToken, upload.single("file"), function (req, res, next) {
  try{

  const body = req.body;
  async.waterfall(
    [
      function (callback) {
        bcrypt.hash(body.password, secret.SALT_ROUNDS, function (err, hash) {
          const data = {
            name: body.name ? body.name : "",
            password: hash,
            email: body.email ? body.email : "",
            mobile: body.mobile ? body.mobile : "",
            dob: body.dob ? body.dob : "",
            gender: body.gender ? body.gender : "",
            address: body.address ? body.address : "",
            city: body.city ? body.city : "",
            state: body.state ? body.state : "",
            country: body.country ? body.country : "",
            zipcode: body.zipcode ? body.zipcode : "",
            tagline: body.tagline ? body.tagline : "",
            description: body.description ? body.description : "",
            painting: [],
            skill: body.skill ? body.skill : [],
            extra: body.extra ? body.extra : [],
            facebook: body.facebook ? body.facebook : "",
            linkedin: body.linkedin ? body.linkedin : "",
            instagram: body.instagram ? body.instagram : "",
            type: body.type ? body.type : "",
            createdAt: Date.now(),
            updatedAt: null,
            status: null,
          };
          db.get()
            .collection("artist")
            .insertOne(data, function (err, dbresult) {
              if (err) callback(err, null);
              callback(null, dbresult.insertedId);
            });
        });
      },
      function (result, callback) {
        if (req.file) {
          s3Utility
            .uploadFile("artist/" + result + "/", req.file)
            .then((uploadresult) => {
              let data = {
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
                .collection("artist")
                .updateOne(
                  { _id: ObjectId(result) },
                  data,
                  function (err, dbresult) {
                    if (err) {
                      callback(err, null);
                    }
                    fs.unlinkSync("./uploads/" + req.file.originalname);
                    callback(null, dbresult);
                  }
                );
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
        res.status(500).send(httpUtil.error(500, "Artist Creation Failed."));
      } else {
        res.send(httpUtil.success(200, "Artist Created."));
      }
    }
  );
  }catch(err){
    res.send({
      status : 400,
      error : err.message,
      success : false
    })
  }
});

router.put("/",jwt.authenticateToken, upload.single("file"), function (req, res, next) {
  const body = req.body;
  const artist_id = body.artist_id ? ObjectId(body.artist_id) : "";
  if (artist_id) {
    async.waterfall(
      [
        function (callback) {
          const data = {
            $set: { 
              name: body.name ? body.name : "",
              email: body.email ? body.email : "",
              mobile: body.mobile ? body.mobile : "",
              dob: body.dob ? body.dob : "",
              gender: body.gender ? body.gender : "",
              address: body.address ? body.address : "",
              city: body.city ? body.city : "",
              state: body.state ? body.state : "",
              country: body.country ? body.country : "",
              zipcode: body.zipcode ? body.zipcode : "",
              tagline: body.tagline ? body.tagline : "",
              description: body.description ? body.description : "",
              skill: body.skill ? body.skill : [],
              extra: body.extra ? body.extra : [],
              facebook: body.facebook ? body.facebook : "",
              linkedin: body.linkedin ? body.linkedin : "",
              instagram: body.instagram ? body.instagram : "",
              type: body.type ? body.type : "",
              updatedAt: Date.now(),
              status : body.status ? body.status : "Active"
            },
          };
          db.get()
            .collection("artist")
            .updateOne({ _id: artist_id }, data, function (err, dbresult) {
              if (err) {
                callback(err, null);
              }
              callback(null, dbresult);
            });
        },
        function (result, callback) {
          if (req.file) {
            db.get()
              .collection("artist")
              .find({ _id: artist_id })
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
              .uploadFile("artist/" + artist_id + "/", req.file)
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
                  .collection("artist")
                  .updateOne(
                    { _id: artist_id },
                    data,
                    function (err, dbresult) {
                      if (err) {
                        callback(err, null);
                      }
                      s3Utility
                        .deleteFile("artist/" + artist_id + "/", result)
                        .then((s3result) => {
                          fs.unlinkSync("./uploads/" + req.file.originalname);
                          callback(null, dbresult);
                        })
                        .catch((error) => {
                          callback(error, null);
                        });
                    }
                  );
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
          res.status(500).send(httpUtil.error(500, "Artist updating Failed."));
        } else {
          res.send(httpUtil.success(200, "Artist updated."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Artist ID is missing."));
  }
});

router.patch("/",jwt.authenticateToken, function (req, res, next) {
  const artist_id = req.body.artist_id ? ObjectId(req.body.artist_id) : "";
  if (artist_id) {
    let Id = { _id: artist_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("artist")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Artist updating error."));
        }
        res.send(httpUtil.success(200, "Artist updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artist ID is missing."));
  }
});

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const artist_id = req.query.artist_id ? ObjectId(req.query.artist_id) : "";
  if (artist_id) {
    async.waterfall(
      [
        function (callback) {
          db.get()
            .collection("artist")
            .find({ _id: artist_id })
            .toArray(function (err, dbresult) {
              if (err) callback(err, null);
              if (dbresult[0]["image"] && dbresult[0]["image"]["name"]) {
                callback(null, dbresult[0]["image"]["name"]);
              } else {
                callback(null, "No Image");
              }
            });
        },
        function (result, callback) {
          if (result !== "No Image") {
            s3Utility
              .deleteFile("artist/" + artist_id + "/", result)
              .then((s3result) => {
                callback(null, "Done");
              })
              .catch((error) => {
                callback(error, null);
              });
          } else {
            callback(null, "No Image");
          }
        },
        function (result, callback) {
          db.get()
            .collection("artist")
            .deleteOne({ _id: artist_id }, function (err, dbresult) {
              if (err) callback(err, null);
              callback(null, dbresult);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "Artist deletion Failed."));
        } else {
          res.send(httpUtil.success(200, "Artist deleted."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Artist ID is missing."));
  }
});

module.exports = router;
