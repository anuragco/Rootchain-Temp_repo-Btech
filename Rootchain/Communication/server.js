const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ username, product }) => {
    socket.join(product);
    console.log(`${username} joined ${product} chat room`);
    socket.to(product).emit("message", { user: "System", text: `${username} has joined the chat.` });
  });

  socket.on("sendMessage", ({ product, message, username }) => {
    io.to(product).emit("message", { user: username, text: message });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
