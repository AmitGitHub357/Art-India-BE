var express = require("express");
var router = express.Router();
var secret = require("../conf/secrets");
var httpUtil = require("../utilities/http-messages");
var sendMail = require("../utilities/send-mail");
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var async = require("async");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secret.ADMIN_EMAIL,
    pass: secret.ADMIN_PASS
  }
});

router.post("/chitchat", function (req, res, next) {
  // res.send({
  //   mess: "ok"
  // });

  const context = { 
    name: req.body.name ? req.body.name : "",
    email: req.body.email ? req.body.email : "",
    phone: req.body.phone ? req.body.phone : "",
    about: req.body.about ? req.body.about : "",
    comment: req.body.comment ? req.body.comment : "",
  };
  // sendMail("ChitChat", secret.ADMIN_EMAIL, context)
  //   .then((mailresult) => {
  //     res.send(httpUtil.success(200, "Chit Chat Mail Sent.", mailresult));
  //   })
  //   .catch((error) => {
  //     res.status(500).send(httpUtil.error(500, "Chit Chat Error."));
  //   });
  var mailOptions = {
    from: secret.ADMIN_EMAIL,
    to: context.email,
    subject: 'no reply',
    text: 'You registered Chichat Event !'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send({
        success: true,
        status: 200,
        message: "Email sent !"
      })
    }
  });
});

router.post("/program", function (req, res, next) {
  const context = {
    name: req.body.name ? req.body.name : "",
    email: req.body.email ? req.body.email : "",
    phone: req.body.phone ? req.body.phone : "",
    program: req.body.program ? req.body.program : "",
    comment: req.body.comment ? req.body.comment : "",
  };
  // sendMail("Program", secret.ADMIN_EMAIL, context)
  //   .then((mailresult) => {
  //     res.send(httpUtil.success(200, "Program Mail Sent.", mailresult));
  //   })
  //   .catch((error) => {
  //     res.status(500).send(httpUtil.error(500, "Program Error."));
  //   });
  var mailOptions = {
    from: secret.ADMIN_EMAIL,
    to: context.email,
    subject: 'no reply',
    text: 'You registered Program Event !'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send({
        success: true,
        status: 200,
        message: "Email sent !"
      })
    }
  });
});

router.post("/connect", function (req, res, next) {
  const context = {
    name: req.body.name ? req.body.name : "",
    email: req.body.email ? req.body.email : "",
    phone: req.body.phone ? req.body.phone : "",
    subject: req.body.subject ? req.body.subject : "",
    comment: req.body.comment ? req.body.comment : "",
  };
  
  var mailOptions = {
    from: secret.ADMIN_EMAIL,
    to: context.email,
    subject: 'no reply',
    text: 'thank you for your registration !'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send({
        success: true,
        status: 200,
        message: "Email sent !"
      })
    }
  });
});

router.post("/contact", function (req, res, next) {
  const context = {
    name: req.body.name ? req.body.name : "",
    email: req.body.email ? req.body.email : "",
    phone: req.body.phone ? req.body.phone : "",
    subject: req.body.subject ? req.body.subject : "",
    comment: req.body.comment ? req.body.comment : "",
  };
  // sendMail("Contact", secret.ADMIN_EMAIL, context)
  //   .then((mailresult) => {
  //     res.send(httpUtil.success(200, "Contact Mail Sent.", mailresult));
  //   })
  //   .catch((error) => {
  //     res.status(500).send(httpUtil.error(500, "Contact Error."));
  //   });
  var mailOptions = {
    from: secret.ADMIN_EMAIL,
    to: context.email,
    subject: 'no reply',
    text: 'our team contact to you soon !'
};

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send({
        success: true,
        status: 200,
        message: "Email sent !"
      })
    }
  });
});

router.get("/artist-type", function (req, res, next) {
  db.get()
    .collection("artist-type")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/news", function (req, res, next) {
  db.get()
    .collection("news")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/event", function (req, res, next) {
  db.get()
    .collection("event")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/blog", function (req, res, next) {
  db.get()
    .collection("blog")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});



router.get("/artist", function (req, res, next) {

  let skip = req.query.skip ? req.query.skip : 0;
  let limit = req.query.limit ? req.query.limit : 10;
  let type = req.query.type ? req.query.type : "";
  let filter = req.query.filter ? req.query.filter : "";
  let filters = {};
  let pipeline = [
    {
      $lookup: {
        from: "artwork",
        localField: "painting.artworkId",
        foreignField: "_id",
        as: "painting",
      },
    },
    {
      $sort: {
        _id: -1,
    },  
    }
  ];
  if (type && filter) {
    pipeline.push({
      $match: {
        type: type,
        name: {
          $regex: '^' + filter,
          $options: 'i'
        }
      },
    });
    filters = {
      type: type,
      name: {
        $regex: '^' + filter,
        $options: 'i'
      }
    };
  } else if (type) {
    pipeline.push({
      $match: {
        type: type
      },
    });
    filters = {
      type: type
    };
  } else if (filter) {
    pipeline.push({
      $match: {
        name: {
          $regex: '^' + filter,
          $options: 'i'
        }
      },
    });
    filters = {
      name: {
        $regex: '^' + filter,
        $options: 'i'
      }
    };
  }
  if (skip) {
    pipeline.push({
      $skip: skip,
    });
  }
  if (limit) {
    pipeline.push({
      $limit: limit,
    });
  }
  db.get()
    .collection("artist")
    .aggregate(pipeline)
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      db.get()
        .collection("artist")
        .find(filters)
        .count(function (err, dbresult) {
          if (err) throw err;
          res.send(
            httpUtil.success(200, "", { count: dbresult, data: result })
          );
        });
    });
});

router.post("/artwork", function (req, res, next) {
  // res.send({
  // body : req.body
  // })
  try {
    const skip = req.body.skip ? req.body.skip : 0;
    const limit = req.body.limit ? req.body.limit : 10;
    const type = req.body.type ? req.body.type : "";
    const orientation = req.body.orientation ? req.body.orientation : "";
    const category = req.body.category ? req.body.category : "";
    const style = req.body.style ? req.body.style : "";
    const technique = req.body.technique ? req.body.technique : "";
    const size = req.body.size ? req.body.size : "";
    const price = req.body.price ? req.body.price : "";
    const rentPrice = req.body.rentPrice ? req.body.rentPrice : ""
    let filter = {
      type: type
    };
    let pipeline = [
      {
        $match: {
          type: type
        }
      }
    ];
    if (size === 'Small') {
      pipeline[0].$match['size.length'] = { $lte: 12 };
      pipeline[0].$match['size.width'] = { $lte: 12 };
      filter['size.length'] = { $lte: 12 };
      filter['size.width'] = { $lte: 12 };
    } else if (size === 'Medium') {
      pipeline[0].$match['size.length'] = { $gte: 13, $lte: 36 };
      pipeline[0].$match['size.width'] = { $gte: 13, $lte: 36 };
      filter['size.length'] = { $gte: 13, $lte: 36 };
      filter['size.width'] = { $gte: 13, $lte: 36 };
    } else if (size === 'Large') {
      pipeline[0].$match['size.length'] = { $gte: 37 };
      pipeline[0].$match['size.width'] = { $gte: 37 };
      filter['size.length'] = { $gte: 37 };
      filter['size.width'] = { $gte: 37 };
    }
    if (price) {
      pipeline[0].$match['price'] = { $lte: price };
      filter['price'] = { $lte: price };
    }
    if (orientation) {
      pipeline[0].$match['orientation'] = orientation;
      filter['orientation'] = orientation;
    }
    if (category) {
      pipeline[0].$match['category'] = {

        $in: category
      };
      filter['category'] = {
        $in: category
      };
    }
    if (style) {
      pipeline[0].$match['style'] = {
        $in: style
      };
      filter['style'] = { 
        $in: style
      };
    }
    if (technique) {
      pipeline[0].$match['technique'] = {
        $in: technique
      };
      filter['technique'] = {
        $in: technique
      };
    }
    if (skip) {
      pipeline.push({
        $skip: skip,
      });
    }
    if (limit) {
      pipeline.push({
        $limit: limit,
      });
    }
    db.get()
      .collection("artwork")
      .aggregate(pipeline)
      .toArray(function (err, result) {
        if(err){
          res.send({
            status : 400,
            success : false,
            error : err
          })
        }
        db.get()
          .collection("artwork")
          .find(filter)
          .count(function (err, dbresult) {
            if (err) throw err;
            res.send(
              httpUtil.success(200, "Artwork Data", { count: dbresult, data: result })
            );
          });
      })
  } catch (err) {
    res.send({
      error: "Error"
    })
  }
});

router.get("/artwork", function (req, res, next) {
  const artwork_id = req.query.artwork_id ? ObjectId(req.query.artwork_id) : "";
  // res.send({ messa : artwork_id });
  if (artwork_id) {
    db.get()
      .collection("artwork")
      .find({ _id: artwork_id })
      .toArray(function (err, result) {
        if (err) console.log(err);
        res.send(httpUtil.success(200, "", result));
      });
  } else {
    res.status(204).send(httpUtil.error(204, "Artwork ID is missing."));
  }
});

router.get("/artwork-type", function (req, res, next) {
  db.get()
    .collection("artwork-type")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/cst", function (req, res, next) {
  let finalResult = {};
  const type = req.query.type
    ? req.query.type.split(" ").join("").toLowerCase()
    : "";
  if (type) {
    async.waterfall(
      [
        function (callback) {
          db.get()
            .collection(type + "-category")
            .find({})
            .toArray(function (err, result) {
              if (err) callback(err, null);
              finalResult["category"] = result;
              callback(null, "Done");
            });
        },
        function (result, callback) {
          db.get()
            .collection(type + "-style")
            .find({})
            .toArray(function (err, result) {
              if (err) callback(err, null);
              finalResult["style"] = result;
              callback(null, "Done");
            });
        },
        function (result, callback) {
          db.get()
            .collection(type + "-technique")
            .find({})
            .toArray(function (err, result) {
              if (err) callback(err, null);
              finalResult["technique"] = result;
              callback(null, "Done");
            });
        },
      ],
      function (err, result) {
        if (err) {
          res.status(500).send(httpUtil.error(500, "CST fetching Failed."));
        } else {
          res.send(httpUtil.success(200, "CST data.", finalResult));
        }
      }
    );
  } else {
    res.status(204).send(httpUtil.error(204, "Type is missing."));
  }
});

router.get("/artwork-frame", function (req, res, next) {
  db.get()
    .collection("artwork-frame")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/services", function (req, res, next) {
  db.get()
    .collection("services")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/testimonial", function (req, res, next) {
  db.get()
    .collection("testimonial")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/clients/logo", function (req, res, next) {
  db.get()
    .collection("clients-logo")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});//

module.exports = router;