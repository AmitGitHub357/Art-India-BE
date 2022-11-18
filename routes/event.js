var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

router.get("/", function (req, res, next) {
  db.get()
    .collection("event")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/:event_id", function (req, res, next) {
  // res.send({ req : req.params})
  const _id = req.params.event_id ? ObjectId(req.params.event_id) : ""
  db.get()
    .collection("event")
    .find( { _id : _id } ) 
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", function (req, res, next) { 
    const data = {
    name: req.body.name ? req.body.name : "",
    type: req.body.type ? req.body.type : "",
    start: req.body.start ? req.body.start : "",
    stop: req.body.stop ? req.body.stop : "",
    place: req.body.place ? req.body.place : "",
    limit: req.body.limit ? req.body.limit : "",
    participant: req.body.participant ? req.body.participant : [],
    winner: req.body.winner ? req.body.winner : [],
    createdAt: Date.now(),
    updatedAt: null,
    status: req.body.status ? req.body.status : "Active",
  };
  db.get()
    .collection("event")
    .insertOne(data, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "Event Creation Failed."));
      res.send(httpUtil.success(200, "Event Created."));
    });
});

router.put("/", function (req, res, next) {
  const event_id = req.body.event_id ? ObjectId(req.body.event_id) : "";
  if (event_id) {
    let Id = { _id: event_id };
    const body = req.body
    // res.send({
    //   Id,
    //   body
    // });
    let data = {
      $set: {
        name: req.body.name ,
        type: req.body.type ,start: req.body.start ,
        stop: req.body.stop ,
        place: req.body.place ,
        limit: req.body.limit ,
        participant: req.body.participant ,
        winner: req.body.winner ,
        updatedAt: Date.now(),
      },
    };
    

    db.get()
      .collection("event")
      .updateOne(Id._id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Event updating error."));
        }
        res.send(httpUtil.success(200, "Event updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Event ID is missing."));
  }
});

router.patch("/", function (req, res, next) {
  const event_id = req.body.event_id ? ObjectId(req.body.event_id) : "";
  if (event_id) {
    let Id = { _id: event_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("event")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Event updating error."));
        }
        res.send(httpUtil.success(200, "Event updated."));
      });
  } 
  else 
  {
    res.status(204).send(httpUtil.error(204, "Event ID is missing."));
  }
});

router.delete("/", function (req, res, next) {
  const event_id = req.query.event_id ? ObjectId(req.query.event_id) : "";
  if (event_id) {
    db.get()
      .collection("event")
      .deleteOne({ _id: event_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "Event deletion error."));
        res.send(httpUtil.success(200, "Event deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Event ID is missing."));
  }
});

module.exports = router;