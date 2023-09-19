if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || null;

const express = require("express");
const cors = require("cors");
const jimp = require("jimp");
const mongoose = require("mongoose");

const mongo = process.env.MONGO_DB;
const mongoUrl = `mongodb://${mongo}/employeeimages`;

const imageSchema = new mongoose.Schema(
  {
    image: {
      type: Buffer,
    },
    id: String,
    cnum: String,
    url: String,
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

const app = express();

app.use(cors());

app.get("/:width/:cnum", async (req, res) => {
  const { width, cnum } = req.params;
  let imageData = await Image.findOne({ cnum });

  if (!imageData) {
    res.set("Content-Type", "image/jpeg");
    res.status(404).send();
    return;
  } else {
    let pic = await jimp.read(imageData.image);
    pic = await pic.resize(parseInt(width), jimp.AUTO);
    pic = await pic.getBufferAsync(jimp.MIME_JPEG);

    res.set("Content-Type", "image/jpeg");
    res.status(200).send(pic);
  }
});

app.listen(PORT, async () => {
  const mdb = await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
