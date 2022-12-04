var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("artwork-type")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", jwt.authenticateToken, function (req, res, next) {
  const data = {
    type: req.body.type ? req.body.type : "",
    createdAt: Date.now(),
    updatedAt: null,
  };
  db.get()
    .collection("artwork-type")
    .insertOne(data, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Artwork Type Creation Failed."));
      }
      res.send(httpUtil.success(200, "Artwork Type Created."));
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
      .collection("artwork-type")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Artwork Type updating error."));
        }
        res.send(httpUtil.success(200, "Artwork Type updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artwork Type ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const type_id = req.query.type_id ? ObjectId(req.query.type_id) : "";
  if (type_id) {
    db.get()
      .collection("artwork-type")
      .deleteOne({ _id: type_id }, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Artwork Type deletion error."));
        }
        res.send(httpUtil.success(200, "Artwork Type deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artwork Type ID is missing."));
  }
});

module.exports = router;
