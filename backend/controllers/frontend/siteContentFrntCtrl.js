const asyncHandler = require("express-async-handler");
const SiteContent = require("../../models/siteContent");
const { DEFAULT_SITE_CONTENT } = require("../siteContentCtrl");

const mergeContent = (base, record) => {
  if (!record) return base;
  return {
    ...base,
    ...record,
    sections: {
      ...(base.sections || {}),
      ...(record.sections || {}),
    },
  };
};

const getSiteContentByKeyFrontend = asyncHandler(async (req, res) => {
  const pageKey = String(req.params.pageKey || "").toLowerCase();
  const defaults = DEFAULT_SITE_CONTENT[pageKey];
  const document = await SiteContent.findOne({ pageKey, status: "active" }).lean();

  if (!defaults && !document) {
    return res.status(404).json({
      status: "error",
      message: "Site content not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "success",
    message: "Site content fetched successfully",
    data: mergeContent(defaults || {}, document),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { getSiteContentByKeyFrontend };
