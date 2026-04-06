require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userStatsRoutes = require("./routes/userStatsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

connectDB();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/stats", userStatsRoutes);
app.use("/api/notifications", notificationRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});