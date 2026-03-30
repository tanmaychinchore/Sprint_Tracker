const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasksByProject,
    getTasksBySprint,
    updateTask,
    updateTaskStatus,
    deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

// create task
router.post("/", authMiddleware, createTask);

// get tasks
router.get("/project/:projectId", authMiddleware, getTasksByProject);
router.get("/sprint/:sprintId", authMiddleware, getTasksBySprint);

// update
router.patch("/:taskId", authMiddleware, updateTask);

// change status
router.patch("/:taskId/status", authMiddleware, updateTaskStatus);

// delete
router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;