var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var { ObjectId } = require("mongodb");
var httpUtil = require("../utilities/http-messages");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var secret = require("../conf/secrets");
var { customAlphabet } = require("nanoid");
var sendMail = require("../utilities/send-mail");
var async = require("async");
var JWT_Util = require("../utilities/jwt");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: secret.ADMIN_EMAIL,
    pass: secret.ADMIN_PASS
  }
});

var nanoid = customAlphabet(secret.NANOID_CHAR, secret.NANOID_LENGTH);
router.post("/token", function (req, res, next) {
  const accessToken = req.body.accessToken;
  const refreshToken = req.body.refreshToken;
  if (accessToken && refreshToken) {
    JWT_Util.createNewToken(refreshToken)
      .then((tokens) => {
        res.send(httpUtil.success(200, "New Token Generated.", tokens));
      })
      .catch((error) => {
        res.status(400).send(httpUtil.error(400, "Refresh Token Expires."));
      });
  } else {
    res.status(400).send(httpUtil.error(400, "Login Failed."));
  }
});

router.post("/login", function (req, res, next) {
  const type = req.body.type ? req.body.type : "client";
  const email = req.body.email ? req.body.email : ""; //userName apart email
  const password = req.body.password ? req.body.password : "";
  // res.send({
  //   type,email,password
  // })
  db.get()
    .collection(type)
    .find({ email: email })
    .toArray(function (err, dbresult) {
      if (err) res.status(406).send(httpUtil.error(406, "Database Error."));
      if (dbresult[0]) {
        bcrypt.compare(
          password,
          dbresult[0]["password"],
          function (error, result) {
            if (error)
              res.status(406).send(httpUtil.error(406, "Hashing Failed."));
            if (result) {
              let data = {
                id: dbresult[0]._id ? dbresult[0]._id : "",
                email: dbresult[0].email ? dbresult[0].email : "",
                email: dbresult[0].email ? dbresult[0].email : "",
              };
              let accessToken = jwt.sign(data, secret.JWT_SECRET, {
                expiresIn: secret.JWT_ACCESS_EXPIRESIN,
                algorithm: secret.JWT_ALGORITHM,
              });
              let refreshToken = jwt.sign(data, secret.JWT_SECRET, {
                expiresIn: secret.JWT_REFRESH_EXPIRESIN,
                algorithm: secret.JWT_ALGORITHM,
              });
              res.send(
                httpUtil.success(200, "Login Success.", {
                  accessToken: accessToken,
                  refreshToken: refreshToken,
                })
              );
            } else {
              res.status(406).send(httpUtil.error(406, "Invalid Password."));
            }
          }
        );
      } else {
        res.status(406).send(httpUtil.error(406, "Login Failed."));
      }
    });
});
// router.post("/forgotpassword", async (req, res, next) => {
//   let OTP = ''
//   function generateOTP() {
//     var digits = '0123456789';
//     for (let i = 0; i < 4; i++) {
//       OTP += digits[Math.floor(Math.random() * 10)];
//     }
//     return OTP;
//   }
//   try {
//     const email = req.body.email ? req.body.email : "";
//     db.get()
//       .collection("client")
//       .find({ email: email })
//       .toArray(function (err, result) {
//         if (err) {
//           res.send({
//             error: err,
//             status: 400,
//             success: false
//           })
//         } else {
//           if (result.length === 0) {
//             res.send({
//               error: "no user found!",
//               status: 400,
//               success: true
//             })
//           } else {
//             // res.send({result})
//             transporter.sendMail(mailOptions, function (error, info) {
//               if (error) {
//                 res.send(error);
//               } else {
//                 console.log('Email sent: ' + info.response);
//                 res.send({
//                   success: true,
//                   status: 200,
//                   message: result
//                 })
//               }
//             });

//             let context = {
//               code: nanoid()
//             };
//           }
//         }
//       })

//     var mailOptions = {
//       from: secret.ADMIN_EMAIL,
//       to: "amit979786@gmail.com",
//       subject: 'forgot password OTP',
//       text: `Forgot Password otp for new password generate ${generateOTP()}`
//     }
//   } catch (err) {
//     res.send({
//       message: err.message,
//       status: 400,
//       success: false
//     })
//   }
// })
//end
// router.post("/forgotpassword", function (req, res, next) {
// let OTP = ''
// function generateOTP() {
//   var digits = '0123456789';
//   for (let i = 0; i < 4; i++) {
//     OTP += digits[Math.floor(Math.random() * 10)];
//   }
//   return OTP;
// }
//   try {
//     const email = req.body.email ? req.body.email : "";
//     db.get()
//       .collection("client")
//       .find({ email: email })
//       .toArray(function (err, result) {
//         if(err){
//           res.send({
//             error : err,
//             status : 400,
//             success : false
//           })
//         }else{
//           if (result.length) {
//             let context = {
//               code: nanoid(),
//             };
//         }
//         var mailOptions = {
//           from: secret.ADMIN_EMAIL,
//           to: "amit979786@gmail.com",
//           subject: 'forgot password OTP',
//           text: `Forgot Password otp for new password generate ${generateOTP()}`
//       }
//       db.get()
//       .collection("client")
//       .updateOne(
//         { _id: ObjectId(result[0]._id) },
//         {
//           $set: {
//             otp=OTP,
//             resetcode: context.code,
//             updatedAt: Date.now(),
//           },
//         })
// catch (err) {
//   res.send({
//     error: err.message,
//     status: 400,
//     success: false
//   })
// })
// ],
//   function (err, result) {
//     if (err) {
//       res.status(500).send(httpUtil.error(500, "Forgot Password Error."));
//     } else {
//       res.send(httpUtil.success(200, "Forgot Password Mail Sent.", result));
//     }
//   }
// )
// } catch (err) {
//   res.send({
//     error: err.message,
//     status: 400,
//     success: false
//   })
// }
// });

module.exports = router;