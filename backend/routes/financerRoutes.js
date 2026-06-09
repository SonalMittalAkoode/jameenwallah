const express = require("express");
const {
  createFinancer,
  getAllFinancers,
  getFinancerById,
  updateFinancer,
  deleteFinancer,
} = require("../controllers/financerCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]), createFinancer);
router.get("/", authMiddleware, isAdmin, getAllFinancers);
router.get("/:id", authMiddleware, isAdmin, getFinancerById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "featuredImage", maxCount: 1 }]),
  updateFinancer
);
router.delete("/:id", authMiddleware, isAdmin, deleteFinancer);

module.exports = router;
