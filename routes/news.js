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
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require("path");
// const { resolve } = require("path");
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
const absolutePath = path.join(__dirname);
console.log(absolutePath)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/news/");
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname);
  },
});

var upload = multer({ storage: storage });
router.get("/", function (req, res, next) {
  db.get()
    .collection("news")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
  try {
    const imageFiles = req.files ? req.files : [];
    const imagePath = []
    const body = req.body;
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        let imgObj = "http://localhost:3000/" + `${imageFiles[i].destination}` + `${imageFiles[i].originalname}`
        imagePath.push(imgObj)
      }
      body.images = imagePath
    }
    db.get()
      .collection("news")
      .insertOne(body, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "news Creation Failed."));
        res.send(httpUtil.success(200, "news Created."));
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

router.get("/:id", jwt.authenticateToken, function (req, res, next) {
  const _id = req.params.id ? ObjectId(req.params.id) : ""
  db.get()
    .collection("news")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.patch("/", jwt.authenticateToken, function (req, res, next) {
  const news_id = req.body.news_id ? ObjectId(req.body.news_id) : "";
  if (news_id) {
    let Id = { _id: news_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : "Active",
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("news")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "news updating error."));
        }
        res.send(httpUtil.success(200, "news updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "news ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const news_id = req.query.news_id ? ObjectId(req.query.news_id) : "";
  if (news_id) {
    db.get()
      .collection("news")
      .deleteOne({ _id: news_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "news deletion error."));
        res.send(httpUtil.success(200, "news deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "news ID is missing."));
  }
});

router.put("/", jwt.authenticateToken,upload.array("images"), function (req, res, next) {  
  try {
    const news_id = req.body.news_id ? ObjectId(req.body.news_id) : "";
    if (news_id) {
      let Id = { _id: news_id };
      const imageFiles = req.files ? req.files : [];
      const imagePath = []
      const body = req.body;
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          let imgObj = "http://localhost:3000/" + `${imageFiles[i].destination}` + `${imageFiles[i].originalname}`
          imagePath.push(imgObj)
        } 
      } 
      body.images = imagePath
      let data = {
        $set: {
          images: body.images ? body.images : "",
          title: body.title ? body.title : "",
          description: body.description ? body.description : "",
          status: body.status ? body.status : "",
          updatedAt: Date.now()
        },
      };
      db.get()
        .collection("news")
        .updateOne(Id, data, function (err, dbresult) {
          if (err)
            res.status(500).send(httpUtil.error(500, "news Update Failed."));
          res.send(httpUtil.success(200, "news Updated."));
        });
    }
  }
  catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

module.exports = router;