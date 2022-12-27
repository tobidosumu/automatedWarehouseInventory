require('dotenv').config('./.env');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 9000;

app.use(express.json({ extended: true }));

const itemRouter = require("./routes/item.route");


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected successfully"))
  .catch((err) => console.log(err));

app.use("/item", itemRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
