const express = require("express");
const {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
} = require("../controllers/stateCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createState);
router.get("/", authMiddleware, isAdmin, getAllStates);
router.get("/:id", authMiddleware, isAdmin, getStateById);
router.put("/:id", authMiddleware, isAdmin, updateState);
router.delete("/:id", authMiddleware, isAdmin, deleteState);

module.exports = router;
