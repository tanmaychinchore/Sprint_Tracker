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

connectDB().catch((error) => {
  console.error("Database initialization failed:", error);
});

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {}
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing server or choose another port.`);
    process.exit(1);
  } else {
    console.error("Server startup error:", error);
    process.exit(1);
  }
});