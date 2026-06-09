const express = require("express");
const {
  createLandingPageEnquiry,
  getAllLandingPageEnquiries,
  getLandingPageEnquiry,
  updateLandingPageEnquiry,
  deleteLandingPageEnquiry,
} = require("../../controllers/frontend/landingPageEnquiryFrntCtrl");

const router = express.Router();

router.post("/", createLandingPageEnquiry);
router.get("/", getAllLandingPageEnquiries);
router.get("/:id", getLandingPageEnquiry);
router.put("/:id", updateLandingPageEnquiry);
router.delete("/:id", deleteLandingPageEnquiry);

module.exports = router;
