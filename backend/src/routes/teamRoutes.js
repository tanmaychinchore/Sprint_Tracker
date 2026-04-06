const express = require("express");
const router = express.Router();

const { createTeam, getMyTeams, addMember, inviteMember, verifyInvite } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);
router.get("/", authMiddleware, getMyTeams);
router.post("/:teamId/add-member", authMiddleware, addMember);
router.post("/:teamId/invite", authMiddleware, inviteMember);
router.get("/invite/:token", verifyInvite); // public — no auth needed

module.exports = router;