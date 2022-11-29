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
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", function (req, res, next) {
  // res.send({ req : req.body })
  const body = req.body
  try {
    const data = {
      name: req.body.name ? req.body.name : "",
      completed: body.completed,
      description: {
        shortDescription: body.shortDescription,
        description: body.description
      },
      event_type: req.body.event_type ? req.body.event_type : "",
      start_date: req.body.start_date ? req.body.start_date : "",
      end_date: req.body.end_date ? req.body.end_date : "",
      // place: req.body.place ? req.body.place : "",
      // limit: req.body.limit ? req.body.limit : "",
      participant: req.body.participant ? req.body.participant : [],
      winner: req.body.winner ? req.body.winner : [],
      createdAt: Date.now(),
      updatedAt: null,
      status: req.body.status ? req.body.status : "Active",
    };
    console.log(data)
    db.get()
      .collection("event")
      .insertOne(data, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "Event Creation Failed."));
        res.send(httpUtil.success(200, "Event Created."));
      });
  } catch (err) {
    res.send({
      status: 400,
      success: false,
      error: err.message
    })
  }
});

router.put("/", function (req, res, next) {
  const event_id = req.body.event_id ? ObjectId(req.body.event_id) : "";
  if (event_id) {
    let Id = { _id: event_id };
    const body = req.body
    let data = {
      $set: {
        name: req.body.name,
        type: req.body.type, start: req.body.start,
        stop: req.body.stop,
        place: req.body.place,
        limit: req.body.limit,
        participant: req.body.participant,
        winner: req.body.winner,
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

router.put("/status", function (req, res, next) {
  const event_id = req.body.event_id ? ObjectId(req.body.event_id) : "";
  const event_status = req.body.event_status ? ObjectId(req.body.event_status) : "";
  // const event_completed = req.body.event_completed ? ObjectId(req.body.event_completed) : "";

  if (event_id) {
    let Id = { _id: event_id };
    let data = {
      $set: {
        status: req.body.event_status ? req.body.event_status : "Active",
        updatedAt: Date.now(),
      },
    };

    db.get()
      .collection("event")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Event updating error."));
        }
        res.send(httpUtil.success(200, "Event status updated."));
      });
  }
  else {
    res.status(204).send(httpUtil.error(204, "Event ID is missing."));
  }
});

// router.put("/featured", jwt.authenticateToken, function (req, res, next) {
//   // res.send({ body : req.body })
//   try {
//     const event_id = req.body.event_id ? ObjectId(req.body.event_id) : ""
//     const event_completed = req.body.event_completed ? ObjectId(req.body.event_completed) : "";
//     if (event_id) {
//       let Id = { _id: event_id };
//       let data = {
//         $set: {
//           completed: event_completed ? event_completed : "",
//           updatedAt: Date.now(),
//         },
//       };
//       db.get()
//         .collection("event")
//         .updateOne(Id, data, function (err, result) {
//           if (err) {     
//             res.status(204).send(httpUtil.error(204, "Event updating error."));
//           }
//           res.send(httpUtil.success(200, "Event featured updated."));
//         });
//     }
//     else {
//       res.status(204).send(httpUtil.error(204, "Event ID is missing."));
//     }
//   }catch(err){
//     res.send({
//       status : 400,
//       error : err.message,
//       success : false
//     })
//   }
// });

router.put("/featured", jwt.authenticateToken, function (req, res, next) {
  const event_id = req.body.event_id ? ObjectId(req.body.event_id) : "";
  if (event_id) {
    let Id = { _id: event_id };
    let data = {
      $set: {
        completed: req.body.completed ? req.body.completed : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("event")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "event updating error."));
        }
        res.send(httpUtil.success(200, "event featured updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "event ID is missing."));
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