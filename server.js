const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fs = require("fs");
const Jimp = require("jimp");
const imageToIco = require("image-to-ico");
const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", function (request, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/", upload.single("icon"), function (req, fs) {
  console.log(req.file.originalname);
  var noDot = req.file.originalname.split(".").join("");
  var name = noDot.substring(0, noDot.length - 3);
  Jimp.read(req.file.buffer, (err, image) => {
    if (err) {
      console.log(err);
    }
    image
      .contain(
        256,
        256,
        Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
      )
      .getBuffer(Jimp.MIME_PNG, (err, Buff) => {
        if (err) {
          console.log(err);
        }
        imageToIco(Buff, {
          size: [256, 256],
          quality: 100,
          greyscale: false,
        }).then((buffer) => {
          fs.status(200);
          fs.setHeader(
            "Content-Disposition",
            "attachment; filename=" + name + ".ico"
          );
          fs.send(buffer);
        });
      });
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});