const express = require("express");
const { getSiteContentByKeyFrontend } = require("../../controllers/frontend/siteContentFrntCtrl");

const router = express.Router();

router.get("/site-content/:pageKey", getSiteContentByKeyFrontend);

module.exports = router;
