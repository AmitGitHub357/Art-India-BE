var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/",jwt.authenticateToken, function (req, res, next)
{
  const type = req.query.type
    ? req.query.type.split(" ").join("").toLowerCase()
    : "";
  if (type) {
    db.get()
      .collection(type + "-style")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(httpUtil.success(200, "", result));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Type is missing."));
  }
});

router.post("/",jwt.authenticateToken, function (req, res, next) {
  const type = req.body.type
    ? req.body.type.split(" ").join("").toLowerCase()
    : "";
  if (type) {
    const data = {
      type : req.body.type ? req.body.type : "",
      style: req.body.style ? req.body.style : "",
      createdAt: Date.now(),
      updatedAt: null,
    };
    db.get()
      .collection(type + "-style")
      .insertOne(data, function (err, dbresult) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "Style Creation Failed."));
        }
        res.send(httpUtil.success(200, "Style Created."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Type is missing."));
  }
});

router.put("/",jwt.authenticateToken, function (req, res, next) {
  const type = req.body.type
    ? req.body.type.split(" ").join("").toLowerCase()
    : "";
  const style_id = req.body.style_id ? ObjectId(req.body.style_id) : "";
  if (type && style_id) { 
    let Id = { _id: style_id };
    let data = {
      $set: {
        style: req.body.style ? req.body.style : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection(type + "-style")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Style updating error."));
        }
        res.send(httpUtil.success(200, "Style updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Tye or Style ID is missing."));
  }
});

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const type = req.query.type
    ? req.query.type.split(" ").join("").toLowerCase()
    : "";
  const style_id = req.query.style_id ? ObjectId(req.query.style_id) : "";
  if (type && style_id) {
    db.get()
      .collection(type + "-style")
      .deleteOne({ _id: style_id }, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Style deletion error."));
        }
        res.send(httpUtil.success(200, "Style deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Type or Style ID is missing."));
  }
});

module.exports = router;