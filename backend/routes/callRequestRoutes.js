const express = require("express");
const {
  getCallRequests,
  updateCallRequest,
} = require("../controllers/callRequestCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getCallRequests);
router.put("/:id", authMiddleware, isAdmin, updateCallRequest);

module.exports = router;
