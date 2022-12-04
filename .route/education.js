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
        cb(null, "public/uploads/education/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
});

var upload = multer({ storage: storage });

router.get("/", jwt.authenticateToken, function (req, res, next) {
    db.get()
        .collection("education")
        .find({})
        .toArray(function (err, result) {
            if (err) console.log(err);
            res.send(httpUtil.success(200, "", result));
        });
});

// router.post("/", jwt.authenticateToken, upload.array("images"), async function (req, res, next) {
//   // console.log(__dirname + '../../')
//   var imagesPath = [], framePath = []
//   var imagesFile = [], frameFile = []
//   var body = req.body;
//   if (Object.keys(req.files).length != 0) {
//     if (Object.keys(req.files).includes('images')) {
//       imagesFile = await req.files.images
//     }
//     if (Object.keys(req.files).includes('frameImages')) {
//       frameFile = await req.files.frameImages
//     }
//   }
//   if (imagesFile.length != 0) {
//     for (let i = 0; i < imagesFile.length; i++) {
//       // let imgObj = "http://localhost:3000/" + imagesFile[i].destination.slice(1) + imagesFile[i].filename
//       let imgObj = "http://localhost:3000/" + `${imagesFile[i].destination}` + `${imagesFile[i].originalname}`
//       imagesPath.push(imgObj)
//     }
//     body.images = imagesPath
//   }
//   if (frameFile.length != 0) {
//     for (let i = 0; i < frameFile.length; i++) {
//       let imgObj = "http://localhost:3000/" + `${frameFile[i].destination}` + `${frameFile[i].originalname}`
//       framePath.push(imgObj)
//     }
//     body.frameImages = framePath
//   }
//   const data = {
//     artworkName: body.artworkName,
//     artistId: body.artistId,
//     shortDescription: body.shortDescription,
//     buyPrice: body.buyPrice,
//     rentPrice: body.rentPrice,
//     size : body.size,
//     oriention : body.oriention,
//     frameImage: body.frameImages,
//     length : body.length,
//     width : body.width,
//     likes : body.likes ? body.likes : "0",
//     artworkImage: body.images,
//     paintingCategory: body.painting_category,
//     paintingArtwork: body.painting_artwork,
//     paintingStyle: body.painting_style,
//     paintingTechniques: body.painting_technique
//   }
//   db.get()
//     .collection("artwork")
//     .insertOne(data, function (err, dbresult) {
//       if (err)
//         res.status(500).send(httpUtil.error(500, "artwork Creation Failed."));
//       db.get().collection("artwork").find({ artistId: body.artistId }).toArray(function (err, result) {
//         if (err) res.send(err);
//         db.get().collection("artist").updateOne({ _id: ObjectId(body.artistId) }, { $set: { painting: result } }, function (err, result) {
//           if (err) {
//             res.status(204).send(httpUtil.error(204, err.message));
//           }
//           else
//             res.send({
//               status : 200,
//               success : true,
//               message : "Artwork Created"
//             })
//           // db.get().collection("artist-type").find({ _id : body.artworkTypeId }).toArray(function (err, result) {
//           //   console.log(result)
//           //   if (err) res.send(err);
//           //     res.status(204).send(httpUtil.error(204,err.message));
//           //     db.get().collection("artist").updateOne({ type_id : ObjectId(body.artworkTypeId) }, { $set: { artist_type : result } }, function (err, result) 
//           //     { console.log(result)
//           //       if (err) 
//           //         res.status(204).send(httpUtil.error(204,err.message));

//           //     })
//           // })
//         });
//       });
//       // res.send(httpUtil.success(200, "artwork Created."));
//     });
// })
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
        const data = {
            title: body.title,
            shortDescription: body.shortDescription,
            description: body.description,
            heading: body.heading,
            images: body.images,
            status: body.status ? body.status : "Active"
        }
        db.get()
            .collection("education")
            .insertOne(data, function (err, dbresult) {
                if (err)
                    res.status(500).send(httpUtil.error(500, "education Creation Failed."));
                res.send(httpUtil.success(200, "education Created."));
            });
    } catch (err) {
        res.send({
            status: 400,
            error: err.message,
            success: false
        })
    }
});

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
    try {
        const education_id = req.query.education_id ? ObjectId(req.query.education_id) : "";
        if (education_id) {
            // unlinkAsync(req.file.path)
            db.get()
                .collection("education")
                .deleteMany({ _id: education_id }, function (err, result) {
                    if (err)
                        res.status(204).send(httpUtil.error(204, "education deletion error."));
                    res.send(httpUtil.success(200, "education deleted."));
                });
        } else {
            res.status(204).send(httpUtil.error(204, "education ID is missing."));
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