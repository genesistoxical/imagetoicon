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
  var file = req.file.originalname;
  console.log(file);
  var name = file.substring(0, file.indexOf("."));
  var ext = file.substring(file.indexOf(".") + 1);
  console.log("Image format: " + ext);

  var supported =
    ext.includes("png") ||
    ext.includes("jpg") ||
    ext.includes("jpeg") ||
    ext.includes("jfif") ||
    ext.includes("gif") ||
    ext.includes("bmp");

  if (supported === false) {
    console.log("Unsupported");
    return fs
      .status(500)
      .send(
        "Error: Unsupported image format (." +
          ext +
          "), please reload this tab and try again with a valid file type."
      );
  }

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

  console.log(name + ".ico" + "\n");
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
