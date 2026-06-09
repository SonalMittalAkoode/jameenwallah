const express = require("express");
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} = require("../controllers/agentCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createAgent);
router.get("/", authMiddleware, isAdmin, getAllAgents);
router.get("/:id", authMiddleware, isAdmin, getAgentById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  updateAgent
);
router.delete("/:id", authMiddleware, isAdmin, deleteAgent);

module.exports = router;
