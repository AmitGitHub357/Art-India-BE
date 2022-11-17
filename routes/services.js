var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");
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
    .collection("services")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const services_id = req.query.services_id ? ObjectId(req.query.services_id) : "";
  if (services_id) {
    // unlinkAsync(req.file.path)
    db.get()
      .collection("services")
      .deleteOne({ _id: services_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "services deletion error."));
        res.send(httpUtil.success(200, "services deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "services ID is missing."));
  }
});

router.post("/", jwt.authenticateToken, upload.any("files"), function (req, res, next) { 
  // res.send({
  //   file : req.files
  // })
  try {
    const imageFiles = req.files ? req.files : [];
    const imagePath = []
    const body = req.body;
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        let imgObj = imageFiles[i].destination + Date.now() + imageFiles[i].originalname
        imagePath.push(imgObj)
      }
      body.images = imagePath
    }
    db.get()
      .collection("services")
      .insertOne(body, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "Services Creation Failed."));
        res.send(httpUtil.success(200, "Services Created."));
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

router.put("/", jwt.authenticateToken, function (req, res, next) {
  const service_id = req.body.service_id ? ObjectId(req.body.service_id) : "";
  const title = req.body.title ? req.body.title : "";
  const description = req.body.description ? req.body.description : "";
  const points = req.body.points ? req.body.points : [];
  if (service_id) {
    let Id = { _id: service_id };
    let data = {
      $set: {
        title: title,
        description: description,
        points: points,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("services")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Service updating error."));
        }
        res.send(httpUtil.success(200, "Service updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Service ID is missing."));
  }
});

module.exports = router;
