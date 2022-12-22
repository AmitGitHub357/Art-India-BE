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
var path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/public/uploads/artist/");
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
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/", function (req, res, next) {
  db.get()
    .collection("artist")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      // res.send({ count : result.length })
      res.send(httpUtil.success({ status : 200, totalArtist : result.length , result }));
    });
});

// router.post("/",jwt.authenticateToken, upload.fields([{ name : "images" }, { name : "paintingImages" , maxCount : 20 }]), async function (req, res, next) {
//   var imagesPath = [],paintingPath = []
//   var imagesFile = [],paintingFile = []
//   var body = req.body;
//   if(Object.keys(req.files).length!=0){
//       if(Object.keys(req.files).includes('images')){    
//        imagesFile = await req.files.images
//       }
//       if(Object.keys(req.files).includes('paintingImages')){    
//           paintingFile = await req.files.paintingImages
//       }
//   }
//   if( imagesFile.length != 0 ){
//       for(let i=0;i<imagesFile.length;i++){
//         let imgObj = "http://localhost:3000/" + imagesFile[i].destination.slice(1) + imagesFile[i].filename
//           imagesPath.push(imgObj)
//       }
//       body.images = imagesPath
//   }
//   if (paintingFile.length != 0) {
//     for(let i=0;i<paintingFile.length;i++){
//     //   let imgObj = "http://localhost:3000/"+`${ paintingFile[i].destination }` + `${ paintingFile[i].originalname }`
//     let imgObj = "http://localhost:3000/" + paintingFile[i].destination.slice(1) + paintingFile[i].filename
//       paintingPath.push(imgObj)
//     } 
//     body.painting = paintingPath
//   }
//   db.get()
//     .collection("artist")
//     .insertOne(body, function (err, dbresult) {
//       if (err)
//         res.status(500).send(httpUtil.error(500, "artist Creation Failed."));
//       res.send(httpUtil.success(200, "artist Created."));
//     });
// })
router.post("/", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
  // res.send({ body : req.body })
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
    const mileStone = []
    for(var i = 0; i < body.mileStoneTitle.length; i++){
        mileStone.push({ mileStoneName : body.mileStoneTitle[i] , mileStoneCount : body.mileStoneCount[i] })
    }

    const data = {
      name: body.name,
      dob: body.dob,
      email: body.email,
      mobile: body.mobile,
      gender: body.gender,
      city: body.city,
      state: body.state,
      country: body.country,
      title: {
        title: body.title,
        titleShortDescription : body.titleShortDescription,
        artistDescription : body.description,
      },  
      interest: body.interest,
      socialConnect: {
        instagram: body.instagram ? body.instagram : "",
        facebook: body.facebook ? body.facebook : "",
        linkedin: body.linkedin ? body.linkedin : "",
        twitter: body.twitter ? body.twitter : ""
      },
      status: body.status ? body.status : "",  
      createdAt: Date.now(),
      profileImages: body.images,
      painting: [],
      artist_type: body.artist_type,
      mileStone
    }
    
    db.get()
      .collection("artist")
      .insertOne(data, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "artist Creation Failed."));
        res.send(httpUtil.success(200, "artist Created."));
      });
    
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

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
  // res.send(artist_id)
  if (artist_id) {
    db.get()
      .collection("artist")
      .deleteOne({ _id : artist_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "artist deletion error."));
        res.send(httpUtil.success(200, "artist deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "artist ID is missing."));
  }
});

module.exports = router;