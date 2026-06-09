const express = require("express");
const router = express.Router();
const {
  createProperty,
  createPropertyByAdmin,
  updatePropertyByAdmin,
  getAllProperties,
  getPropertyById,
  updatePropertyById,
  deletePropertyById,
  getPendingProperties,
  getPendingPropertyById,
  verifyOrRejectProperty,
  getRejectedProperties,
  getRejectedPropertyById,
  updateRejectedPropertyWithStatus,
  getVerifiedProperties,
  getVerifiedPropertyById,
  assignBrokerToProperty,
  getAssignedProperties,
  getAssignedPropertyById,
  markAssignedPropertyAsSold,
} = require("../controllers/propertyCtrl");
const upload = require("../middlewares/uploadImage");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlanImages", maxCount: 10 },
    { name: "virtualTour", maxCount: 1 },
    { name: "sitePlanImage", maxCount: 1 },
    { name: "masterPlanImage", maxCount: 1 },
  ]),
  createProperty
);
router.post(
  "/admin",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlanImages", maxCount: 10 },
    { name: "virtualTour", maxCount: 1 },
    { name: "sitePlanImage", maxCount: 1 },
    { name: "masterPlanImage", maxCount: 1 },
  ]),
  createPropertyByAdmin
);
router.put(
  "/admin/:id",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlanImages", maxCount: 10 },
    { name: "virtualTour", maxCount: 1 },
    { name: "sitePlanImage", maxCount: 1 },
    { name: "masterPlanImage", maxCount: 1 },
  ]),
  updatePropertyByAdmin
);
router.get("/", authMiddleware, isAdmin, getAllProperties);
router.get("/pending", authMiddleware, isAdmin, getPendingProperties);
router.get("/rejected", authMiddleware, isAdmin, getRejectedProperties);
router.get("/verified", authMiddleware, isAdmin, getVerifiedProperties);
router.get("/assigned", authMiddleware, isAdmin, getAssignedProperties);
router.get("/:id", authMiddleware, isAdmin, getPropertyById);

// conditional upload middleware
const conditionalUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return upload.fields([
      { name: "images", maxCount: 10 },
      { name: "floorPlanImages", maxCount: 10 },
      { name: "virtualTour", maxCount: 1 },
      { name: "sitePlanImage", maxCount: 1 },
      { name: "masterPlanImage", maxCount: 1 },
    ])(req, res, next);
  }
  next();
};

router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  conditionalUpload,
  updatePropertyById
);
router.delete("/:id", authMiddleware, isAdmin, deletePropertyById);
router.get("/pending/:id", authMiddleware, isAdmin, getPendingPropertyById);
router.put("/status/:id", authMiddleware, isAdmin, verifyOrRejectProperty);
router.get("/rejected/:id", authMiddleware, isAdmin, getRejectedPropertyById);
router.put(
  "/rejected/status/:id",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlanImages", maxCount: 10 },
    { name: "virtualTour", maxCount: 1 },
    { name: "sitePlanImage", maxCount: 1 },
    { name: "masterPlanImage", maxCount: 1 },
  ]),
  updateRejectedPropertyWithStatus
);
router.get("/verified/:id", authMiddleware, isAdmin, getVerifiedPropertyById);
router.put(
  "/assign-broker/:id",
  authMiddleware,
  isAdmin,
  assignBrokerToProperty
);
router.get("/assigned/:id", authMiddleware, isAdmin, getAssignedPropertyById);
router.put(
  "/mark-sold/:id",
  authMiddleware,
  isAdmin,
  markAssignedPropertyAsSold
);

module.exports = router;
