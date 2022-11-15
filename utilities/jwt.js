var jwt = require("jsonwebtoken");
var secret = require("../conf/secrets");
var httpUtil = require("../utilities/http-messages");
var db = require("../dbconfig");

module.exports.authenticateToken = async function (req, res, next) {
  try {
    var token = req.headers.authorization
    // res.send({
    //   tokens : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNmUyOWMyZmZkYWQ5NzBkZWViOTA1NCIsImVtYWlsIjoiYW1pdEBnbWFpbC5jb20iLCJpYXQiOjE2Njg1MTY2MDYsImV4cCI6MTY2ODUyMDIwNn0.7wHC-LTcTR5PLDdT5QcQoTWlmQgn3fiEoGCkr0avpgQ",
    //   token : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNmUyOWMyZmZkYWQ5NzBkZWViOTA1NCIsImVtYWlsIjoiYW1pdEBnbWFpbC5jb20iLCJpYXQiOjE2Njg1MTUyNTEsImV4cCI6MTY2ODUxODg1MX0.7HKmhOA3MMH1FZfWQMjxY5NqvBGnL6P5rEmYNA9_yyQ",
    //   tokend : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNmUyOWMyZmZkYWQ5NzBkZWViOTA1NCIsImVtYWlsIjoiYW1pdEBnbWFpbC5jb20iLCJpYXQiOjE2Njg1MTUyNTEsImV4cCI6MTY2ODUxODg1MX0.7HKmhOA3MMH1FZfWQMjxY5NqvBGnL6P5rEmYNA9_yyQ"
    // })
    // res.send({
    //   token
    // })
    db.get().collection("client").find({ accessToken: token }).toArray(function (err, result) {
      if (err) {
        res.send({
          error: err,
          status: 400,
          success: false
        })
      } else {
        if (result.length === 0) {
          res.send({
            error: "invalid token",
            status: 400,
            success: true
          })
        }
        else {
          next()
        }
      }
    })
  } catch (err) {
    res.send({
      status: 400,
      error: err.message,
      success: false
    })
  }
}
// res.send({ 
//   result,
//   auth : token
// })
//  console.log('user')
//    if (!user) {
//      res.send({
//        notice: "You have sent invalid token.",
//        status: 401,
//        success: false
//      }).status(401);
//    }
//    else {
//     // console.log('user',user)
//      req.user = user;
//      req.token = token;
//      next();
//    }
//  })
//  .catch(err => {
//  //  console.log('err',err)
//    res.status(401).send({
//      notice: "Token invalid.",
//      status: 401,
//      success: false,
//      error: err.message
//    });
//  });
//  }
//   const authHeader = req.headers.authorization;
//   if (authHeader) 
//   {
//     const token = authHeader
//     jwt.verify(JSON.parse(token), secret.JWT_SECRET, (err, user) => {
//       if (err) {
//         return res.status(401).send(httpUtil.error(401, "Invalid Token.", err));
//       }
//       req.user = user;
//       next();
//     });
//   } else {
//     return res.status(401).send(httpUtil.error(401, "Token is missing."));
//   }
// };

module.exports.createNewToken = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(JSON.parse(token), secret.JWT_SECRET, function (err, decoded) {
      let current = Date.now();
      let expires = decoded.exp * 1000;
      if (expires > current) {
        let data = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
        };
        let accessToken = jwt.sign(data, secret.JWT_SECRET, {
          expiresIn: secret.JWT_ACCESS_EXPIRESIN,
          algorithm: secret.JWT_ALGORITHM,
        });
        let refreshToken = jwt.sign(data, secret.JWT_SECRET, {
          expiresIn: secret.JWT_REFRESH_EXPIRESIN,
          algorithm: secret.JWT_ALGORITHM,
        });
        resolve({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      } else {
        reject();
      }
    });
  });
};