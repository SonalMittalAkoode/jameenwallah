const express = require("express");
const {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
} = require("../controllers/partnerCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.single("image"), createPartner);
router.get("/", authMiddleware, isAdmin, getAllPartners);
router.get("/:id", authMiddleware, isAdmin, getPartnerById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  updatePartner
);
router.delete("/:id", authMiddleware, isAdmin, deletePartner);

module.exports = router;
