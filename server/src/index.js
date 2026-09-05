// Only load .env file in local development
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const handleRedisCaching = require("./config/redis");
const errorHandler = require("./middleware/errorHandler"); // 🟢 Imported missing handler

const PORT = process.env.PORT || 8080;
const app = express();

// Route Imports
const scanRouter = require("./routes/signals");
const userRouter = require("./routes/user");
const watchRouter = require("./routes/watchlist");
const tradeRouter = require("./routes/trades");
const recommendsRouter = require("./routes/recommendations");

// Allowed Cross-Origin Origins
// 🟢 Dynamic CORS Policy: Allows ALL origins while keeping credentials/cookies completely operational
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically approves whatever origin sent the request, allowing all domains
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));


// Essential for handling cross-domain secure cookie transfers on Render
app.set('trust proxy', 1);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/user", userRouter);
app.use("/watchlist", watchRouter);
app.use("/trades", tradeRouter);


app.use("/api/signals/recommends", recommendsRouter); 
app.use("/api/signals", scanRouter);

app.get('/', (req, res) => {
  res.json({ status: 'FinScope API is running' });
});

app.use(errorHandler);

handleRedisCaching();

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(" Server running → http://localhost:" + PORT);
  });
}).catch((err) => {
  console.error("Database failed to boot:", err.message);
});
