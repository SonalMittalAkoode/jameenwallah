const BankerConnect = require("../models/bankerConnect");
const asyncHandler = require("express-async-handler");

// get all banker connect enquiries
const getBankerConnects = asyncHandler(async (req, res) => {
  const enquiries = await BankerConnect.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Banker connect enquiries fetched successfully",
    data: enquiries,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getBankerConnects,
};
