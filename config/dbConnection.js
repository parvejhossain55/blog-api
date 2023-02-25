const mongoose = require("mongoose");

exports.dbConnection = () => {
  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Database Connected");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Database Connection Failed =>" + err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Database Connection Disconnected.");
  });
};
