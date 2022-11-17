var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var bcrypt = require("bcrypt");
var jwt = require("../utilities/jwt");
var secret = require("../conf/secrets");
var async = require("async");
var s3Utility = require("../utilities/s3-bucket");
var multer = require("multer");
var fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/artist");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
});

var upload = multer({ storage: storage });
router.get("/:name", jwt.authenticateToken, function (req, res, next) {
  const name = req.params.name
  db.get().collection("artist")
    .find({ name: name })
    // .project({ _id: 1, name: 1 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/", jwt.authenticateToken, function (req, res, next) {
  db.get()
    .collection("artist")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

// router.post("/", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
//   try {
//     const imageFiles = req.files ? req.files : [];
//     const imagePath = []
//     const body = req.body;
//     res.send({
//       body,
//       imageFiles
//     })
//     if (imageFiles) {
//       for (let i = 0; i < imageFiles.length; i++) {
//         let imgObj = imageFiles[i].destination + imageFiles[i].originalname
//         imagePath.push(imgObj)
//       }
//       body.images = imagePath
//     }
//     db.get()
//       .collection("artist")
//       .insertOne(body, function (err, dbresult) {
//         if (err)
//           res.status(500).send(httpUtil.error(500, "Artist Creation Failed."));
//         res.send(httpUtil.success(200, "Artist Created."));
//       });
//   } catch (err) {
//     res.send({
//       status: 400,
//       error: err.message,
//       success: false
//     })
//   }
// });
router.post("/",jwt.authenticateToken, upload.any("images"), async function (req, res, next) {
  const imageFiles = req.files ? req.files : [];
  const imagePath = []
  const body = req.body;
  if (imageFiles) {
    for (let i = 0; i < imageFiles.length; i++) {
      let imgObj = imageFiles[i].destination + imageFiles[i].originalname
      imagePath.push(imgObj)
    }
    body.images = imagePath
  }
  db.get()
    .collection("artist")
    .insertOne(body, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "artist Creation Failed."));
      res.send(httpUtil.success(200, "artist Created."));
    });
})

router.put("/", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
  try {
    const artist_id = req.body.artist_id ? ObjectId(req.body.artist_id) : "";
    if (artist_id) {
      let Id = { _id: artist_id };
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
          name: body.name ? body.name : "",
          email: body.email ? body.email : "",
          mobile: body.mobile ? body.mobile : "",
          dob: body.dob ? body.dob : "",
          gender: body.gender ? body.gender : "",
          address: body.address ? body.address : "",
          city: body.city ? body.city : "",
          state: body.state ? body.state : "",
          country: body.country ? body.country : "",
          zipcode: body.zipcode ? body.zipcode : "",
          tagline: body.tagline ? body.tagline : "",
          description: body.description ? body.description : "",
          skill: body.skill ? body.skill : [],
          extra: body.extra ? body.extra : [],
          facebook: body.facebook ? body.facebook : "",
          linkedin: body.linkedin ? body.linkedin : "",
          instagram: body.instagram ? body.instagram : "",
          type: body.type ? body.type : "",
          updatedAt: Date.now(),
          status: body.status ? body.status : "Active",
          updatedAt: Date.now()
        },
      };
      db.get()
        .collection("artist")
        .updateOne(Id, data, function (err, dbresult) {
          if (err)
            res.status(500).send(httpUtil.error(500, "artist Update Failed."));
          res.send(httpUtil.success(200, "artist Updated."));
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
  // const body = req.body;
  // const artist_id = body.artist_id ? ObjectId(body.artist_id) : "";
  // if (artist_id) {
  //   async.waterfall(
  //     [
  //       function (callback) {
  //         const data = {
  //           $set: {
              // name: body.name ? body.name : "",
              // email: body.email ? body.email : "",
              // mobile: body.mobile ? body.mobile : "",
              // dob: body.dob ? body.dob : "",
              // gender: body.gender ? body.gender : "",
              // address: body.address ? body.address : "",
              // city: body.city ? body.city : "",
              // state: body.state ? body.state : "",
              // country: body.country ? body.country : "",
              // zipcode: body.zipcode ? body.zipcode : "",
              // tagline: body.tagline ? body.tagline : "",
              // description: body.description ? body.description : "",
              // skill: body.skill ? body.skill : [],
              // extra: body.extra ? body.extra : [],
              // facebook: body.facebook ? body.facebook : "",
              // linkedin: body.linkedin ? body.linkedin : "",
              // instagram: body.instagram ? body.instagram : "",
              // type: body.type ? body.type : "",
              // updatedAt: Date.now(),
              // status: body.status ? body.status : "Active"
  //           },
  //         };
  //         db.get()
  //           .collection("artist")
  //           .updateOne({ _id: artist_id }, data, function (err, dbresult) {
  //             if (err) {
  //               callback(err, null);
  //             }
  //             callback(null, dbresult);
  //           });
  //       },
  //       function (result, callback) {
  //         if (req.file) {
  //           db.get()
  //             .collection("artist")
  //             .find({ _id: artist_id })
  //             .toArray(function (err, dbresult) {
  //               if (err) callback(err, null);
  //               callback(null, dbresult[0]["image"]["name"]);
  //             });
  //         } else {
  //           callback(null, "No File.");
  //         }
  //       },
  //       function (result, callback) {
  //         if (req.file) {
  //           s3Utility
  //             .uploadFile("artist/" + artist_id + "/", req.file)
  //             .then((uploadresult) => {
  //               const data = {
  //                 $set: {
  //                   image: {
  //                     name: req.file.originalname,
  //                     mimetype: req.file.mimetype,
  //                     path: uploadresult,
  //                     size: req.file.size,
  //                   },
  //                 },
  //               };
  //               db.get()
  //                 .collection("artist")
  //                 .updateOne(
  //                   { _id: artist_id },
  //                   data,
  //                   function (err, dbresult) {
  //                     if (err) {
  //                       callback(err, null);
  //                     }
  //                     s3Utility
  //                       .deleteFile("artist/" + artist_id + "/", result)
  //                       .then((s3result) => {
  //                         fs.unlinkSync("./uploads/" + req.file.originalname);
  //                         callback(null, dbresult);
  //                       })
  //                       .catch((error) => {
  //                         callback(error, null);
  //                       });
  //                   }
  //                 );
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               callback(err, null);
  //             });
  //         } else {
  //           callback(null, "No File.");
  //         }
  //       },
  //     ],
  //     function (err, result) {
  //       if (err) {
  //         res.status(500).send(httpUtil.error(500, "Artist updating Failed."));
  //       } else {
  //         res.send(httpUtil.success(200, "Artist updated."));
  //       }
  //     }
  //   );
  // } else {
  //   res.status(204).send(httpUtil.error(204, "Artist ID is missing."));
  // }
});

router.patch("/", jwt.authenticateToken, function (req, res, next) {
  const artist_id = req.body.artist_id ? ObjectId(req.body.artist_id) : "";
  if (artist_id) {
    let Id = { _id: artist_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("artist")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "Artist updating error."));
        }
        res.send(httpUtil.success(200, "Artist updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artist ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const artist_id = req.query.artist_id ? ObjectId(req.query.artist_id) : "";
  if (artist_id) {
    db.get()
      .collection("artist")
      .deleteOne({ _id: artist_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "artist deletion error."));
        res.send(httpUtil.success(200, "artist deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "artist ID is missing."));
  }
});

module.exports = router;
