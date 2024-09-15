const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const port = 3001;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Configure socket.io with CORS
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000", // Allowing the frontend to access the server
    methods: ["GET", "POST"],        // Allowed HTTP methods
    credentials: true,               // Allow cookies if needed
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(`Message received in room ${data.room}: `, data);
    socket.to(data.room).emit("receive_message", data.content);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});



// for server - npm i socket.io
// for client - npm i socket.io-client