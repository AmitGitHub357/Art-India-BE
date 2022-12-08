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
    cb(null, "public/uploads/blog/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });
router.get("/", function (req, res, next) {
  db.get()
    .collection("blog")
    .find({}).sort({ createdAt : -1 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});



// <<<<<<< HEAD
router.get("/search", function (req, res, next) {
  try {router.get("/:blog_id", function (req, res, next) {
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});
    const key = req.query.key
    db.get().collection("blog").find({
      $or:
        [{ postedBy : { $regex: key } }, { title : { $regex: key } }, { category: { $regex: key } }, { description: { $regex: key } }, { date: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { paintingCategory: { $regex: key } }, { paintingArtwork: { $regex: key } }, { paintingStyle: { $regex: key } }, { paintingTechniques: { $regex: key } }]
    })
      .toArray(function (err, result) {
        if (err) console.log(err)
        res.send(httpUtil.success({
          status: 200,
          success: true,
          result,
          totalCount: result.length
        }))
      });
  } catch (err) {
    res.send(httpUtil.error(400, { error: err.message }))
  }
});

router.get("/:category", function (req, res, next) {
  const category = req.params.categor ? ObjectId(req.params.category) : ""
  db.get()
    .collection("blog")
    .find({ category: category })
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
    const data = {
      title: body.title,
      postedBy: body.postedBy,
      category: body.category, 
      // comments: [],
      description: body.description,
      likes: body.likes ? body.likes : "",
      link: body.link,
      date: body.date,
      createdAt: Date.now(),
      updatedAt: "",
      images: body.images ? body.images : "",
      status: body.status ? body.status : ""
    }
    db.get()
      .collection("blog")
      .insertOne(data, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "blog Creation Failed."));
        res.send(httpUtil.success(200, "blog Created."));
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

router.put("/blog", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
  try {
    const blog_id = req.body.blog_id ? ObjectId(req.body.blog_id) : "";
    if (blog_id) {
      let Id = { _id: blog_id };
      let data = {
        $set: {
          likes: body.likes,
          updatedAt: Date.now()
        },
      };
      db.get()
        .collection("blog")
        .updateOne(Id, data, function (err, dbresult) {
          if (err)
            res.status(500).send(httpUtil.error(500, "blog Update Failed."));
          res.send(httpUtil.success(200, "blog Updated."));
        });
    }
  }
  catch (err) {
    res.send({
      status : 400,
      error : err.message,
      success : false
    })
  }
})

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
        name: body.title,
        date : body.date,
        status: body.status ? body.status : "Active",
        createdAt: Date.now(),
        blogImages: body.images,
      }
      db.get()
        .collection("blog")
        .insertOne(data, function (err, dbresult) {
          if (err)
            res.status(500).send(httpUtil.error(500, "blog Creation Failed."));
          res.send(httpUtil.success(200, "blog Created."));
        });
    } catch (err) {
      res.send({
        status: 400,
        error: err.message,
        success: false
      })
    }
// >>>>>>> f85fde50efa206df8bb37c45086cc150d577f81a
});

router.put("/", jwt.authenticateToken, upload.array("images"), function (req, res, next) {
  try {
    const blog_id = req.body.blog_id ? ObjectId(req.body.blog_id) : "";
    if (blog_id) {
      let Id = { _id: blog_id };
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
          likes: body.likes ? body.likes : "0",
          links: body.links ? body.links : "",
          updatedAt: Date.now(),
          status: body.status ? body.status : "Active",
        },
      };
      db.get()
        .collection("blog")
        .updateOne(Id, data, function (err, dbresult) {
          if (err)
            res.status(500).send(httpUtil.error(500, "blog Update Failed."));
          res.send(httpUtil.success(200, "blog Updated."));
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
})

router.patch("/", jwt.authenticateToken, function (req, res, next) {
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
  else {
    res.status(204).send(httpUtil.error(204, "blog ID is missing."));
  }
});

router.delete("/", jwt.authenticateToken, function (req, res, next) {
  const blog_id = req.query.blog_id ? ObjectId(req.query.blog_id) : "";
  if (blog_id) {
    db.get()
      .collection("blog")
      .deleteMany({ likes: "0" }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "blog deletion error."));
        res.send(httpUtil.success(200, "blog deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "blog ID is missing."));
  }
});

module.exports = router;
