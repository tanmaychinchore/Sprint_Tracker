const express = require("express");
const router = express.Router();

const {
    createTask,
    getTasksByProject,
    getTasksBySprint,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

// create task
router.post("/", authMiddleware, createTask);

// get my tasks (all tasks for current user)
router.get("/my", authMiddleware, getMyTasks);

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