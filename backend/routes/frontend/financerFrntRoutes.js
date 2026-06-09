const express = require("express");
const {
//   createFinancer,
  getAllFinancers,
  getFinancerById
} = require("../../controllers/frontend/financerFrntCtrl.js");

const router = express.Router();
router.get("/", getAllFinancers);
router.get("/:id", getFinancerById);

module.exports = router;
