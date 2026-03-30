const express = require("express");
const router = express.Router();

const {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

// create project
router.post("/", authMiddleware, createProject);

// get all projects of a team
router.get("/:teamId", authMiddleware, getProjects);

// update
router.patch("/:projectId", authMiddleware, updateProject);

// delete
router.delete("/:projectId", authMiddleware, deleteProject);

module.exports = router;