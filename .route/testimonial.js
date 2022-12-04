var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("testimonial")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", jwt.authenticateToken, function (req, res, next) {
  const data = {
    name: req.body.name ? req.body.name : "",
    testimonial: req.body.testimonial ? req.body.testimonial : "",
    createdAt: Date.now(),
    updatedAt: null,
  };
  db.get()
    .collection("testimonial")
    .insertOne(data, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Testimonial Creation Failed."));
      }
      res.send(httpUtil.success(200, "Testimonial Created."));
    });
});

router.put("/",jwt.authenticateToken, function (req, res, next) {
  const testimonial_id = req.body.testimonial_id ? ObjectId(req.body.testimonial_id) : "";
  if (testimonial_id) {
    let Id = { _id: testimonial_id };
    let data = {
      $set: {
        name: req.body.name ? req.body.name : "",
        testimonial: req.body.testimonial ? req.body.testimonial : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("testimonial")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Testimonial updating error."));
        }
        res.send(httpUtil.success(200, "Testimonial updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Testimonial ID is missing."));
  }
});

router.delete("/",  function (req, res, next) {
  const testimonial_id = req.query.testimonial_id ? ObjectId(req.query.testimonial_id) : "";
  if (testimonial_id) {
    db.get()
      .collection("testimonial")
      .deleteOne({ _id: testimonial_id }, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Testimonial deletion error."));
        }
        res.send(httpUtil.success(200, "Testimonial deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Testimonial ID is missing."));
  }
});

module.exports = router;