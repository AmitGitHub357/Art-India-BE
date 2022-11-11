var express = require("express");
var router = express.Router();
var db = require("../dbconfig");
var httpUtil = require("../utilities/http-messages");
var jwt = require("../utilities/jwt");
var async = require("async");

router.get("/dashboard", jwt.authenticateToken, function (req, res, next) {
  let data = {};
  async.waterfall(
    [
      function (callback) {
        db.get()
          .collection("client")
          .countDocuments(function (err, dbresult) {
            data["clients"] = dbresult;
            callback(null, data);
          });
      },
      function (result, callback) {
        db.get()
          .collection("artist")
          .countDocuments(function (err, dbresult) {
            data["artists"] = dbresult;
            callback(null, data);
          });
      },
      function (result, callback) {
        db.get()
          .collection("artwork")
          .countDocuments(function (err, dbresult) 
          {
            data["artworks"] = dbresult;
            callback(null, data);
          });
      },
      function (result, callback) {
        db.get()
          .collection("event")
          .countDocuments(function (err, dbresult) {
            data["events"] = dbresult;
            callback(null, data);
          });
      },
    ],
    function (err, result) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Dashboard Data Fetching Error."));
      } else {
        res.send(httpUtil.success(200, "Dashboard Success.", result));
      }
    }
  );
});

router.get("/artist-data", jwt.authenticateToken, function (req, res, next) {
  let data = {};
  async.waterfall(
    [
      function (callback) {
        db.get()
          .collection("artist-type")
          .find({})
          .toArray(function (err, dbresult) {
            if (err) {
              callback(err, null);
            }
            callback(null, dbresult);
          });
      },
    ],
    function (err, result) {
      if (err) {
        res
          .status(500)
          .send(httpUtil.error(500, "Artist Data Fetching Error."));
      } else {
        res.send(httpUtil.success(200, "Artist tData Success.", result));
      }
    }
  );
});
module.exports = router;