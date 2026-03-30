const express = require("express");
const router = express.Router();

const {
    createSprint,
    getSprints,
    startSprint,
    endSprint,
} = require("../controllers/sprintController");

const authMiddleware = require("../middleware/authMiddleware");

// create sprint
router.post("/", authMiddleware, createSprint);

// get sprints of project
router.get("/:projectId", authMiddleware, getSprints);

// start sprint
router.patch("/:sprintId/start", authMiddleware, startSprint);

// end sprint
router.patch("/:sprintId/end", authMiddleware, endSprint);

module.exports = router;