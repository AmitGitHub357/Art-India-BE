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
var path = require("path");
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/artwork/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
});

var upload = multer({ storage: storage });
router.get("/", function (req, res, next) {
  db.get()
    .collection("artwork")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});


router.post("/", jwt.authenticateToken, upload.fields([{ name: "images" }, { name: "frameImages", maxCount: 20 }]), async function (req, res, next) {
  var imagesPath = [], framePath = []
  var imagesFile = [], frameFile = []
  var body = req.body;
  if (Object.keys(req.files).length != 0) {
    if (Object.keys(req.files).includes('images')) {
      imagesFile = await req.files.images
    }
    if (Object.keys(req.files).includes('frameImages')) {
      frameFile = await req.files.frameImages
    }
  }
  if (imagesFile.length != 0) {
    for (let i = 0; i < imagesFile.length; i++) {
      let imgObj = "http://localhost:3000/uploads/artwork/" + `${imagesFile[i].originalname}`
      imagesPath.push(imgObj)
    }
    body.images = imagesPath
  }
  if (frameFile.length != 0) {
    for (let i = 0; i < frameFile.length; i++) {
      let imgObj = "http://localhost:3000/uploads/artwork/" + `${frameFile[i].originalname}`
      framePath.push(imgObj)
    }
    body.frameImages = framePath
  }
  const data = {
    artworkName: body.artworkName,
    artistId: ObjectId(body.artistId),
    shortDescription: body.shortDescription,
    description: body.description,
    buyPrice: body.buyPrice,
    rentPrice: body.rentPrice,
    size: body.size,
    // oriention: body.oriention,
    frameImage: body.frameImages,
    length: body.length,
    width: body.width,
    likes: body.likes ? body.likes : "0",
    artworkImage: body.images,
    discount: body.discount,
    category: body.category,
    artwork: body.artwork,
    style: body.style,
    techniques: body.technique,
    buyStatus: body.buyStatus ? body.buyStatus : false
  }
  db.get()
    .collection("artwork")
    .insertOne(data, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "artwork Creation Failed."));
      else
        res.send({
          status: 200,
          success: true,
          message: "Artwork Created"
        })
    });
});
// res.send(httpUtil.success(200, "artwork Created."));
//     });
// })

router.put("/", jwt.authenticateToken, upload.any("files"), async function (req, res, next) {
  const files = req.files ? req.files : [];
  const body = req.body.data;
  const artwork_id = body.artwork_id ? ObjectId(body.artwork_id) : "";
  let mainImage;
  let supplementImages = [];
  let oldImages = [];
  if (artwork_id) {
    const data = {
      $set: {
        name: body.name ? body.name : "",
        description: body.description ? body.description : "",
        price: body.price ? parseInt(body.price) : "",
        type: body.type ? body.type : "",
        category: body.category ? body.category : "",
        style: body.style ? body.style : "",
        technique: body.technique ? body.technique : "",
        size: {
          length: body.length ? parseInt(body.length) : "",
          width: body.width ? parseInt(body.width) : "",
        },
        orientation: body.orientation ? body.orientation : "",
        discount: body.discount ? parseInt(body.discount) : "",
        tagline: body.tagline ? body.tagline : "",
        artist: {
          artistId: body.artistId ? ObjectId(body.artistId) : "",
          artistName: body.artistName ? body.artistName : "",
        },
        updatedAt: Date.now(),
      },
    };
    if (files.length) {
      await db
        .get()
        .collection("artwork")
        .find({ _id: artwork_id })
        .toArray(async function (err, dbresult) {
          if (err) callback(err, null);
          oldImages.push(dbresult[0]["image"]);
          if (dbresult[0]["supplementImages"]) {
            await dbresult[0]["supplementImages"].forEach((img) => {
              oldImages.push(img);
            });
          }
          await asyncForEach(oldImages, async (file) => {
            s3Utility.deleteFile("artwork/" + body.artistId + "/", file.name);
          });
          await asyncForEach(files, async (file, index) => {
            await s3Utility
              .uploadFile("artwork/" + body.artistId + "/", file)
              .then((uploadresult) => {
                if (index) {
                  supplementImages.push({
                    name: file.originalname,
                    mimetype: file.mimetype,
                    path: uploadresult,
                    size: file.size,
                  });
                } else {
                  mainImage = {
                    name: file.originalname,
                    mimetype: file.mimetype,
                    path: uploadresult,
                    size: file.size,
                  };
                }
              })
              .catch((err) => {
                console.log(err);
              });
          });
          data.$set.image = mainImage;
          data.$set.supplementImages = supplementImages;
          db.get()
            .collection("artwork")
            .updateOne({ _id: artwork_id }, data, function (err, dbresult) {
              if (err) {
                res
                  .status(500)
                  .send(httpUtil.error(500, "Artwork updating Failed."));
              }
              files.forEach((file) => {
                fs.unlinkSync("./uploads/" + file.originalname);
              });
              res.send(httpUtil.success(200, "Artwork updated."));
            });
        });
    } else {
      db.get()
        .collection("artwork")
        .updateOne({ _id: artwork_id }, data, function (err, dbresult) {
          if (err) {
            res
              .status(500)
              .send(httpUtil.error(500, "Artwork updating Failed."));
          }
          res.send(httpUtil.success(200, "Artwork updated."));
        });
    }
  } else {
    res.status(204).send(httpUtil.error(204, "Artwork ID is missing."));
  }
});

router.patch("/", jwt.authenticateToken, function (req, res, next) {
  const artwork_id = req.body.artwork_id ? ObjectId(req.body.artwork_id) : "";
  if (artwork_id) {
    let Id = { _id: artwork_id };
    let data = {
      $set: {
        status: req.body.status ? "SOLD" : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("artwork")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Artwork updating error."));
        }
        res.send(httpUtil.success(200, "Artwork updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artwork ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const artwork_id = req.query.artwork_id ? ObjectId(req.query.artwork_id) : "";
  if (artwork_id) {
    // unlinkAsync(req.file.path)
    db.get()
      .collection("artwork")
      .deleteMany({ buyPrice: "3000" }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "artwork deletion error."));
        res.send(httpUtil.success(200, "artwork deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "artwork ID is missing."));
  }
});

module.exports = router;