const express = require("express");
const router = express.Router();

const {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
    getAllMyProjects,
    getProjectMembers,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

// create project
router.post("/", authMiddleware, createProject);

// get all my projects (across all teams)
router.get("/all", authMiddleware, getAllMyProjects);

// get project members (team members for a project)
router.get("/:projectId/members", authMiddleware, getProjectMembers);

// get all projects of a team
router.get("/:teamId", authMiddleware, getProjects);

// update
router.patch("/:projectId", authMiddleware, updateProject);

// delete
router.delete("/:projectId", authMiddleware, deleteProject);

module.exports = router;