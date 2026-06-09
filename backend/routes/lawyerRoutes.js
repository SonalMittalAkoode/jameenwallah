const express = require("express");
const {
  createLawyer,
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
} = require("../controllers/lawyerCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "featuredImage", maxCount: 1 },
  ]),
  createLawyer
);
router.get("/", authMiddleware, isAdmin, getAllLawyers);
router.get("/:id", authMiddleware, isAdmin, getLawyerById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "featuredImage", maxCount: 1 },
  ]),
  updateLawyer
);
router.delete("/:id", authMiddleware, isAdmin, deleteLawyer);

module.exports = router;
