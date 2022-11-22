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

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
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

// router.post("/", upload.any("files"), async function (req, res, next) {
//   const imageFiles = req.files ? req.files : [];
//   const imagePath = []
//   const body = req.body;
//   body.artistId = ObjectId(body.artistId); 
//   if (imageFiles) {
//     for (let i = 0; i < imageFiles.length; i++) {
//       let imgObj = imageFiles[i].destination + imageFiles[i].originalname
//       imagePath.push(imgObj)
//     }
//     body.images = imagePath
//   }
//   db.get()
//     .collection("artwork")  
//     .insertOne(body, function (err, dbresult) {
//       if (err)
//         res.status(500).send(httpUtil.error(500, "artwork Creation Failed."));
//       res.send(httpUtil.success(200, "artwork Created."));
//     });
// })
router.post("/", upload.fields("images"), async function (req, res, next) {
  const imageFiles = req.files ? req.files : [];
  const imagePath = []
  const body = req.body;
  body.artistId = ObjectId(body.artistId);
  if (imageFiles) {
    for (let i = 0; i < imageFiles.length; i++) {
      let imgObj = imageFiles[i].destination + imageFiles[i].originalname
      imagePath.push(imgObj)
    }
    body.images = imagePath
  }

  const data = {
    artworkName : body.artworkName,
    artistId : body.artistId,
    shortDescription : body.shortDescription,
    buyPrice : body.buyPrice,
    rentPrice : body.rentPrice,
    frames : body.frames,
    artworkImage : body.artworkImage,
    artworkType : body.artworkTypeId,
    paintingCategory : body.paintingCategoryId,
    paintingStyle : body.paintingStyleId,
    paintingTechniques : body.paintingTechniquesId
    
  }
  db.get()
    .collection("artwork")
    .insertOne(body, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "artwork Creation Failed."));
      db.get()
        .collection("artwork")
        .find({ artistId : body.artistId })
        .toArray(function (err, result) {
          if (err) console.log(err);
          db.get().collection("artist").updateOne({ _id: body.artistId }, { $set: { painting : result } }, function (err, dbresult) {
            res.send({
              dbresult
            })
            if (err) {
              res
                .status(500)
                .send(httpUtil.error(500, "Artwork creation Failed."));
            }
          })
          res.send(httpUtil.success(200, "Artwork Created"));
        });
    });
})

router.put("/",jwt.authenticateToken, upload.any("files"), async function (req, res, next) {
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

router.patch("/",jwt.authenticateToken, function (req, res, next) {
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

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const artwork_id = req.query.artwork_id ? ObjectId(req.query.artwork_id) : "";
  if (artwork_id) {
    // unlinkAsync(req.file.path)
    db.get() 
      .collection("artwork")
      .deleteMany({ technique : "colour" }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "artwork deletion error."));
        res.send(httpUtil.success(200, "artwork deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "artwork ID is missing."));
  }
});

module.exports = router;