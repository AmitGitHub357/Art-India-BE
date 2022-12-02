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

var upload = multer({ storage: storage })

router.delete("/:comment_id", function (req, res, next) {
  res.send({ body: req.params.comment_id });
  const comment_id = req.query.comment_id ? ObjectId(req.query.comment_id) : "";
  if (comment_id) {
    db.get()
      .collection("comment")
      .deleteOne({ _id: comment_id }, function (err, result) {
        if (err)
          res.status(204).send(httpUtil.error(204, "comment deletion error."));
        res.send(httpUtil.success(200, "comment deleted."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "comment ID is missing."));
  }
});

router.get("/", function (req, res, next) {
  db.get()
    .collection("comment")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
})
router.get("/:comment_id", function (req, res, next) {
  // res.send({ req : req.params})
  const _id = req.params.comment_id ? ObjectId(req.params.comment_id) : ""
  db.get()
    .collection("comment")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/", async function (req, res, next) {
   const body = req.body;

  // db.get()
  //   .collection("comment")
  //   .insertOne(body, function (err, dbresult) {
  //     if (err)
  //       res.status(500).send(httpUtil.error(500, "comment Creation Failed."));
  //     res.send(httpUtil.success(200, "comment Created."));
  //   });
  db.get()
    .collection("comment")
    .insertOne(data, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "comment Creation Failed."));
      db.get().collection("comment").find({ blog_Id: body.blog_Id }).toArray(function (err, result) {
        if (err) res.send(err);
        db.get().collection("blog").updateOne({ _id: ObjectId(body.blog_id ) }, { $set: { comment : result } }, function (err, result) {
          if (err) {
            res.status(204).send(httpUtil.error(204, err.message));
          }
          else
            res.send({
              status: 200,
              success: true,
              message: "Comment Created"
            })
        })
      })
    })
})

router.put("/", function (req, res, next) {
  const comment_id = req.body.comment_id ? ObjectId(req.body.comment_id) : "";
  if (comment_id) {
    let Id = { _id: comment_id };
    const body = req.body
    let data = {
      $set: {
        name: req.body.title,
        type: req.body.type,
        description: req.body.description,
        likes: req.body.likes,
        comment: ["this is was good"],
        created_by: req.body.created_by,
        links: req.body.links,
        updatedAt: Date.now(),
      },
    };

    db.get()
      .collection("comment")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "comment updating error."));
        }
        res.send(httpUtil.success(200, "comment updated."));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "comment ID is missing."));
  }
});

router.patch("/", function (req, res, next) {
  const comment_id = req.body.comment_id ? ObjectId(req.body.comment_id) : "";
  if (comment_id) {
    let Id = { _id: comment_id };
    let data = {
      $set: {
        status: req.body.status ? req.body.status : false,
        updatedAt: Date.now(),
      },
    };
    db.get()
      .collection("comment")
      .updateOne(Id, data, function (err, result) {
        if (err) {
          res.status(204).send(httpUtil.error(204, "comment updating error."));
        }
        res.send(httpUtil.success(200, "comment updated."));
      });
  }
  else {
    res.status(204).send(httpUtil.error(204, "comment ID is missing."));
  }
});

module.exports = router;