const express = require("express");
require("dotenv").config();

const router = require("./routes/index");
const port = process.env.PORT || 1111;
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/v1", router);

//return 404 if no API is found
app.use("*", (req, res) => {
  return res.status(404).json({
    statusCode: 404,
    messgae: "Not Found",
  });
});

app.listen(port, function () {
  console.log("Listening to port: ", port);
});
