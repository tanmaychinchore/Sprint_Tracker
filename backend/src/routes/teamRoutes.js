const express = require("express");
const router = express.Router();

const { createTeam, getMyTeams, addMember } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);
router.get("/", authMiddleware, getMyTeams);
router.post("/:teamId/add-member", authMiddleware, addMember);

module.exports = router;