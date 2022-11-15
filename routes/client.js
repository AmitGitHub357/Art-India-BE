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
router.get("/", function (req, res, next) {
  db.get()
    .collection("client")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", upload.any("files"), async function (req, res, next) {
  const imageFiles = req.files ? req.files : [];
  const imagePath = []
  const body = req.body;
  body.otp = "";
  // generate salt to hash password
  const salt = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  body.password = await bcrypt.hash(body.password, salt);
  body.resetToken = ""
  if (imageFiles) { 
    for (let i = 0; i < imageFiles.length; i++) {
      let imgObj = imageFiles[i].destination + imageFiles[i].originalname
      imagePath.push(imgObj)
    }
    body.images = imagePath
  }

  db.get()
    .collection("client")
    .insertOne(body, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "Client Creation Failed."));
      res.send(httpUtil.success(200, "Client Registered."));
    });
})
router.put("/", upload.single("file"), function (req, res, next) {
  const client_id = req.body.client_id ? ObjectId(req.body.client_id) : "";
  if (client_id) {
    async.waterfall(
      [
        function (callback) {
          const data = {
            $set: {
              name: req.body.name ? req.body.name : "",
              email: req.body.email ? req.body.email : "",
              mobile: req.body.mobile ? req.body.mobile : "",
              dob: req.body.dob ? req.body.dob : "",
              gender: req.body.gender ? req.body.gender : "",
              address: req.body.address ? req.body.address : "",
              city: req.body.city ? req.body.city : "",
              state: req.body.state ? req.body.state : "",
              country: req.body.country ? req.body.country : "",
              zipcode: req.body.zipcode ? req.body.zipcode : "",
              favourite: req.body.favourite ? req.body.favourite : [],
              updatedAt: Date.now(),
            },
          };
          db.get()
            .collection("client")
            .updateOne({ _id: client_id }, data, function (err, dbresult) {
              if (err) {
                callback(err, null);
              }
              callback(null, dbresult);
            });
        },
        function (result, callback) {
          if (req.file) {
            db.get()
              .collection("client")
              .find({ _id: client_id })
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
              .uploadFile("client/" + client_id + "/", req.file)
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
                  .collection("client")
                  .updateOne(
                    { _id: client_id },
                    data,
                    function (err, dbresult) {
                      if (err) {
                        callback(err, null);
                      }
                      s3Utility
                        .deleteFile("client/" + client_id + "/", result)
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
          res.status(500).send(httpUtil.error(500, "Client updating Failed."));
        } else {
          res.send(httpUtil.success(200, "Client updated."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Client ID is missing."));
  }
});

router.patch("/", function (req, res, next) {
  const client_id = req.body.client_id ? ObjectId(req.body.client_id) : "";
  if (client_id) {
    let Id = { _id: client_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("client")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Client updating error."));
        }
        res.send(httpUtil.success(200, "Client updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Client ID is missing."));
  }
});

router.delete("/", function (req, res, next) {
  const client_id = req.query.client_id ? ObjectId(req.query.client_id) : "";
  if (client_id) {
    async.waterfall(
      [
        function (callback) {
          db.get()
            .collection("client")
            .find({ _id: client_id })
            .toArray(function (err, dbresult) {
              if (err) callback(err, null);
              callback(null, dbresult[0]["image"]["name"]);
            });
        },
        function (result, callback) {
          s3Utility
            .deleteFile("client/" + client_id + "/", result)
            .then((s3result) => {
              db.get()
                .collection("client")
                .deleteOne({ _id: client_id }, function (err, dbresult) {
                  if (err) callback(err, null);
                  callback(null, dbresult);
                });
            })
            .catch((error) => {
              callback(error, null);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "Client deletion Failed."));
        } else {
          res.send(httpUtil.success(200, "Client deleted."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Client ID is missing."));
  }
});

router.get("/logo", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("clients-logo")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/logo", upload.single("file"), function (req, res, next) {
  if (req.file) {
    s3Utility
      .uploadFile("clients-logo/", req.file)
      .then((uploadresult) => {
        let data = {
          image: {
            name: req.file.originalname,
            mimetype: req.file.mimetype,
            path: uploadresult,
            size: req.file.size,
          },
          createdAt: Date.now(),
          updatedAt: null,
        };
        db.get()
          .collection("clients-logo")
          .insertOne(data, function (err, dbresult) {
            if (err) {
              res
                .status(500)
                .send(httpUtil.error(500, "Client's logo Creation Failed."));
            }
            fs.unlinkSync("./uploads/" + req.file.originalname);
            res.send(httpUtil.success(200, "Client's logo Created."));
          });
      })
      .catch((err) => {
        res
          .status(500)
          .send(httpUtil.error(500, "Client's logo Creation Failed."));
      });
  } else {
    res.status(500).send(httpUtil.error(500, "No File."));
  }
});

router.put("/logo", upload.single("file"), function (req, res, next) {
  const body = JSON.parse(req.body.data);
  const logo_id = body.logo_id ? ObjectId(body.logo_id) : "";
  if (logo_id) {
    async.waterfall(
      [
        function (callback) {
          if (req.file) {
            db.get()
              .collection("clients-logo")
              .find({ _id: logo_id })
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
              .uploadFile("clients-logo/", req.file)
              .then((uploadresult) => {
                const data = {
                  $set: {
                    image: {
                      name: req.file.originalname,
                      mimetype: req.file.mimetype,
                      path: uploadresult,
                      size: req.file.size,
                    },
                    updatedAt: Date.now(),
                  },
                };
                db.get()
                  .collection("clients-logo")
                  .updateOne({ _id: logo_id }, data, function (err, dbresult) {
                    if (err) {
                      callback(err, null);
                    }
                    s3Utility
                      .deleteFile("clients-logo/", result)
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
          res
            .status(500)
            .send(httpUtil.error(500, "Client's logo updating Failed."));
        } else {
          res.send(httpUtil.success(200, "Client's logo updated."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Client's logo ID is missing."));
  }
});

router.delete("/logo", function (req, res, next) {
  const logo_id = req.query.logo_id ? ObjectId(req.query.logo_id) : "";
  if (logo_id) {
    async.waterfall(
      [
        function (callback) {
          db.get()
            .collection("clients-logo")
            .find({ _id: logo_id })
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
              .deleteFile("clients-logo/", result)
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
            .collection("clients-logo")
            .deleteOne({ _id: logo_id }, function (err, dbresult) {
              if (err) callback(err, null);
              callback(null, dbresult);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res
            .status(500)
            .send(httpUtil.error(500, "Client's logo deletion Failed."));
        } else {
          res.send(httpUtil.success(200, "Client's logo deleted."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Client's logo ID is missing."));
  }
});

module.exports = router;