var express = require("express");
var router = express.Router();
var secret = require("../conf/secrets");
var httpUtil = require("../utilities/http-messages");
var sendMail = require("../utilities/send-mail");
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var async = require("async");
var nodemailer = require('nodemailer');
var multer = require("multer");
const { get } = require("request");
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secret.ADMIN_EMAIL,
    pass: secret.ADMIN_PASS
  }
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/cart/frames");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
});
var upload = multer({ storage: storage });
router.get("/cart", function (req, res, next) {
  db.get()
    .collection("cart")
    .find({}).
    limit(10)
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artwork-type", function (req, res, next) {
  db.get()
    .collection("artwork-type")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artworks", function (req, res, next) {
  try {
    const artwork_id = req.query.artwork_id ? ObjectId(req.query.artwork_id) : "";
    db.get().collection("artwork").aggregate([
      {
        $lookup:
        {
          from: "artist",
          localField: "_id",
          foreignField: "painting._id",
          as: "artist"
        }
      },
      { $unwind: "$artist" },
      { 
        "$project": {
          "artist.painting" : 0
        }
      }
    ]).toArray((err, result) => {
      if (err) res.send({ error: err.message })
      else {
        res.send({ status: 200, count: result.length, data: result, success: true })
      }
    })
  } catch (err) {
    res.send({
      status: 400,
      success: false,
      error: err.message
    })
  }

});

router.get("/userCart", function (req, res, next) {
  const userId = req.query.userId ? req.query.userId : ""
  db.get()
    .collection("cart")
    .find({ userId: userId })
    .toArray(function (err, result) {
      if (err) res.send({ status: 400, success: false, error: err.message });
      res.send({ status: 200, success: true, data: result })
    });
});
router.post("/cart", upload.array("selectedFrames"), async function (req, res, next) {
  try {
    const imageFiles = req.files ? req.files : [];
    const imagePath = []
    const body = req.body
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        let imgObj = "http://localhost:3000/" + `${imageFiles[i].destination}` + `${imageFiles[i].originalname}`
        imagePath.push(imgObj)
      }
      body.selectedFrames = imagePath
    }
    const data = {
      selectedFrames: body.selectedFrames,
      artworkId: body.artworkId,
      userId: body.userId,
      status: body.status ? body.status : "Active",
      buyPrice: body.buyPrice ? body.buyPrice : "",
      rentPrice: body.rentPrice ? body.rentPrice : "",
      cartId: body.cartId ? body.cartId : ""
    }

    db.get()
      .collection("cart")
      .insertOne(data, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "cart Creation Failed."));
        res.send(httpUtil.success(200, "cart Created."));
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
})

router.post("/chitchat", function (req, res, next) {

  const context = {
    name: req.body.name ? req.body.name : "",
    email: req.body.email ? req.body.email : "",
    phone: req.body.phone ? req.body.phone : "",
    about: req.body.about ? req.body.about : "",
    comment: req.body.comment ? req.body.comment : "",
  };

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

router.post("/confirmEnquiryEmail", function (req, res, next) {

  try {
    const body = req.body
    const data = {
      name: body.name ? body.name : "",
      email: body.email ? body.email : "",
      phone: body.phone ? body.phone : "",
      date: body.data ? body.date : "",
      artworkName: body.artworkName ? body.artworkName : "",
      buyPrice: body.buyPrice ? body.buyPrice : body.rentPrice,
    }
    var adminOptions = {
      from: secret.ADMIN_EMAIL,
      to: "av686715@gmail.com",
      subject: body.buyPrice ? "we got enquiry for buy Artwork from Art India Art" : "enquiry for rent Artwork from Art India Art",
      html: `<b>Artwork Name</b> : <h3>${body.artworkName}</h3><br> <b>Rate</b> : <h3>${body.buyPrice ? body.buyPrice : body.rentPrice}</h3><br><b>Message</b> : <h3>We will contact to you soon !</h3><br>`
    };

    var mailOptions = {
      from: secret.ADMIN_EMAIL,
      to: body.email,
      subject: body.buyPrice ? "we got enquiry for buy Artwork from Art India Art" : "enquiry for rent Artwork from Art India Art",
      html: `<b>Artwork Name</b> : <h3>${body.artworkName}</h3><br> <b>Rate</b> : <h3>${body.buyPrice ? body.buyPrice : body.rentPrice}</h3><br><b>Message</b> : <h3>We will contact to you soon !</h3><br>`
    };

    db.get()
      .collection("confirmEnquiryEmail")
      .insertOne(data, function (err, dbresult) {
        if (err)
          res.status(500).send(httpUtil.error(500, "confirm EnquiryEmail Creation Failed."));
        else {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              res.send(error);
            } else {
              // console.log('Email sent: ' + info.response);
              // res.send({
              // success: true,
              // status: 200,
              // message: `Email sent to ` + `${body.email}` + " confirm order Details added successfully !"
              // })
              transporter.sendMail(adminOptions, function (err, result) {
                if (err) {
                  res.send({ status: 400, error: err.message, success: false })
                }
                else {
                  res.send({
                    success: true,
                    status: 200,
                    message: `Email sent to ` + `${body.email}` + " confirm order Details added successfully !"
                  })
                }
              })
            }
          });
        }
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

router.post("/contact", function (req, res, next) {
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

router.get("/artistType", function (req, res, next) {
  const type = req.query.type
  db.get()
    .collection("artist")
    .find({ artist_type: type })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/featured_events", function (req, res, next) {
  db.get()
    .collection("event")
    .find({ completed: "true" }).sort({ end_date: 1 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      console.log(result)
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artistName", function (req, res, next) {
  const letter = req.query.letter
  db.get()
    .collection("artist")
    .find({ name: { $regex: '^' + letter + '' } })
    .toArray(function (err, result) {
      if (err) res.send(err);
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

router.get("/blog/:blog_id", function (req, res, next) {
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/education", function (req, res, next) {
  db.get()
    .collection("education")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/gallery", function (req, res, next) {
  db.get()
    .collection("gallery")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/event_type", function (req, res, next) {
  const event_type = req.query.event_type
  db.get()
    .collection("event")
    .find({ event_type: event_type })
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

router.get("/blogSearch", function (req, res, next) {
  try {
    const key = req.query.key
    db.get().collection("blog").find({
      $or:
        [{ postedBy: { $regex: key } }, { title: { $regex: key } }, { category: { $regex: key } }, { description: { $regex: key } }, { date: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { paintingCategory: { $regex: key } }, { paintingArtwork: { $regex: key } }, { paintingStyle: { $regex: key } }, { paintingTechniques: { $regex: key } }]
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

router.get("/blogCategory", function (req, res, next) {
  const category = req.query.category
  db.get()
    .collection("blog")
    .find({ category: category })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artist", function (req, res, next) {
  db.get()
    .collection("artist")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artist-type", function (req, res, next) {
  db.get()
    .collection("artist-type")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/artwork", function (req, res, next) {
  db.get()
    .collection("artwork")
    .find({})
    .project({ password: 0 })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.put("/blogLike", function (req, res, next) {
  // res.send({ id : req.body })
  try {
    const body = req.body
    const blog_id = body.blog_id ? ObjectId(body.blog_id) : "";
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
      status: 400,
      error: err.message,
      success: false
    })
  }
})

router.post("/artwork", function (req, res, next) {
  try {
    const body = req.body
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const category = body.paintingCategory ? body.paintingCategory : ""
    const techniques = body.paintingTechniques ? body.paintingTechniques : ""
    const style = body.paintingStyle ? body.paintingStyle : ""
    const artwork = body.paintingArtwork ? body.paintingArtwork : ""
    const price = body.buyPrice ? body.buyPrice : "10000"

    const results = {}
    db.get().collection("artwork").find({
      $or:
        [{ paintingCategory: { $regex: `${category[0]}` } }, { paintingCategory: { $regex: `${category[1]}` } }, { paintingCategory: { $regex: `${category[2]}` } }, { paintingCategory: { $regex: `${category[3]}` } }, { paintingCategory: { $regex: `${category[4]}` } }, { paintingCategory: { $regex: `${category[5]}` } }, { paintingCategory: { $regex: `${category[6]}` } }, { paintingCategory: { $regex: `${category[7]}` } }, { paintingCategory: { $regex: `${category[8]}` } }, { paintingCategory: { $regex: `${category[9]}` } }, { paintingCategory: { $regex: `${category[10]}` } }, { paintingCategory: { $regex: `${category[3]}` } }, { paintingCategory: { $regex: `${category[4]}` } }, { paintingCategory: { $regex: `${category[5]}` } }, { paintingStyle: { $regex: `${style[0]}` } }, { paintingStyle: { $regex: `${style[1]}` } }, { paintingStyle: { $regex: `${style[2]}` } }, { paintingStyle: { $regex: `${style[3]}` } }, { paintingStyle: { $regex: `${style[4]}` } }, { paintingStyle: { $regex: `${style[5]}` } }, { paintingStyle: { $regex: `${style[6]}` } }, { paintingStyle: { $regex: `${style[7]}` } }, { paintingStyle: { $regex: `${style[8]}` } }, { paintingTechniques: { $regex: `${techniques[0]}` } }, { paintingTechniques: { $regex: `${techniques[1]}` } }, { paintingTechniques: { $regex: `${techniques[2]}` } }, { paintingTechniques: { $regex: `${techniques[3]}` } }, { paintingTechniques: { $regex: `${techniques[4]}` } }, { paintingTechniques: { $regex: `${techniques[5]}` } }, { paintingTechniques: { $regex: `${techniques[6]}` } }, { paintingTechniques: { $regex: `${techniques[7]}` } }, { paintingTechniques: { $regex: `${techniques[8]}` } }, { paintingTechniques: { $regex: `${techniques[9]}` } }, { paintingTechniques: { $regex: `${techniques[10]}` } }, { paintingTechniques: { $regex: `${techniques[11]}` } }, { paintingTechniques: { $regex: `${techniques[12]}` } }, { paintingTechniques: { $regex: `${techniques[13]}` } }, { paintingArtwork: { $regex: `${artwork[0]}` } }, { paintingArtwork: { $regex: `${artwork[1]}` } }, { paintingArtwork: { $regex: `${artwork[2]}` } }, { paintingArtwork: { $regex: `${artwork[3]}` } }, { paintingArtwork: { $regex: `${artwork[4]}` } }, { paintingArtwork: { $regex: `${artwork[5]}` } }]
    })
      .toArray(function (err, result) {
        if (err) console.log(err);
        if (err) throw err;
        else {
          result.filter((item) => {
            return item.buyPrice <= price
          })
          if (startIndex > 0) {
            results.previous = {
              page: page - 1,
              limit: limit
            }
          }
          if (endIndex < result.length) {
            results.next = {
              page: page + 1,
              limit: limit
            }
          }
          results.data = result.slice(startIndex, endIndex)
          res.send(
            httpUtil.success(200, "Artwork Data", { count: result.length, data: results })
          );
        }
      });
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

router.get("/blogSearch", function (req, res, next) {
  try {
    const key = req.query.key
    res.send({ key })
    db.get().collection("blog").find({
      $or:
        [{ postedBy: { $regex: key } }, { title: { $regex: key } }, { category: { $regex: key } }, { description: { $regex: key } }, { date: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { paintingCategory: { $regex: key } }, { paintingArtwork: { $regex: key } }, { paintingStyle: { $regex: key } }, { paintingTechniques: { $regex: key } }]
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

router.get("/:blog_id", function (req, res, next) {
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

// router.get("/artwork", function (req, res, next) {
//   const artwork_id = req.query.artwork_id ? ObjectId(req.query.artwork_id) : "";
//   res.send({ messa : artwork_id });
//   if (artwork_id) {
//     db.get()
//       .collection("artwork")
//       .aggregate([
//         {
//           $lookup : {
//             from : 'artist',
//             localField : 'artistId',
//             foreignField : '_id',
//             as : 'artist'
//           }
//         }
//       ])
//       .toArray(function (err, result) {
//         if (err) console.log(err);
//         res.send(httpUtil.success(200, "", result));
//       });
//   } else {    
//     res.status(204).send(httpUtil.error(204, "Artwork ID is missing."));
//   }
// });

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
});

router.get("/search", function (req, res, next) {
  res.send({ req: req.query.key })
  try {
    const key = req.query.key
    db.get().collection("artwork").find({
      $or:
        [{ artworkName: { $regex: key } }, { shortDescription: { $regex: key } }, { buyPrice: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { paintingCategory: { $regex: key } }, { paintingArtwork: { $regex: key } }, { paintingStyle: { $regex: key } }, { paintingTechniques: { $regex: key } }]
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

router.post("/comment", async function (req, res, next) {
  const body = req.body;
  const data = {
    name: body.name,
    email: body.email,
    feedback: body.feedback,
    createdAt: Date.now(),
    updatedAt: "",
    status: body.status ? body.status : "Active",
    blog_id: body.blog_id
  }

  db.get()
    .collection("comment")
    .insertOne(data, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "comment Creation Failed."));
      db.get().collection("comment").find({ blog_Id: body.blog_Id }).toArray(function (err, result) {
        if (err) res.send(err);
        db.get().collection("blog").updateOne({ _id: ObjectId(body.blog_id) }, { $set: { comments: result } }, function (err, result) {
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

router.get("/comment/:blog_id", function (req, res, next) {
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/", function (req, res, next) {
  db.get()
    .collection("comment")
    .find({})
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/cart/:cart_id", function (req, res, next) {
  const _id = req.params.cart_id ? ObjectId(req.params.cart_id) : ""
  db.get()
    .collection("cart")
    .find({ _id: _id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/confirmEnquiryEmail", function (req, res, next) {
  try {
    db.get()
      .collection("confirmEnquiryEmail")
      .find({})
      .toArray(function (err, result) {
        if (err) console.log(err);
        res.send(httpUtil.success(200, "", result));
      });
  } catch (err) {
    res.send({
      status: 400,
      success: false,
      error: err.message
    })
  }

});

module.exports = router;