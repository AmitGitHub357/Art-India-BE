var nodemailer = require("nodemailer");
var hbs = require("nodemailer-express-handlebars");
var path = require("path");
var secret = require("../conf/secrets");

let sendMail = (type, email, context) => {
  return new Promise(function (resolve, reject) {
    let mailBody;
    if (type === "ForgotPassword") {
      mailBody = {
        from: secret.MAIL_FROM,
        to: email,
        subject: "Reset Password OTP",
        template: "forgotpasswordemail",
        context: context,
      };
    } else if (type === "ChitChat") {
      mailBody = {
        from: secret.MAIL_FROM,
        to: email,
        subject: "Chit Chat Request",
        template: "chitchatemail",
        context: context,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../views/logo.png"),
            cid: "logo",
          },
          {
            filename: "blue-glow.jpg",
            path: path.join(__dirname, "../views/blue-glow.jpg"),
            cid: "blue-glow",
          },
          {
            filename: "top-rounded.png",
            path: path.join(__dirname, "../views/top-rounded.png"),
            cid: "top-rounded",
          },
          {
            filename: "bottom-rounded.png",
            path: path.join(__dirname, "../views/bottom-rounded.png"),
            cid: "bottom-rounded",
          },
          {
            filename: "orange-gradient-wide.png",
            path: path.join(__dirname, "../views/orange-gradient-wide.png"),
            cid: "orange-gradient-wide",
          },
        ],
      };
    } else if (type === "Program") {
      mailBody = {
        from: secret.MAIL_FROM,
        to: email,
        subject: "Volunteer Program Request",
        template: "programemail",
        context: context,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../views/logo.png"),
            cid: "logo",
          },
          {
            filename: "blue-glow.jpg",
            path: path.join(__dirname, "../views/blue-glow.jpg"),
            cid: "blue-glow",
          },
          {
            filename: "top-rounded.png",
            path: path.join(__dirname, "../views/top-rounded.png"),
            cid: "top-rounded",
          },
          {
            filename: "bottom-rounded.png",
            path: path.join(__dirname, "../views/bottom-rounded.png"),
            cid: "bottom-rounded",
          },
          {
            filename: "orange-gradient-wide.png",
            path: path.join(__dirname, "../views/orange-gradient-wide.png"),
            cid: "orange-gradient-wide",
          },
        ],
      };
    } else if (type === "Connect") {
      mailBody = {
        from: secret.MAIL_FROM,
        to: email,
        subject: "Quick Connect Request",
        template: "connectemail",
        context: context,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../views/logo.png"),
            cid: "logo",
          },
          {
            filename: "blue-glow.jpg",
            path: path.join(__dirname, "../views/blue-glow.jpg"),
            cid: "blue-glow",
          },
          {
            filename: "top-rounded.png",
            path: path.join(__dirname, "../views/top-rounded.png"),
            cid: "top-rounded",
          },
          {
            filename: "bottom-rounded.png",
            path: path.join(__dirname, "../views/bottom-rounded.png"),
            cid: "bottom-rounded",
          },
          {
            filename: "orange-gradient-wide.png",
            path: path.join(__dirname, "../views/orange-gradient-wide.png"),
            cid: "orange-gradient-wide",
          },
        ],
      };
    } else if (type === "Contact") {
      mailBody = {
        from: secret.MAIL_FROM,
        to: email,
        subject: "Contact Us Request",
        template: "contactemail",
        context: context,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../views/logo.png"),
            cid: "logo",
          },
          {
            filename: "blue-glow.jpg",
            path: path.join(__dirname, "../views/blue-glow.jpg"),
            cid: "blue-glow",
          },
          {
            filename: "top-rounded.png",
            path: path.join(__dirname, "../views/top-rounded.png"),
            cid: "top-rounded",
          },
          {
            filename: "bottom-rounded.png",
            path: path.join(__dirname, "../views/bottom-rounded.png"),
            cid: "bottom-rounded",
          },
          {
            filename: "orange-gradient-wide.png",
            path: path.join(__dirname, "../views/orange-gradient-wide.png"),
            cid: "orange-gradient-wide",
          },
        ],
      };
    }
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: secret.SMTP_MAIL,
        pass: secret.SMTP_PASSWORD,
      },
    });
    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          defaultLayout: "layout",
          layoutsDir: path.join(__dirname, "../views/"),
        },
        extName: ".hbs",
        viewPath: path.join(__dirname, "../views/"),
      })
    );
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    transporter.sendMail(mailBody, function (err, info) {
      if (err) {
        console.log(err);
        reject("Mail not sent");
      } else {
        console.log(info);
        resolve("Mail Sent");
      }
    });
  });
};

module.exports = sendMail;
