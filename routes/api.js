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
// const { get } = require("request");
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
router.get("/comment", function (req, res, next) {
  db.get()
    .collection("comment")
    .find({}).limit(5)
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.post("/artwork", function (req, resp, next) {
  try {
    const body = req.body
    // resp.send({ req : body })
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const category = body.category ? body.category : ""
    const techniques = body.techniques ? body.techniques : ""
    const style = body.style ? body.style : ""
    const artwork = body.artwork ? body.artwork : ""
    const skips = page * limit
    const price = parseInt(body.buyPrice) ? parseInt(body.buyPrice) : 0
    if (price == "" && artwork == "" && style == "" && techniques == "" && category == "") {
      var totalRecord = 0
      var pages = 0

      db.get().collection("artwork").find({}).toArray((err, res) => {
        if (err) resp.send({ status: 400, success: false, error: err })
        totalRecord = res.length
        pages = Math.ceil(res.length / limit)
        console.log(res.length, limit, "pages" + pages)

        db.get().collection("artwork").find({}).skip(skips).limit(limit).toArray((err, result) => {
          if (err) {
            resp.send({
              status: 400,
              success: false,
              error: err
            })
          }
          else
            resp.send(httpUtil.success(200, "Artwork Data", { pageNumber: page, limits: limit, perPageCount: result.length, totalPages: pages, count: totalRecord, data: result }));
        })
      })
    }
    else if (price > 0 && artwork === "" && style === "" && techniques === "" && category === "") {
      var totalRecord = 0
      var pages = 0
      db.get().collection("artwork").find({ buyPrice: { $lte: price } })
        .toArray(function (err, res) {
          if (err) res.send({ error: 400, status: false, error: err })
          else {
            totalRecord = res.length
            pages = Math.ceil(res.length / limit)
            // console.log(res.length, limit, "pages price" + pages)
          }
        });
      db.get().collection("artwork").find({ buyPrice: { $lte: price } }).skip(skips).limit(limit)
        .toArray(function (err, result) {
          if (err) {
            resp.send({
              error: err,
              status: 400,
              success: false
            })
          }
          else {
            resp.send(httpUtil.success(200, "Artwork Data", { pageNumber: page, limits: limit, perPageCount: result.length, totalPages: pages, count: totalRecord, data: result }));
          }
        })
    }
    else {
      var totalRecord = 0
      var pages = 0
      db.get().collection("artwork").find({
        $or:
          [{ category: { $regex: `${category[0]}` } }, { category: { $regex: `${category[1]}` } }, { category: { $regex: `${category[2]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { category: { $regex: `${category[6]}` } }, { category: { $regex: `${category[7]}` } }, { category: { $regex: `${category[8]}` } }, { category: { $regex: `${category[9]}` } }, { category: { $regex: `${category[10]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { style: { $regex: `${style[0]}` } }, { style: { $regex: `${style[1]}` } }, { style: { $regex: `${style[2]}` } }, { style: { $regex: `${style[3]}` } }, { style: { $regex: `${style[4]}` } }, { style: { $regex: `${style[5]}` } }, { style: { $regex: `${style[6]}` } }, { style: { $regex: `${style[7]}` } }, { style: { $regex: `${style[8]}` } }, { techniques: { $regex: `${techniques[0]}` } }, { techniques: { $regex: `${techniques[1]}` } }, { techniques: { $regex: `${techniques[2]}` } }, { techniques: { $regex: `${techniques[3]}` } }, { techniques: { $regex: `${techniques[4]}` } }, { techniques: { $regex: `${techniques[5]}` } }, { techniques: { $regex: `${techniques[6]}` } }, { techniques: { $regex: `${techniques[7]}` } }, { techniques: { $regex: `${techniques[8]}` } }, { techniques: { $regex: `${techniques[9]}` } }, { techniques: { $regex: `${techniques[10]}` } }, { techniques: { $regex: `${techniques[11]}` } }, { techniques: { $regex: `${techniques[12]}` } }, { techniques: { $regex: `${techniques[13]}` } }, { artwork: { $regex: `${artwork[0]}` } }, { artwork: { $regex: `${artwork[1]}` } }, { artwork: { $regex: `${artwork[2]}` } }, { artwork: { $regex: `${artwork[3]}` } }, { artwork: { $regex: `${artwork[4]}` } }]
      }).toArray((err, res) => {
        if (err) resp.send({ status: 400, success: false, error: err })
        else {
          // console.log(res.filter(item => item.buyPrice <= 50000))
          var counterResult = res.filter(function (item) {
            return item.buyPrice <= price;
          });
          totalRecord = counterResult.length
          pages = Math.ceil(counterResult.length / limit)
          console.log(counterResult.length, limit, "pages" + pages)
          db.get().collection("artwork").find({
            $or:
              [{ category: { $regex: `${category[0]}` } }, { category: { $regex: `${category[1]}` } }, { category: { $regex: `${category[2]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { category: { $regex: `${category[6]}` } }, { category: { $regex: `${category[7]}` } }, { category: { $regex: `${category[8]}` } }, { category: { $regex: `${category[9]}` } }, { category: { $regex: `${category[10]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { style: { $regex: `${style[0]}` } }, { style: { $regex: `${style[1]}` } }, { style: { $regex: `${style[2]}` } }, { style: { $regex: `${style[3]}` } }, { style: { $regex: `${style[4]}` } }, { style: { $regex: `${style[5]}` } }, { style: { $regex: `${style[6]}` } }, { style: { $regex: `${style[7]}` } }, { style: { $regex: `${style[8]}` } }, { techniques: { $regex: `${techniques[0]}` } }, { techniques: { $regex: `${techniques[1]}` } }, { techniques: { $regex: `${techniques[2]}` } }, { techniques: { $regex: `${techniques[3]}` } }, { techniques: { $regex: `${techniques[4]}` } }, { techniques: { $regex: `${techniques[5]}` } }, { techniques: { $regex: `${techniques[6]}` } }, { techniques: { $regex: `${techniques[7]}` } }, { techniques: { $regex: `${techniques[8]}` } }, { techniques: { $regex: `${techniques[9]}` } }, { techniques: { $regex: `${techniques[10]}` } }, { techniques: { $regex: `${techniques[11]}` } }, { techniques: { $regex: `${techniques[12]}` } }, { techniques: { $regex: `${techniques[13]}` } }, { artwork: { $regex: `${artwork[0]}` } }, { artwork: { $regex: `${artwork[1]}` } }, { artwork: { $regex: `${artwork[2]}` } }, { artwork: { $regex: `${artwork[3]}` } }, { artwork: { $regex: `${artwork[4]}` } }]
          }).skip(skips).limit(limit)
            .toArray(function (err, result) {
              if (err) resp.send({
                status: 400,
                success: false,
                error: err
              })
              else {
                var results = result.filter(function (item) {
                  return item.buyPrice <= price;
                });
                resp.send(httpUtil.success(200, "Artwork Data", { pageNumber: page, limits: limit, perPageCount: results.length, totalPages: pages, count: totalRecord, data: results }));
              }
            });
        }
      })
    }

  } catch (err) {
    resp.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
});

// router.post("/artwork", function (req, res, next) {
//   try {
//     const body = req.body
//     // res.send({ body })
//     const page = parseInt(body.page)
//     const limit = parseInt(body.limit)
//     const startIndex = (page - 1) * limit
//     const endIndex = page * limit
//     const category = body.category ? body.category : ""
//     const techniques = body.techniques ? body.techniques : ""
//     const style = body.style ? body.style : ""
//     const artwork = body.artwork ? body.artwork : ""
//     const price = body.buyPrice ? body.buyPrice : "10000"
//     const results = {}
//     db.get().collection("artwork").find({
//       $or:
//         [{ category: { $regex: `${category[0]}` } }, { category: { $regex: `${category[1]}` } }, { category: { $regex: `${category[2]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { category: { $regex: `${category[6]}` } }, { category: { $regex: `${category[7]}` } }, { category: { $regex: `${category[8]}` } }, { category: { $regex: `${category[9]}` } }, { category: { $regex: `${category[10]}` } }, { category: { $regex: `${category[3]}` } }, { category: { $regex: `${category[4]}` } }, { category: { $regex: `${category[5]}` } }, { style: { $regex: `${style[0]}` } }, { style: { $regex: `${style[1]}` } }, { style: { $regex: `${style[2]}` } }, { style: { $regex: `${style[3]}` } }, { style: { $regex: `${style[4]}` } }, { style: { $regex: `${style[5]}` } }, { style: { $regex: `${style[6]}` } }, { style: { $regex: `${style[7]}` } }, { style: { $regex: `${style[8]}` } }, { techniques: { $regex: `${techniques[0]}` } }, { techniques: { $regex: `${techniques[1]}` } }, { techniques: { $regex: `${techniques[2]}` } }, { techniques: { $regex: `${techniques[3]}` } }, { techniques: { $regex: `${techniques[4]}` } }, { techniques: { $regex: `${techniques[5]}` } }, { techniques: { $regex: `${techniques[6]}` } }, { techniques: { $regex: `${techniques[7]}` } }, { techniques: { $regex: `${techniques[8]}` } }, { techniques: { $regex: `${techniques[9]}` } }, { techniques: { $regex: `${techniques[10]}` } }, { techniques: { $regex: `${techniques[11]}` } }, { techniques: { $regex: `${techniques[12]}` } }, { techniques: { $regex: `${techniques[13]}` } }, { artwork: { $regex: `${artwork[0]}` } }, { artwork: { $regex: `${artwork[1]}` } }, { artwork: { $regex: `${artwork[2]}` } }, { artwork: { $regex: `${artwork[3]}` } }, { artwork: { $regex: `${artwork[4]}` } }, { artwork: { $regex: `${artwork[5]}` } }]
//     })
//       .toArray(function (err, result) {
//         if (err) console.log(err);
//         if (err) throw err;
//         else {
//           result.filter((item) => {
//             return item.buyPrice <= price
//           })
//           if (startIndex > 0) {
//             results.previous = {
//               page: page - 1,
//               limit: limit
//             }
//           }
//           if (endIndex < result.length) {
//             results.next = {
//               page: page + 1,
//               limit: limit
//             }
//           }
//           results.data = result.slice(startIndex, endIndex)
//           res.send(
//             httpUtil.success(200, "Artwork Data", { count: result.length, results }) 
//           );
//         }
//       });
//   } catch (err) {
//     res.send({
//       status: 400,
//       error: err.message,
//       success: false
//     })
//   }
// });

router.get("/cart", function (req, res, next) {
  try {
    db.get().collection("cart").aggregate([
      {
        $lookup:
        {
          from: "artwork",
          localField: "artworkId",
          foreignField: "_id",
          as: "artwork"
        }
      },
      { $unwind: "$artwork" },
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
    // res.send({ artwork_id })
    db.get().collection("artwork").aggregate([
      {
        $lookup:
        {
          from: "artist",
          localField: "artistId",
          foreignField: "_id",
          as: "artist"
        }
      },
      { $unwind: "$artist" },
      {
        "$project": {
          "artist.painting": 0
        }
      },
      {
        $match: { _id: artwork_id }
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
  // db.get()
  //   .collection("cart")
  //   .find({ userId: userId })
  //   .toArray(function (err, result) {
  //     if (err) res.send({ status: 400, success: false, error: err.message });
  //     res.send({ status: 200, success: true, data: result })
  //   });
  try {
    db.get().collection("cart").aggregate([
      {
        $lookup:
        {
          from: "artwork",
          localField: "artworkId",
          foreignField: "_id",
          as: "artwork"
        }
      },
      { $unwind: "$artwork" },
      {
        $match: { userId: userId }
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
router.post("/cart", upload.array("selectedFrames"), async function (req, res, next) {
  try {
    const imageFiles = req.files ? req.files : [];
    const imagePath = []
    const body = req.body
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        let imgObj = "http://localhost:3000/uploads/cart/frames/" + `${imageFiles[i].originalname}`
        imagePath.push(imgObj)
      }
      body.selectedFrames = imagePath
    }
    const data = {
      selectedFrames: body.selectedFrames,
      artworkId: ObjectId(body.artworkId),
      userId: body.userId,
      status: body.status ? body.status : "Active",
      // buyPrice: body.buyPrice ? body.buyPrice : "",
      // rentPrice: body.rentPrice ? body.rentPrice : "",
      artistName: body.artistName ? body.artistName : "",
      buy: body.buy ? true : false,
      rent: body.rent ? false : true
      // cartId: body.cartId ? body.cartId : ""
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

router.post("/eventProgram", function (req, res, next) {
  try {
    const context = {
      name: req.body.name ? req.body.name : "",
      eventType: req.body.eventType ? req.body.eventType : "",
      eventTitle: req.body.eventTitle ? req.body.eventTitle : "",
      email: req.body.email ? req.body.email : "",
      phone: req.body.phone ? req.body.phone : "",
      subject: req.body.subject ? req.body.subject : "",
      comment: req.body.comment ? req.body.comment : "",
    };
    var mailOptions = {
      from: secret.ADMIN_EMAIL,
      to: context.email,
      subject: 'no reply',
      text: `Thank you for registeration on ${context.eventTitle} !`
    };
    var mailAdminOptions = {
      from: secret.ADMIN_EMAIL,
      to: "amit979786@gmail.com",  //admin reciever email
      subject: `New Registration for ${context.eventTitle}`,
      html: `<h1>Event Title : ${context.eventTitle}</h1><br><h1>Event Type : ${context.eventType}</h1><br><h2>Name : ${context.name}</h2><br><h2>Email : ${context.email}</h2><br><h2>Phone : ${context.phone}</h2><br><h2>Subject : ${context.subject}</h2><br><h2>Comment : ${context.comment}</h2>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.send(error);
      } else {
        // console.log('Email sent: ' + info.response);
        transporter.sendMail(mailAdminOptions, (err, confirm) => {
          if (err) {
            res.send({
              error: err,
              status: 400,
              success: false
            })
          }
          console.log(confirm.response)
          res.send({
            success: true,
            status: 200,
            message: "Email sent successfully !"
          })
        })
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

router.post("/program", function (req, res, next) {
  // res.send({ req : req.body })
  try {
    const context = {
      programTitle: req.body.programTitle ? req.body.programTitle : "",
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
    var mailAdminOptions = {
      from: secret.ADMIN_EMAIL,
      to: "amit979786@gmail.com",
      subject: 'New Enquiry',
      html: `<h1>Title : ${context.programTitle}</h1><br><h2>Name : ${context.name}</h2><br><h2>Email : ${context.email}</h2><br><h2>Phone : ${context.phone}</h2><br><h2>Subject : ${context.subject}</h2><br><h2>Comment : ${context.comment}</h2>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.send(error);
      } else {
        // console.log('Email sent: ' + info.response);
        transporter.sendMail(mailAdminOptions, (err, confirm) => {
          if (err) {
            res.send({
              error: err,
              status: 400,
              success: false
            })
          }
          console.log(confirm.response)
          res.send({
            success: true,
            status: 200,
            message: "Email sent successfully !"
          })
        })
      }
    });
  } catch (err) {
    res.send({
      error: err.message,
      success: false,
      status: 400
    })
  }
});

router.post("/connect", function (req, res, next) {
  res.send({ req: req.body })
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
  var mailAdminOptions = {
    from: secret.ADMIN_EMAIL,
    to: "amit979786@gmail.com",
    subject: 'New Enquiry',
    html: `<h2>Name : ${context.name}</h2><br><h2>Email : ${context.email}</h2><br><h2>Phone : ${context.phone}</h2><br><h2>Subject : ${context.subject}</h2><br><h2>Comment : ${context.comment}</h2>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      // console.log('Email sent: ' + info.response);
      transporter.sendMail(mailAdminOptions, (err, confirm) => {
        if (err) {
          res.send({
            error: err,
            status: 400,
            success: false
          })
        }
        console.log(confirm.response)
        res.send({
          success: true,
          status: 200,
          message: "Email sent successfully !"
        })
      })
    }
  });
});

// router.post("/education", function (req, res, next) {
//   res.send({ req : req.body })
//   const context = {
//     name: req.body.name ? req.body.name : "",
//     email: req.body.email ? req.body.email : "",
//     phone: req.body.phone ? req.body.phone : "",
//     subject: req.body.subject ? req.body.subject : "",
//     comment: req.body.comment ? req.body.comment : "",
//   };

//   var mailOptions = {
//     from: secret.ADMIN_EMAIL,
//     to: context.email,
//     subject: 'no reply',
//     text: 'thank you for your registration !'
//   };
//   var mailAdminOptions = {
//     from: secret.ADMIN_EMAIL,
//     to: "amit979786@gmail.com",
//     subject: 'New Enquiry',
//     html: `<h2>Name : ${context.name}</h2><br><h2>Email : ${context.email}</h2><br><h2>Phone : ${context.phone}</h2><br><h2>Subject : ${context.subject}</h2><br><h2>Comment : ${context.comment}</h2>`
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       res.send(error);
//     } else {
//       // console.log('Email sent: ' + info.response);
//       transporter.sendMail(mailAdminOptions, (err, confirm) => {
//         if (err) {
//           res.send({
//             error: err,
//             status: 400,
//             success: false
//           })
//         }
//         console.log(confirm.response)
//         res.send({
//           success: true,
//           status: 200,
//           message: "Email sent successfully !"
//         })
//       })
//     }
//   });
// });

router.post("/confirmEnquiryEmail", function (req, res, next) {

  try {
    const body = req.body
    if (body.name !== "" || body.email !== "" || body.address !== "" || body.phone !== "" || body.buyPrice !== "" || body.artworkName !== "") {
      var adminOptions = {
        from: secret.ADMIN_EMAIL,
        to: body.email,
        subject: body.buyPrice ? "we got new enquiry for buy Artwork from Art India Art" : "enquiry for rent Artwork from Art India Art",
        html: `
      <html>
        <body>
        <table border="1">
          <caption><b>Client Information</b></caption>
          <tr>
            <th>Client Name : <th>
            <td colspan=2>${body.name}<td>
          </tr>
          <tr>
            <th>Client Email : <th>
            <td colspan=2>${body.email}<td>
          </tr>
          <tr>
            <th>Client Contact : <th>
            <td colspan=2>${body.phone}<td>
          </tr>
          <tr>
            <th>Client Address : <th>
            <td colspan=2>${body.address}<td>
          </tr>
          <tr>
            <th>Product : <th>
            <td colspan=2>${body.artworkName}<td>
          </tr>
          <tr>
            <th>Price : <th>
            <td colspan=2>${body.buyPrice ? body.buyPrice : body.rentPrice}<td>
          </tr>
          <tr>
            <th>Selected Frame Url : </th>
            <td colspan=2><a href=${body.selectedFramesUrl}>Click here to view frame</a></td>
          </tr>
        </table>
          </body>
            </html>`
      };

      var mailOptions = {
        from: secret.ADMIN_EMAIL,
        to: body.email,
        subject: body.buyPrice ? "we got enquiry for buy Artwork from Art India Art" : "enquiry for rent Artwork from Art India Art",
        html: `<div style="box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"><b>Artwork Name</b> : <h3>${body.artworkName}</h3><br> <b>Rate</b> : <h3>${body.buyPrice ? body.buyPrice : body.rentPrice}</h3><br><b>Message</b> : <h3>Our team will contact to you soon !</h3><br></div>`
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          res.send({ status: 400, success: false, error: err })
        } else {
          transporter.sendMail(adminOptions, (err, confirm) => {
            if (err) {
              res.send({
                error: err,
                status: 400,
                success: false
              })
            }
            console.log(confirm.response)
            res.send({
              success: true,
              status: 200,
              message: "Email sent successfully !"
            })
          })
        }
      });
    }
    else {
      res.send({
        status: 400,
        error: "all fields are requirs",
        success: false
      })
    }
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
    text: 'thank you for your Feedback !'
  };
  var mailAdminOptions = {
    from: secret.ADMIN_EMAIL,
    to: "amit979786@gmail.com",
    subject: 'New Enquiry',
    html: `<h2>Name : ${context.name}</h2><br><h2>Email : ${context.email}</h2><br><h2>Phone : ${context.phone}</h2><br><h2>Subject : ${context.subject}</h2><br><h2>Comment : ${context.comment}</h2>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send(error);
    } else {
      // console.log('Email sent: ' + info.response);
      transporter.sendMail(mailAdminOptions, (err, confirm) => {
        if (err) {
          res.send({
            error: err,
            status: 400,
            success: false
          })
        }
        console.log(confirm.response)
        res.send({
          success: true,
          status: 200,
          message: "Email sent successfully !"
        })
      })
    }
  });
});

// router.get("/artistType", function (req, res, next) {
//   try {
//     const type = req.query.type
//     const body = req.body
//     const page = parseInt(body.page)
//     const limit = parseInt(body.limit)
//     const skips = page * limit
//     var totalRecord = 0
//     var pages = 0
//     db.get().collection("artist").find({ artist_type: type }).toArray((err, resp) => {
//       if (err) {
//         resp.send({
//           status: 400,
//           success: false,
//           error: err
//         })
//       }
//       else {
//         totalRecord = resp.length
//         pages = Math.ceil(resp.length / limit)
//         console.log(resp.length, limit, "pages" + pages)
//         db.get().collection("artist").aggregate([
//           {
//             $lookup:
//             {
//               from: "artwork",
//               localField: "_id",
//               foreignField: "artistId",
//               as: "painting"
//             }
//           },
//           { $match: { artist_type: type } }
//         ]).skip(skips).limit(limit).toArray((err, result) => {
//           console.log(result.length + "limit" + limit + "skip" + skips)
//           if (err) res.send({ error: err, status: 400, success: false })
//           else {
//             // res.send({ status: 200, count: result.length, data: result, success: true })
//             res.send(httpUtil.success(200, "Artist Data", { success: true, pageNumber: page, limits: limit, perPageCount: result.length, totalPages: pages, count: totalRecord, data: result }));
//           }
//         })
//       }
//     })
//   } catch (err) {
//     res.send({
//       status: 400,
//       error: err.message,
//       success: false
//     })
//   }

// });

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
  try {
    const letter = req.query.letter
    const body = req.body
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const skips = page * limit
    var totalRecord = 0
    var pages = 0
    db.get().collection("artist").find({ name: { $regex: '^' + letter + '' } }).toArray((err, resp) => {
      if (err) {
        res.send({
          error: err,
          status: 400,
          success: false
        })
      }
      else {
        totalRecord = resp.length
        pages = Math.ceil(resp.length / limit)
        console.log(resp.length, limit, "pages" + pages)
        db.get().collection("artist").aggregate([
          {
            $lookup:
            {
              from: "artwork",
              localField: "_id",
              foreignField: "artistId",
              as: "painting"
            }
          },
          { $match: { name: { $regex: '^' + letter + '' } } }
        ]).skip(skips).limit(limit).toArray((err, result) => {
          if (err) res.send({ error: err.message, success: false, status: 400 })
          else {
            res.send({ success: true, pageNumber: page, perPageCount: result.length, limits: limit, totalPages: pages, count: totalRecord, data: result })
          }
        })
      }
    })
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
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

// router.get("/blog/:blog_id", function (req, res, next) {
//   res.send({ mess : "" }) 
//   const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
//   db.get().collection("blog").aggregate([
//     {
//       $lookup:
//       {
//         from: "comment",
//         localField: "_id",
//         foreignField: "blog_id",
//         as: "comment"
//       }
//     },
//     { $unwind: "$comment" },
//     { match: { _id: _id } }
//   ]).toArray((err, result) => {
//     var cnt = result.comment.length
//     if (err) res.send({ error: err.message })
//     else {
//       res.send({ status: 200, count: result.length, data: result, success: true, totalComment: cnt })
//     }
//   })
// });

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

router.get("/news/:news_id", function (req, res, next) {
  const news_id = ObjectId(req.params.news_id)
  db.get()
    .collection("news")
    .find({ _id: news_id })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(httpUtil.success(200, "", result));
    });
});

router.get("/news_gallery", function (req, res, next) {
  db.get()
    .collection("news_gallery")
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
  try {
    const body = req.body
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const skips = page * limit
    var totalRecord = 0
    var pages = 0

    db.get().collection("blog").find({}).toArray((err, counter) => {
      if (err) {
        res.send({
          status: 400,
          error: err,
          success: false
        })
      }
      else {
        totalRecord = counter.length
        pages = Math.ceil(counter.length / limit)
        console.log(counter.length, limit, "blog" + pages)
        db.get().collection("blog").aggregate([
          {
            $lookup:
            {
              from: "comment",
              localField: "_id",
              foreignField: "blog_id",
              as: "comment"
            }
          },
        ]).skip(skips).limit(limit).toArray((err, result) => {
          if (err) res.send({ error: err.message })
          else {
            for (var i = 0; i < result.length; i++) {
              result[i].totalComment = result[i].comment.length
            }
            res.send({ status: 200, success: true, perPageCount: result.length, totalPages: pages, pageNumber: page, limits: limit, totalPages: totalRecord, data: result })
          }
        })
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

router.get("/blogSearch", function (req, res, next) {
  try {
    const key = req.body.key
    const body = req.body
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const skips = page * limit
    var totalRecord = 0
    var pages = 0

    db.get().collection("blog").find({ title: key }).toArray((err, counter) => {
      if (err) {
        res.send({
          status: 400,
          error: err,
          success: false
        })
      }
      else {
        totalRecord = counter.length
        pages = Math.ceil(counter.length / limit)
        console.log(counter.length, limit, "blog" + pages)
        db.get().collection("blog").aggregate([
          {
            $lookup:
            {
              from: "comment",
              localField: "_id",
              foreignField: "blog_id",
              as: "comment"
            }
          },
          { $match: { title: key } },
        ]).skip(skips).limit(limit).toArray((err, result) => {
          if (err) res.send({ error: err.message })
          else {
            for (var i = 0; i < result.length; i++) {
              result[i].totalComment = result[i].comment.length
            }
            res.send({ status: 200, success: true, perPageCount: result.length, totalPages: pages, pageNumber: page, limits: limit, totalPages: totalRecord, data: result })
          }
        })
      }
    })
    // db.get().collection("blog").aggregate([
    //   {
    //     $lookup:
    //     {
    //       from: "comment",
    //       localField: "_id",
    //       foreignField: "blog_id",
    //       as: "comment"
    //     }
    //   },
    //   // { $match: { title: key } },
    // ]).toArray(function (err, result) {
    //   if (err) console.log(err)
    //   res.send(httpUtil.success({
    //     status: 200,
    //     success: true,
    //     result,
    //     totalCount: result.length
    //   }))
    // });
  } catch (err) {
    res.send(httpUtil.error(400, { error: err.message }))
  }
});

router.get("/blogCategory", function (req, res, next) {
  try {
    const body = req.body
    const category = req.query.category
    const page = parseInt(body.page)
    const limit = parseInt(body.limit)
    const skips = page * limit
    var totalRecord = 0
    var pages = 0
    db.get().collection("blog").find({ category: category }).toArray((err, resp) => {
      if (err) {
        res.send({
          status: 400,
          success: false,
          error: err
        })
      }
      else {
        totalRecord = resp.length
        pages = Math.ceil(resp.length / limit)
        console.log("blog Category" + pages, totalRecord, "limit" + limit + "skips" + skips)

        db.get().collection("blog").aggregate([
          {
            $lookup:
            {
              from: "comment",
              localField: "_id",
              foreignField: "blog_id",
              as: "comment"
            }
          }, { $match: { category: category } }
        ]).skip(skips).limit(limit)
          .toArray(function (err, result) {
            if (err) res.send({ status: 400, success: false, error: err })
            for (var i = 0; i < result.length; i++) {
              result[i].totalComment = result[i].comment.length
            }
            // res.send(httpUtil.success(200, "", result));
            res.send(httpUtil.success(200, "Blog Data", { success: true, perPageCount: result.length, pageNumber: page, limits: limit, totalPages: pages, count: totalRecord, data: result }));
          });
      }
    })
  } catch (err) {
    res.send({
      error: err.message,
      success: false,
      status: 400
    })
  }

});

// router.get("/eventSearch", function (req, res, next) {
//   try {
//     const key = req.query.key
//     db.get().collection("event").find({
//       $or:
//         [{ name: { $regex: key } }, { event_type: { $regex: key } }]
//     })
//       .toArray(function (err, result) {
//         if (err) console.log(err)
//         res.send(httpUtil.success({
//           status: 200,
//           success: true,
//           result,
//           totalCount: result.length
//         }))
//       });
//   } catch (err) {
//     res.send(httpUtil.error(400, { error: err.message }))
//   }
// });

router.get("/artist", function (req, res, next) { 
  const type = req.query.type 
  // res.send({ type })
  const body = req.body
  const page = parseInt(body.page)
  const limit = parseInt(body.limit)
  const skips = page * limit
  var totalRecord = 0
  var pages = 0
  if (type) {
    db.get().collection("artist").find({ artist_type : type }).skip(skips).limit(limit).toArray((err, resp) => {
      if (err) {
        res.send({
          status: 400,
          success: false,
          error: err
        })
      } else {
        totalRecord = resp.length
        pages = Math.ceil(resp.length / limit)
        // console.log(resp.length, limit, "blog" + pages)
        db.get().collection("artist").aggregate([
          {
            $lookup:
            {
              from: "artwork",
              localField: "_id",
              foreignField: "artistId",
              as: "painting"
            }
          },
          { $match : { artist_type : type }}
          // { $unwind: "$painting" },
        ]).toArray((err, result) => {
          if (err) res.send({ error: err, status : 400, success : false })
          else
            // for (var i = 0; i < result.length; i++) {
            //   console.log(result[i].name)
            // }
          // res.send({ status: 200, count: result.length, data: result, success: true })
          res.send({ success: true, pageNumber: page, perPageCount: result.length, limits: limit, totalPages: pages, count: totalRecord, data: result })
        })
      }
    })
  } else {
    db.get().collection("artist").find({}).skip(skips).limit(limit).toArray((err, resp) => {
      if (err) {
        res.send({
          status: 400,
          success: false,
          error: err
        })
      } else {
        totalRecord = resp.length
        pages = Math.ceil(resp.length / limit)
        // console.log(resp.length, limit, "blog" + pages)
        db.get().collection("artist").aggregate([
          {
            $lookup:
            {
              from: "artwork",
              localField: "_id",
              foreignField: "artistId",
              as: "painting"
            }
          },
          // { $unwind: "$painting" },
        ]).toArray((err, result) => {
          if (err) res.send({ error: err.message })
          else
            // for (var i = 0; i < result.length; i++) {
              // console.log(result[i].name)
            // }
          // res.send({ status: 200, count: result.length, data: result, success: true })
          res.send({ success: true, pageNumber: page, perPageCount: result.length, limits: limit, totalPages: pages, count: totalRecord, data: result })
        })
      }
    })
  }
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
  // router.get("/artist", function (req, res, next) {
  db.get().collection("artwork").aggregate([
    {
      $lookup:
      {
        from: "artist",
        localField: "artistId",
        foreignField: "_id",
        as: "artist"
      }
    },
    { $unwind: "$artist" },
  ]).toArray((err, result) => {
    if (err) res.send({ error: err.message })
    else {
      res.send({ status: 200, count: result.length, data: result, success: true })
    }
  })
});

router.put("/blogLike", function (req, res, next) {
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

// router.get("/blogSearch", function (req, res, next) {
//   try {
//     const key = req.query.key
//     res.send({ key })
//     db.get().collection("blog").find({
//       $or:
//         [{ postedBy: { $regex: key } }, { title: { $regex: key } }, { category: { $regex: key } }, { description: { $regex: key } }, { date: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { category: { $regex: key } }]
//     })
//       .toArray(function (err, result) {
//         if (err) console.log(err)
//         res.send(httpUtil.success({
//           status: 200,
//           success: true,
//           result,
//           totalCount: result.length
//         }))
//       });
//   } catch (err) {
//     res.send(httpUtil.error(400, { error: err.message }))
//   }
// });

router.get("/blogs", function (req, res, next) {
  try {
    const blog_id = req.query.blog_id ? ObjectId(req.query.blog_id) : ""
    console.log(blog_id)
    db.get().collection("blog").aggregate([
      {
        $lookup:
        {
          from: "comment",
          localField: "_id",
          foreignField: "blog_id",
          as: "comment"
        }
      },
      { $match: { _id: blog_id } }
    ]).toArray((err, result) => {
      if (err) res.send({ error: err.message, status: 400, success: false })
      else {
        for (var i = 0; i < result.length; i++) {
          result[i].totalComment = result[i].comment.length
        }
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
  // res.send({ req: req.query.key })
  try {
    const key = req.query.key
    db.get().collection("artwork").find({
      $or:
        [{ artworkName: { $regex: key } }, { shortDescription: { $regex: key } }, { buyPrice: { $regex: key } }, { style: { $regex: key } }, { artistname: { $regex: key } }, { size: { $regex: key } }, { orientation: { $regex: key } }, { length: { $regex: key } }, { orientation: { $regex: key } }, { category: { $regex: key } }, { artwork: { $regex: key } }, { style: { $regex: key } }, { techniques: { $regex: key } }]
    })
      .toArray(function (err, result) {
        if (err) console.log(err)
        res.send(httpUtil.success({
          status: 200,
          success: true,
          result,
          totalCount: result.length ? result.length : []
        }))
      });
  } catch (err) {
    res.send(httpUtil.error(400, { error: err.message }))
  }
});

router.post("/comment", async function (req, res, next) {
  const body = req.body;
  // res.send({body})
  const data = {
    name: body.name,
    email: body.email,
    feedback: body.feedback,
    createdAt: Date.now(),
    updatedAt: "",
    status: body.status ? body.status : "Active",
    blog_id: ObjectId(body.blog_id)
  }

  db.get()
    .collection("comment")
    .insertOne(data, function (err, dbresult) {
      if (err)
        res.status(500).send(httpUtil.error(500, "comment Creation Failed."));
      // db.get().collection("comment").find({ blog_Id: body.blog_Id }).toArray(function (err, result) {
      //   if (err) res.send(err);
      //   db.get().collection("blog").updateOne({ _id: ObjectId(body.blog_id) }, { $set: { comments: result } }, function (err, result) {
      //     if (err) {
      //       res.status(204).send(httpUtil.error(204, err.message));
      //     }
      else
        res.send({
          status: 200,
          success: true,
          message: "Comment Created"
        })
    })
})
//     })
// })

router.get("/comments/:blog_id", function (req, res, next) {
  const _id = req.params.blog_id ? ObjectId(req.params.blog_id) : ""
  db.get()
    .collection("blog")
    .find({ _id: _id })
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

/*
  http://localhost:3000/api/artwork
  *post API get artwork by filter

  http://localhost:3000/api/blog
  *get API updated 
  
*/