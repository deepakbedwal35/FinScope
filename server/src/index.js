require("dotenv").config();
const express = require('express');
const connectDB = require("./config/db")
const handleRedisCaching = require("./config/redis")
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {restrictToLoggedIn} = require("./middleware/auth")
const PORT = process.env.PORT || 8080;
const app = express();
const scanRouter = require("./routes/signals");
const userRouter = require("./routes/user")
const watchRouter = require("./routes/watchlist")
const tradeRouter = require("./routes/trades")
const recommendsRouter = require("./routes/recommendations")
// alow react to call Node
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,

  }))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// Routes
app.use("/user" , userRouter);
app.use("/watchlist" , watchRouter);
app.use("/api/signals" ,  scanRouter);
app.use("/trades" , tradeRouter)
app.use("/api/signals/recommends" , recommendsRouter)



// mongodb connection

handleRedisCaching();

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(" Server running → http://localhost:" + PORT);
  });
});













