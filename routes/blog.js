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
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  var upload = multer({ storage: storage });
//   router.get("/", function (req, res, next) {
//     db.get()
//       .collection("news")
//       .find({})
//       .toArray(function (err, result) {
//         if (err) console.log(err);
//     res.send(httpUtil.success(200, "", result));
//       });
//   });
router.get("/", function (req, res, next) {
  db.get()
    .collection("blog")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});
{/* <div class="mapouter"><div class="gmap_canvas"><iframe class="gmap_iframe" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=gujarat&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe><a href="https://piratebay-proxys.com/">Pirate Proxy</a></div><style>.mapouter{position:relative;text-align:right;width:600px;height:400px;}.gmap_canvas {overflow:hidden;background:none!important;width:600px;height:400px;}.gmap_iframe {width:600px!important;height:400px!important;}</style></div> */}
{/* <div class="mapouter"><div class="gmap_canvas"><iframe class="gmap_iframe" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=maharashtra&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe><a href="https://piratebay-proxys.com/">Pirate Proxy</a></div><style>.mapouter{position:relative;text-align:right;width:600px;height:400px;}.gmap_canvas {overflow:hidden;background:none!important;width:600px;height:400px;}.gmap_iframe {width:600px!important;height:400px!important;}</style></div> */}
{/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497699.997442152!2d77.35071857779081!3d12.953847698182505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1666341659398!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
{/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31088.23812008041!2d77.3681300716063!3d13.097300159486965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae25847d59ca63%3A0xf7ee23b26df73293!2sNelamangala%20Town%2C%20Karnataka%20562123!5e0!3m2!1sen!2sin!4v1666341701353!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
router.get("/:blog_id", function (req, res, next) {
  // res.send({ req : req.params})
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find( { _id : _id } )
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});


router.post("/", upload.any("files"), async function (req, res, next) {
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
      .collection("blog")
      .insertOne(body, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "blog Creation Failed."));
        res.send(httpUtil.success(200, "blog Created."));
      });
    // });
  })

router.put("/", function (req, res, next) {
  const blog_id = req.body.blog_id ? ObjectId(req.body.blog_id) : "";
  if (blog_id) {
    let Id = { _id: blog_id };
    const body = req.body
    let data = {
      $set: {
        name: req.body.title ,
        type: req.body.type ,
        description : req.body.description,
        likes : req.body.likes,
        comment : ["this is was good"],
        created_by : req.body.created_by,
        links : req.body.links,
        updatedAt: Date.now(),
      },
    };

    db.get()
      .collection("blog")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "blog updating error."));
        }
        res.send(httpUtil.success(200, "blog updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "blog ID is missing."));
  }
});

router.patch("/", function (req, res, next) {
  const blog_id = req.body.blog_id ? ObjectId(req.body.blog_id) : "";
  if (blog_id) {
    let Id = { _id: blog_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("blog")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "blog updating error."));
        }
        res.send(httpUtil.success(200, "blog updated."));
      });
  } 
  else 
  {
    res.status(204).send(httpUtil.error(204, "blog ID is missing."));
  }
});

router.delete("/", function (req, res, next) {
  const blog_id = req.query.blog_id ? ObjectId(req.query.blog_id) : "";
  if (blog_id) {
    db.get()
      .collection("blog")
      .deleteOne({ _id: blog_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "blog deletion error."));
        res.send(httpUtil.success(200, "blog deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "blog ID is missing."));
  }
});

module.exports = router;
