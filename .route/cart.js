var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");
var multer = require("multer");
var fs = require("fs");
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/public/uploads/cart/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
});
var upload = multer({ storage: storage });

router.get("/", function (req, res, next) {
  db.get()
    .collection("cart")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/:cart_id", function (req, res, next) {

  const _id = req.params.cart_id ? ObjectId(req.params.cart_id) : ""
  db.get()
    .collection("cart")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", upload.any("files"), async function (req, res, next) {
  // const imageFiles = req.files ? req.files : [];
  // const imagePath = []
  // const body = req.body;
  // if (imageFiles) {
  //   for (let i = 0; i < imageFiles.length; i++) {
  //     let imgObj = imageFiles[i].destination + imageFiles[i].originalname
  //     imagePath.push(imgObj)
  //   }
  //   body.images = imagePath
  // }
  // db.get()
  //   .collection("cart")
  //   .insertOne(body, function (err, dbresult) {
  //     if (err)
  //       res.status(500).send(httpUtil.error(500, "cart Creation Failed."));
  //     res.send(httpUtil.success(200, "cart Created."));
  //   });
  // });
})

router.put("/:cart_id", function (req, res, next) {
  const cart_id = req.params.cart_id ? ObjectId(req.params.cart_id) : "";
  if (cart_id) {
    let Id = { _id: cart_id };
    const body = req.body
    let data = {
      $set: {
        quantity: body.quantity,
        updatedAt: Date.now(),
      },
    };

    db.get()
      .collection("cart")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "cart updating error."));
        }
        res.send(httpUtil.success(200, "cart updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "cart ID is missing."));
  }
});

router.patch("/", function (req, res, next) {
  const cart_id = req.body.cart_id ? ObjectId(req.body.cart_id) : "";
  if (cart_id) {
    let Id = { _id: cart_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("cart")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "cart updating error."));
        }
        res.send(httpUtil.success(200, "cart updated."));
      });
  }
  else {
    res.status(204).send(httpUtil.error(204, "cart ID is missing."));
  }
});

router.delete("/", function (req, res, next) {
  const cart_id = req.query.cart_id ? ObjectId(req.query.cart_id) : "";
  if (cart_id) {
    db.get()
      .collection("cart")
      .deleteOne({ _id: cart_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "cart deletion error."));
        res.send(httpUtil.success(200, "cart deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "cart ID is missing."));
  }
});

module.exports = router;
