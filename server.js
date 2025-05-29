require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app); // 👈 tạo HTTP server từ Express

// Import routes
// const ingredientRoutes = require("./routes/ingredientRoutes");
// app.use("/api/ingredients", ingredientRoutes);
const allowedOrigins = ["http://localhost:3030", "http://qrista.store:3030"];
// ⚡ Tạo Socket.IO instance
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS (socket.io)"));
            }
        },
        credentials: true
    }
});


// 🔌 Gắn global để sử dụng ở mọi nơi
global._io = io;

// 👂 Khi client kết nối socket
io.on('connection', (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// 🧱 Middleware

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./build'));
app.use('/public', express.static(path.join(__dirname, './public')));

// 📦 Router tổng
const router = require("./startups/indexRouter");
app.use("/", router);

// 🚀 Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
