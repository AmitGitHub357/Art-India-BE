var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", function (req, res, next) {
  db.get()
    .collection("volunteer-program")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", jwt.authenticateToken, function (req, res, next) {
  const data = {
    program: req.body.program ? req.body.program : "",
    createdAt: Date.now(),
    updatedAt: null,
  };
  db.get()
    .collection("volunteer-program")
    .insertOne(data, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Volunteer Program Creation Failed."));
      }
      res.send(httpUtil.success(200, "Volunteer Program Created."));
    });
});

router.put("/", jwt.authenticateToken, function (req, res, next) {
  const program_id = req.body.program_id ? ObjectId(req.body.program_id) : "";
  if (program_id) {
    let Id = { _id: program_id };
    let data = {
      $set: {
        program: req.body.program ? req.body.program : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("volunteer-program")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Volunteer Program updating error."));
        }
        res.send(httpUtil.success(200, "Volunteer Program updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Volunteer Program ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const program_id = req.query.program_id ? ObjectId(req.query.program_id) : "";
  if (program_id) {
    db.get()
      .collection("volunteer-program")
      .deleteOne({ _id: program_id }, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Volunteer Program deletion error."));
        }
        res.send(httpUtil.success(200, "Volunteer Program deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Volunteer Program ID is missing."));
  }
});

module.exports = router;
