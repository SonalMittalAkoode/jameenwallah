const express = require("express");
const { getBankerConnects } = require("../controllers/bankerConnectCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getBankerConnects);

module.exports = router;
