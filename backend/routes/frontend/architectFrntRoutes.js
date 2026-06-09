const express = require("express");
const {
//   createArchitect,
  getAllArchitects,
  getArchitectById
} = require("../../controllers/frontend/architectFrntCtrl.js");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadImage");

const router = express.Router();

// router.post("/", authMiddleware, isAdmin, upload.single("image"), createArchitect);
router.get("/", getAllArchitects);
router.get("/:id", getArchitectById);

module.exports = router;
