const express = require("express");
const {
  getAllPartners,
  getPartnerById,
} = require("../../controllers/frontend/partnerFrntCtrl");

const router = express.Router();

router.get("/partners", getAllPartners);
router.get("/partners/:id", getPartnerById);

module.exports = router;
