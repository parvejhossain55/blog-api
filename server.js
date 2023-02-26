require("dotenv").config();
const { readdirSync } = require("fs");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const { dbConnection } = require("./config/dbConnection");

const app = express();
const port = process.env.PORT || 5000;

// Set up rate limiter
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again later",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(limiter);
app.use(express.json()); // Limit request body size to 10kb
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Connect to database
dbConnection();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes middleware
readdirSync("./routes").map((r) =>
  app.use("/api/v1", require(`./routes/${r}`))
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Internal Server Error");
  next();
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
