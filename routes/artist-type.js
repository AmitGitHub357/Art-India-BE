var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", jwt.authenticateToken,function (req, res, next) {
  db.get()
    .collection("artist-type")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", jwt.authenticateToken,function (req, res, next) {
  // const data = {
  //   type: req.body.type ? req.body.type : "",
  //   status : req.body.status ? req.body.status : "Active",
    const body = req.body
    body.createdAt = Date.now()
    body.updatedAt = null
  // };
  db.get()
    .collection("artist-type")
    .insertOne(body, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Artist Type Creation Failed."));
      }
      res.send(httpUtil.success(200, "Artist Type Created."));
    });
});

router.put("/", jwt.authenticateToken, function (req, res, next) {
  const type_id = req.body.type_id ? ObjectId(req.body.type_id) : "";
  if (type_id) {
    let Id = { _id: type_id };
    let data = {
      $set: {
        type: req.body.type ? req.body.type : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("artist-type")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Artist Type updating error."));
        }
        res.send(httpUtil.success(200, "Artist Type updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artist Type ID is missing."));
  }
});

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const type_id = req.query.type_id ? ObjectId(req.query.type_id) : "";
  if (type_id) {
    db.get()
      .collection("artist-type")
      .deleteOne({ _id: type_id }, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Artist Type deletion error."));
        }
        res.send(httpUtil.success(200, "Artist Type deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artist Type ID is missing."));
  }
});

module.exports = router;