var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", function (req, res, next) {
  const type = req.query.type
    ? req.query.type.split("").join("").toLowerCase()
    : "";
  if (type) {
    db.get()
      .collection(type + "-category") 
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
      category: req.body.category ? req.body.category : "",
      type : req.body.type ? req.body.type : "",
      status : "Active",
      createdAt: Date.now(),
      updatedAt: null,
    };
    db.get()
      .collection(type + "-category")
      .insertOne(data, function (err, dbresult) {
        if (err) {
          res
            .status(500)
            .send(httpUtil.error(500, "Category Creation Failed."));
        }
        res.send(httpUtil.success(200, "Category Created."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Type is missing."));
  }
});

router.put("/",jwt.authenticateToken, function (req, res, next) {
  const type = req.body.type
    ? req.body.type.split(" ").join("").toLowerCase()
    : "";
  const category_id = req.body.category_id
    ? ObjectId(req.body.category_id)
    : "";
  if (type && category_id) {
    let Id = { _id: category_id };
    let data = {
      $set: {
        category: req.body.category ? req.body.category : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection(type + "-category")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Category updating error."));
        }
        res.send(httpUtil.success(200, "Category updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Tye or Category ID is missing."));
  }
});

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const type = req.query.type
    ? req.query.type.split(" ").join("").toLowerCase()
    : "";
  const category_id = req.query.category_id
    ? ObjectId(req.query.category_id)
    : "";
  if (type && category_id) {
    db.get()
      .collection(type + "-category")
      .deleteOne({ _id: category_id }, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Category deletion error."));
        }
        res.send(httpUtil.success(200, "Category deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Tye or Category ID is missing."));
  }
});

module.exports = router;
