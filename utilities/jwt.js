var jwt = require("jsonwebtoken");
var secret = require("../conf/secrets");
var httpUtil = require("../utilities/http-messages");

module.exports.authenticateToken = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(JSON.parse(token), secret.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).send(httpUtil.error(401, "Invalid Token.", err));
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).send(httpUtil.error(401, "Token is missing."));
  }
};

module.exports.createNewToken = function (token)
{
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