require('dotenv').config();
const express = require('express');
// const {startup} = require('./startups/index');
const cors = require('cors');
const path = require('path');
// const session = require('express-session');
// const passport = require('passport');
const app = express();
const router = require("./startups/indexRouter")

// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false,
// }));

// app.use(passport.authenticate('session'));
// app.use(cors());
app.use(cors({
    origin: "http://localhost:5173", // Đổi thành URL frontend của bạn
    credentials: true // ⚡ Cho phép gửi cookie
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./build'));
app.use('/public', express.static(path.join(__dirname, './public')));

app.use("/", router)

// startup(app);

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, './build/index.html'))
// })

// app.get("/product", (req, res) =>{
//     res.send("Home")
// })

app.listen(process.env.PORT, () => {
    console.log('server run at port', process.env.PORT);
});