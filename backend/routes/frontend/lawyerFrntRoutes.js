const express = require("express");
const {
//   createLawyer,
  getAllLawyers,
  getLawyerById
} = require("../../controllers/frontend/lawyerFrntCtrl.js");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadImage");

const router = express.Router();

// router.post("/", authMiddleware, isAdmin, upload.single("image"), createLawyer);
router.get("/", getAllLawyers);
router.get("/:id", getLawyerById);

module.exports = router;
