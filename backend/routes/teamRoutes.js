const express = require("express");
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createTeam);
router.get("/", authMiddleware, isAdmin, getAllTeams);
router.get("/:id", authMiddleware, isAdmin, getTeamById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  updateTeam
);
router.delete("/:id", authMiddleware, isAdmin, deleteTeam);

module.exports = router;
