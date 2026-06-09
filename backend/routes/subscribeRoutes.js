const express = require("express");
const { getAllSubscribers, updateSubscriber, deleteSubscriber } = require("../controllers/subscribeCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllSubscribers);
router.put("/:id", authMiddleware, isAdmin, updateSubscriber);
router.delete("/:id", authMiddleware, isAdmin, deleteSubscriber);
module.exports = router;
