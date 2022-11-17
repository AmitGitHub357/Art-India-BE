var jwt = require("jsonwebtoken");
var secret = require("../conf/secrets");
var httpUtil = require("../utilities/http-messages");
var db = require("../dbconfig");
const { ObjectID } = require("bson");

module.exports.authenticateToken = async function (req, res, next) {
  try { 
    var token = req.headers.authorization
    const decoded = jwt.verify(token, secret.JWT_SECRET)
    const id = ObjectID(decoded.id)
    if(!token){
      res.send({
        status : 400,
        success : false,
        message : "token is missing !"
      })
    }   
    db.get().collection("client").find({ _id : id }).toArray(function (err, result) {
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
            success: true,
            result
          })
        }
        else {
          req.token = result[0].accessToken
          req.user =  result[0]
          next()
          // res.send({ result })
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