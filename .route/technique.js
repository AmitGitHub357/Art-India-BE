var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");

// router.get("/", jwt.authenticateToken, function (req, res, next) {
// const type = req.query.type
// ? req.query.type.split(" ").join("").toLowerCase() : "";
// if (type) {
//   db.get()
//     .collection(type + "-technique")
//     .find({})
//     .toArray(function (err, result) {
//       if (err) throw err;
//       res.send(httpUtil.success(200, "", result));
//     });
// // } else {
//   res.status(204).send(httpUtil.error(204, "Type is missing."));
// }
// });

router.get("/", jwt.authenticateToken, (req, res, next) => {
  db.get()
    .collection("technique")
    .find({})
    .toArray(function (err, result) {
      if (err)
        throw err;
      else {
        res.send(httpUtil.success(200, "", result))
      }
    })
})

// router.post("/", jwt.authenticateToken, function (req, res, next) {
//   // const type = req.body.type
//     ? req.body.type.split(" ").join("").toLowerCase()
//     : "";
//   if (type) {
//     const data = {
//       technique: req.body.technique ? req.body.technique : "",
//       createdAt: Date.now(),
//       updatedAt: null,
//     };
//     db.get()
//       .collection(type + "-technique")
//       .insertOne(data, function (err, dbresult) {
//         if (err) {
//           res
//             .status(500)
//             .send(httpUtil.error(500, "Technique Creation Failed."));
//         }
//         res.send(httpUtil.success(200, "Technique Created."));
//       });
//   } else {
//     res.status(204).send(httpUtil.error(204, "Type is missing."));
//   }
// });
router.post("/", jwt.authenticateToken, function (req, res, next) {  
  const body = req.body
  body.createdAt = Date.now()
  body.updatedAt = null
  // };
  db.get()
    .collection("technique")
    .insertOne(body, function (err, dbresult) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "technique Creation Failed."));
      }
      res.send(httpUtil.success(200, "technique Created."));
    });
});

router.put("/", jwt.authenticateToken, function (req, res, next) {
  // const type = req.body.type
  //   ? req.body.type.split(" ").join("").toLowerCase()
  //   : "";
  const technique_id = req.body.technique_id
    ? ObjectId(req.body.technique_id)
    : "";
  if (technique_id) {
    let Id = { _id: technique_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : "Active",
        technique: req.body.technique ? req.body.technique : "",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("technique")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Technique updating error."));
        }
        res.send(httpUtil.success(200, "Technique updated."));
      });
  } else {
    res
      .status(204)
      .send(httpUtil.error(204, "Tye or Technique ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  // const type = req.query.type
  // ? req.query.type.split(" ").join("").toLowerCase()
  // : "";
  const technique_id = req.query.technique_id
    ? ObjectId(req.query.technique_id)
    : "";
  if (technique_id) {
    db.get()
      .collection("technique")
      .deleteOne({ _id: technique_id }, function (err, result) {
        if (err) {
          res
            .status(204)
            .send(httpUtil.error(204, "Technique deletion error."));
        }
        res.send(httpUtil.success(200, "Technique deleted."));
      });
  } else {
    res
      .status(204)
      .send(httpUtil.error(204, "Tye or Technique ID is missing."));
  }
});

module.exports = router;
