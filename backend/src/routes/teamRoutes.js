const express = require("express");
const router = express.Router();

const { createTeam, getMyTeams } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);
router.get("/", authMiddleware, getMyTeams);

module.exports = router;