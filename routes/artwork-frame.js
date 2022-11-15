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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });
router.post("/",
  jwt.authenticateToken, upload.any("files"), async function (req, res, next) {
    const imageFiles = req.files ? req.files : [];
    const imagePath = []
    const body = req.body;
    body.createdAt = Date.now()
    body.updatedAt = null
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        let imgObj = imageFiles[i].destination + imageFiles[i].originalname
        imagePath.push(imgObj)
      }
      body.frame_images = imagePath
    }
    db.get()
      .collection("artwork-frame")
      .insertOne(body, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "artwork frame Creation Failed."));
        res.send(httpUtil.success(200, "artwork frame Created."));
      });
  })

router.get("/",
  jwt.authenticateToken, function (req, res, next) {
    db.get()
      .collection("artwork-frame")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(httpUtil.success(200, "", result));
      });
  });

router.put(
  "/",jwt.authenticateToken,
  upload.any("files"),
  jwt.authenticateToken,
  async function (req, res, next) {
    const files = req.files ? req.files : [];
    const body = req.body;
    console.log(body);
    const frame_id = body.frame_id ? ObjectId(body.frame_id) : "";
    let image, sampleImage;
    if (frame_id) {
      if (files.length) {
        db.get()
          .collection("artwork-frame")
          .find({ _id: frame_id })
          .toArray(async function (err, dbresult) {
            if (err)
              res
                .status(204)
                .send(httpUtil.error(204, "Artwork Frame updating error."));
            await s3Utility.deleteFile("frame/", dbresult[0].image.name);
            await s3Utility.deleteFile("frame/", dbresult[0].sampleImage.name);
            await s3Utility
              .uploadFile("frame/", files[0])
              .then((uploadresult) => {
                image = {
                  name: files[0].originalname,
                  mimetype: files[0].mimetype,
                  path: uploadresult,
                  size: files[0].size,
                };
              })
              .catch((err) => {
                console.log(err);
              });
            await s3Utility
              .uploadFile("frame/", files[1])
              .then((uploadresult) => {
                sampleImage = {
                  name: files[1].originalname,
                  mimetype: files[1].mimetype,
                  path: uploadresult,
                  size: files[1].size,
                };
              })
              .catch((err) => {
                console.log(err);
              });
            let data = {
              $set: {
                frame: body.frame ? body.frame : "",
                image: image,
                sampleImage: sampleImage,
                updatedAt: Date.now(),
              },
            };
            db.get()
              .collection("artwork-frame")
              .updateOne({ _id: frame_id }, data, function (err, result) {
                if (err) {
                  res
                    .status(204)
                    .send(httpUtil.error(204, "Artwork Frame updating error."));
                }
                files.forEach((file) => {
                  fs.unlinkSync("./uploads/" + file.originalname);
                });
                res.send(httpUtil.success(200, "Artwork Frame updated."));
              });
          });
      } else {
        let data = {
          $set: {
            frame: body.frame ? body.frame : "",
            updatedAt: Date.now(),
          },
        };
        db.get()
          .collection("artwork-frame")
          .updateOne({ _id: frame_id }, data, function (err, result) {
            if (err) {
              res
                .status(204)
                .send(httpUtil.error(204, "Artwork Frame updating error."));
            }
            res.send(httpUtil.success(200, "Artwork Frame updated."));
          });
      }
    } else {
      res.status(204).send(httpUtil.error(204, "Artwork Frame ID is missing."));
    }
  }
);

// router.delete("/", function (req, res, next) {
//   const frame_id = req.query.frame_id ? ObjectId(req.query.frame_id) : "";
//   if (frame_id) {
//     db.get()
//       .collection("artwork-frame")
//       .find({ _id: frame_id })
//       .toArray(async function (err, dbresult) {
//         if (err) 
//         res.status(204).send(httpUtil.error(204, "Artwork Frame deletion error."));
//       });
//   } else {
//     res.status(200).send(httpUtil.success(204, "Artwork Frame deleted"));
//   }
// });
router.delete("/",
  jwt.authenticateToken, function (req, res, next) {
    try {
      const frame_id = req.query.frame_id ? ObjectId(req.query.frame_id) : "";
      if (frame_id) {
        // unlinkAsync(req.file.path)
        db.get()
          .collection("artwork-frame")
          .deleteOne({ _id: frame_id }, function (err, result) {
            if (err)
              res.status(204).send(httpUtil.error(204, "artwork-frame deletion error."));
            res.send(httpUtil.success(200, "artwork-frame deleted."));
          });
      } else {
        res.status(204).send(httpUtil.error(204, "artwork-frame ID is missing."));
      }
    } catch (err) {
      res.send({
        status: 400,
        error: err.message,
        success: false
      })
    }

  });

module.exports = router;
