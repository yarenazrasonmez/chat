const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,  "index.html"));
});

const users = [];
const messages = [];

io.on("connection", (socket) => {
    socket.on("newUser", (userName) => {
        users.push({
            id: socket.id,
            name: userName,
            lastMessageIndex: -1
        });
        io.emit("users", users);
    });

    socket.on("sendMessageClient", (info) => {
        messages.push(info);
        users.forEach((user) => {
            if (user.id === socket.id) {
                user.lastMessageIndex = messages.length - 1;
            }
            const userSocket = io.sockets.connected[user.id];
            if (userSocket) {
                userSocket.emit("messagesServer", messages.slice(user.lastMessageIndex + 1));
            }
        });
    });
});

http.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
