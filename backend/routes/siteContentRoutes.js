const express = require("express");
const {
  getAllSiteContent,
  getSiteContentByKey,
  upsertSiteContentByKey,
} = require("../controllers/siteContentCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllSiteContent);
router.get("/:pageKey", authMiddleware, isAdmin, getSiteContentByKey);
router.put("/:pageKey", authMiddleware, isAdmin, upsertSiteContentByKey);

module.exports = router;
