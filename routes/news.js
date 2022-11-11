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
// var jwt = require("../utilities/jwt")
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
    .collection("news")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/:id",jwt.authenticateToken, function (req, res, next) {
  const _id = req.params.id ? ObjectId(req.params.id) : ""
  db.get()
    .collection("news")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});
//
// await asyncForEach(files, async (file, index) => {
//   await s3Utility
//     .uploadFile("news/" + body.newsId + "/", file)
//     .then(async (result) => {
//       if (index) {
//         supplementImages.push({  
//           name: file.originalname,
//           mimetype: file.mimetype,
//           path: result,
//           size: file.size,
//         });
//       }
//       if (index === files.length - 1) {
//         async.waterfall(
//           [
//             function (callback) {
//               const data = {                        
//                 title: body.title ? body.title : "",
//                 image: {
//                   name: file.originalname,
//                   mimetype: file.mimetype,
//                   path: result,
//                   size: file.size,
//                 },
//                 supplementImages: supplementImages,
//                 description: body.description ? body.description : "",
//                 news: {
//                   newsId: body.newsId ? ObjectId(body.newsId) : ""
//                 },
//                 createdAt: Date.now(),
//                 updatedAt: null,
//                 status: body.status,
//               };
//               db.get()
//                 .collection("news")
//                 .insertOne(data, function (err, dbresult) 
//                 {
//                   if (err) callback(err, null);
//                   callback(null, dbresult.insertedId);
//                 });
//             },
// function (result, callback) {
//   db.get()
//     .collection("news")
//     .find({ _id: ObjectId(body.newsId) })
//     .toArray(function (err, dbresult) {
//       if (err) callback(err, null);
//       const paintings = dbresult[0]["painting"];
//       paintings.push({
//         newsId: result,
//         newsName: body.name,
//       });
//       callback(null, paintings);
//     });
// },
// function (result, callback) {
//   let data = {
//     $set: {
//       painting: result,
//     },  
// };
//   db.get()
//     .collection("news")
//     .updateOne(
//       { _id: ObjectId(body.newsId) },
//       data,
//       function (err, dbresult) {
//         if (err) {
//           callback(err, null);
//         }
//         files.forEach((file) => {
//           fs.unlinkSync("./uploads/" + file.originalname);
//         });
//         callback(null, dbresult);
//       }
//     );
// },
//   ],
//               function (err, result) {
//                 if (err) {
//                   res
//                     .status(500)
//                     .send(httpUtil.error(500, "news Creation Failed."));
//                 } else {
//                   res.send(httpUtil.success(200, "news Created."));
//                 }
//               }
//             );
//           }
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(500).send(httpUtil.error(500, "File uploading Failed."));
//         });
//     });
//   } else {
//     res.status(500).send(httpUtil.error(500, "news Data is missing."));
//   }
// });

// router.put("/", upload.any("files"), async function (req, res, next) {
//   const files = req.files ? req.files : [];
//   const body = JSON.parse(req.body.data);
//   const news_id = body.news_id ? ObjectId(body.news_id) : "";
//   let mainImage;
//   let supplementImages = [];
//   let oldImages = [];
//   if (news_id) {
//     const data = {
//       $set: {
//         name: body.name ? body.name : "",
//         description: body.description ? body.description : "",
//         price: body.price ? parseInt(body.price) : "",
//         type: body.type ? body.type : "",
//         category: body.category ? body.category : "",
//         style: body.style ? body.style : "",
//         technique: body.technique ? body.technique : "",
//         size: {
//           length: body.length ? parseInt(body.length) : "",
//           width: body.width ? parseInt(body.width) : "",
//         },
//         orientation: body.orientation ? body.orientation : "",
//         discount: body.discount ? parseInt(body.discount) : "",
//         tagline: body.tagline ? body.tagline : "",
//         news: {
//           newsId: body.newsId ? ObjectId(body.newsId) : "",
//           newsName: body.newsName ? body.newsName : "",
//         },
//         updatedAt: Date.now(),
//       },
//     };

//     if (files.length) {
//       await db
//         .get()
//         .collection("news")
//         .find({ _id: news_id })
//         .toArray(async function (err, dbresult) {
//           if (err) callback(err, null);
//           oldImages.push(dbresult[0]["image"]);
//           if (dbresult[0]["supplementImages"]) {
//             await dbresult[0]["supplementImages"].forEach((img) => {
//               oldImages.push(img);
//             });
//           }
//           await asyncForEach(oldImages, async (file) => {
//             s3Utility.deleteFile("news/" + body.newsId + "/", file.name);
//           });
//           await asyncForEach(files, async (file, index) => {
//             await s3Utility
//               .uploadFile("news/" + body.newsId + "/", file)
//               .then((uploadresult) => {
//                 if (index) {
//                   supplementImages.push({
//                     name: file.originalname,
//                     mimetype: file.mimetype,
//                     path: uploadresult,
//                     size: file.size,
//                   });
//                 } else {
//                   mainImage = {
//                     name: file.originalname,
//                     mimetype: file.mimetype,
//                     path: uploadresult,
//                     size: file.size,
//                   };
//                 }
//               })
//               .catch((err) => {
//                 console.log(err);
//               });
//           });
//           data.$set.image = mainImage;
//           data.$set.supplementImages = supplementImages;
//           db.get()
//             .collection("news")
//             .updateOne({ _id: news_id }, data, function (err, dbresult) {
//               if (err) {
//                 res
//                   .status(500)
//                   .send(httpUtil.error(500, "news updating Failed."));
//               }
//               files.forEach((file) => {
//                 fs.unlinkSync("./uploads/" + file.originalname);
//               });
//               res.send(httpUtil.success(200, "news updated."));
//             });
//         });
//     } else {
//       db.get()
//         .collection("news")
//         .updateOne({ _id: news_id }, data, function (err, dbresult) {
//           if (err) {
//             res
//               .status(500)
//               .send(httpUtil.error(500, "news updating Failed."));
//           }
//           res.send(httpUtil.success(200, "news updated."));
//         });
//     }
//   } else {
//     res.status(204).send(httpUtil.error(204, "news ID is missing."));
//   }
// });

router.patch("/",jwt.authenticateToken, function (req, res, next) {
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

router.delete("/",jwt.authenticateToken, function (req, res, next) {
  const news_id = req.query.news_id ? ObjectId(req.query.news_id) : "";
  if (news_id) {
    // unlinkAsync(req.file.path)
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
// const updateProject = asyncHandler(async (req, resp) => {
//   try {
//     const body = req.body;
//     const id = req.params.id;
//     const updateProjectData = await Project.findByIdAndUpdate(
//       id,
//       { $set: body },
//       { new: true }
//     );
//     if (updateProjectData) {
//       resp.send({
//         updateProjectData,
//         status: 200,
//         success: "true",
//         message: "Project Data Updated SuccessFully",
//       });
//     }
//   } catch (err) {
//     resp.send({
//       success: "false",
//       error: err.message,
//       status: 400,
//     });
//   }
// });

// router.put("/", function (req, res, next) {
//   const news_id = req.body.news_id ? ObjectId(req.body.news_id) : "";
//   // const body = req.body
//   // res.send({
//   //   body
//   // });
//   // console.log(req.body)
//   if (news_id) {
//     let Id = { _id: news_id };
    // let data = {
    //   $set: {
        // title: req.body.title ? req.body.title : "",
        // description: req.body.description ? req.body.description : "",
        // status: req.body.status ? req.body.status : "",
        // updatedAt: Date.now()
    //   },
    // };

//     db.get()
//       .collection("news")
//       .updateOne(Id, data, function (err, result) {
//         if (err) {
//           res.status(204).send(httpUtil.error(204, "news updating error."));
//         }
//         res.send(httpUtil.success(200, "news updated."));
//       });
//   } else {
//     res.status(204).send(httpUtil.error(204, "news ID is missing."));
//   }
// });

// router.put("/", function (req, res, next) {
//   const news_id = req.body.news_id ? ObjectId(req.body.news_id) : "";
//   if (news_id) {
//     let Id = { _id: news_id };
//     const body = req.body
//     res.send({
//       Id,
//       body
//     })
//     // let data = {
//     //   $set: {
//     //     name: req.body.name ,
//     //     type: req.body.type ,start: req.body.start ,
//     //     stop: req.body.stop ,
//     //     place: req.body.place ,
//     //     limit: req.body.limit ,
//     //     participant: req.body.participant ,
//     //     winner: req.body.winner ,
//     //     updatedAt: Date.now(),
//     //   },
//     // };
//     let data = {
//       $set: {
//         title: req.body.title ? req.body.title : "",
//         // description: req.body.description ? req.body.description : "",
//         status: req.body.status ? req.body.status : "",
//         updatedAt: Date.now()
//       },
//     };
    
//     res.send({
//       data, Id
//     })
//     db.get()
//       .collection("news")
//       .updateOne(Id, data, function (err, result) {
//         if (err) {
//           res.status(204).send(httpUtil.error(204, "news updating error."));
//         }
//         res.send(httpUtil.success(200, "news updated."));
//       });
//   } else {
//     res.status(204).send(httpUtil.error(204, "news ID is missing."));
//   }
// });
router.put("/",jwt.authenticateToken, function (req, res, next) {
  const news_id = req.body.news_id ? ObjectId(req.body.news_id) : "";
  if (news_id) {
    let Id = { _id: news_id };
    const body = req.body
    let data = {
      $set: {
        title: req.body.title ? req.body.title : "",
        description: req.body.description ? req.body.description : "",
        status: req.body.status ? req.body.status : "",
        updatedAt: Date.now()
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
module.exports = router;