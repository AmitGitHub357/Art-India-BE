var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");
var async = require("async");
var s3Utility = require("../utilities/s3-bucket");
var multer = require("multer");
var fs = require("fs");

// router.get("/", function (req, res, next) {
// try {
//     // const key = req;
//     const key = req.query.key ? ObjectId(req.query.key) : "";
//     db.get().collection("artwork").find({ $or: [{ name: { $regex: key } }, { description: { $regex: key } }, { technique: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }] })
//         .toArray(function (err, result) {
//             if (err) console.log(err);
//             else {
//                 console.log("api")
//                 res.send(httpUtil.success(200, "", result));
//             }
//         });
// } catch (err) {
//     res.send({
//         error: err.message
//     });
// }
// });
// router.get("/:key", function (req, res, next) {
//     // try {
//         // const key = req;
//         // const key = req.query.key ? ObjectId(req.query.key) : "";
//         const key = req.params.key ? ObjectId(req.params.key) : ""
        // db.get().collection("artwork").find({ $or: [{ name: { $regex: key } }, { description: { $regex: key } }, { technique: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }] })
//             .toArray(function (err, result) {
//                 if (err) console.log(err);
//                 else {
//                     console.log("api")
//                     res.send(httpUtil.success(200, "", result));
//                 }
//             })
//     // } 
//     // catch (err) {
//         // res.send({
//         //     error: err.message
//         // });
//     // }
// })

router.get("/:key", function (req, res, next) {
    try{
        const key = req.params.key
        // res.send({
        //     key : req.params
        // })
        // db.get().collection("news")$or: [{ name: { $regex: key } }, { description: { $regex: key } }, { technique: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }] 
        db.get().collection("artwork").find({ $or: 
            [{ name: { $regex: key } }, { description: { $regex: key } }, { technique: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }] })
          .toArray(function (err, result) {
            if (err) console.log(err)
            res.send(httpUtil.success(200, "Success", result))
          });
    }catch(err){
        res.send(httpUtil.error(400, { error : err.message }))
    }
  });
// const _id = req.params.id ? ObjectId(req.params.id) : ""
// db.get()
//   .collection("news")
//   .find({ _id: _id })
//   .toArray(function (err, result) {
//     if (err) console.log(err);
//     res.send(httpUtil.success(200, "", result));
//   });
//   });

module.exports = router;