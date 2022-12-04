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
router.get("/", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("about") 
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/", jwt.authenticateToken, function (req, res, next) {
  const about_id = req.body.about_id ? ObjectId(req.body.about_id) : "";
  const heading = req.body.heading ? req.body.heading : "";
  const title = req.body.title ? req.body.title : "";
  const description = req.body.description ? req.body.description : "";
  if (about_id) {
    let Id = { _id: about_id };
    let data = {
      $set: {
        heading: heading,
        title: title,
        description: description,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("about")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "About updating error."));
        }
        res.send(httpUtil.success(200, "About updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

router.get("/1", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("about1")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/1", jwt.authenticateToken, function (req, res, next) {
  const about_id = req.body.about_id ? ObjectId(req.body.about_id) : "";
  const heading = req.body.heading ? req.body.heading : "";
  const title = req.body.title ? req.body.title : "";
  const description = req.body.description ? req.body.description : "";
  if (about_id) {
    let Id = { _id: about_id };
    let data = {
      $set: {
        heading: heading,
        title: title,
        description: description,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("about1")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "About updating error."));
        }
        res.send(httpUtil.success(200, "About updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

router.get("/2", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("about2")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/2", jwt.authenticateToken, function (req, res, next) {
  const about_id = req.body.about_id ? ObjectId(req.body.about_id) : "";
  const heading = req.body.heading ? req.body.heading : "";
  const title = req.body.title ? req.body.title : "";
  const description = req.body.description ? req.body.description : "";
  if (about_id) {
    let Id = { _id: about_id };
    let data = {
      $set: {
        heading: heading,
        title: title,
        description: description,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("about2")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "About updating error."));
        }
        res.send(httpUtil.success(200, "About updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

router.get("/3", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("about3")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/3", jwt.authenticateToken, function (req, res, next) {
  const about_id = req.body.about_id ? ObjectId(req.body.about_id) : "";
  const heading = req.body.heading ? req.body.heading : "";
  const title = req.body.title ? req.body.title : "";
  const description = req.body.description ? req.body.description : "";
  if (about_id) {
    let Id = { _id: about_id };
    let data = {
      $set: {
        heading: heading,
        title: title,
        description: description,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("about3")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "About updating error."));
        }
        res.send(httpUtil.success(200, "About updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

router.get("/4", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("about4")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/4", upload.single("file"), function (req, res, next) {
  const body = JSON.parse(req.body.data);
  async.waterfall(
    [
      function (callback) {
        const data = {
          name: body.name ? body.name : "",
          designation: body.designation ? body.designation : "",
          description: body.description ? body.description : "",
          createdAt: Date.now(),
          updatedAt: null,
          status: null,
        };
        db.get()
          .collection("about4")
          .insertOne(data, function (err, dbresult) {
            if (err) callback(err, null);
            callback(null, dbresult.insertedId);
          });
      },
      function (result, callback) {
        if (req.file) {
          s3Utility
            .uploadFile("about/" + result + "/", req.file)
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
                .collection("about4")
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
        res.status(500).send(httpUtil.error(500, "About Creation Failed."));
      } else {
        res.send(httpUtil.success(200, "About Created."));
      }
    }
  );
});

router.put("/4", upload.single("file"), function (req, res, next) {
  const body = JSON.parse(req.body.data);
  const about_id = body.about_id ? ObjectId(body.about_id) : "";
  if (about_id) {
    async.waterfall(
      [
        function (callback) {
          const data = {
            $set: {
              name: body.name ? body.name : "",
              designation: body.designation ? body.designation : "",
              description: body.description ? body.description : "",
              updatedAt: Date.now(),
            },
          };
          db.get()
            .collection("about4")
            .updateOne({ _id: about_id }, data, function (err, dbresult) {
              if (err) {
                callback(err, null);
              }
              callback(null, dbresult);
            });
        },
        function (result, callback) {
          if (req.file) {
            db.get()
              .collection("about4")
              .find({ _id: about_id })
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
              .uploadFile("about/" + about_id + "/", req.file)
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
                  .collection("about4")
                  .updateOne({ _id: about_id }, data, function (err, dbresult) {
                    if (err) {
                      callback(err, null);
                    }
                    s3Utility
                      .deleteFile("about/" + about_id + "/", result)
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
          res.status(500).send(httpUtil.error(500, "About updating Failed."));
        } else {
          res.send(httpUtil.success(200, "About updated."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

router.delete("/4", function (req, res, next) {
  const about_id = req.query.about_id ? ObjectId(req.query.about_id) : "";
  if (about_id) {
    async.waterfall(
      [
        function (callback) {
          db.get()
            .collection("about4")
            .find({ _id: about_id })
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
              .deleteFile("artist/" + about_id + "/", result)
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
            .collection("about4")
            .deleteOne({ _id: about_id }, function (err, dbresult) {
              if (err) callback(err, null);
              callback(null, dbresult);
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "About deletion Failed."));
        } else {
          res.send(httpUtil.success(200, "About deleted."));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "About ID is missing."));
  }
});

module.exports = router;
