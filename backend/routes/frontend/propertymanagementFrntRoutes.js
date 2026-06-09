const express = require("express");
const {
//   createPropertymanagement,
  getAllPropertymanagements,
  getPropertymanagementById
} = require("../../controllers/frontend/propertymanagementFrntCtrl.js");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadImage");

const router = express.Router();

// router.post("/", authMiddleware, isAdmin, upload.single("image"), createPropertymanagement);
router.get("/", getAllPropertymanagements);
router.get("/:id", getPropertymanagementById);

module.exports = router;
