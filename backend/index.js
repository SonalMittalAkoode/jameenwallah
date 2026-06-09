const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

//admin routes import
const adminRoutes = require("./routes/adminRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const amenityRoutes = require("./routes/amenityRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const propertyTypeRoutes = require("./routes/propertyTypeRoutes");
const stateRoutes = require("./routes/stateRoutes");
const cityRoutes = require("./routes/cityRoutes");
const areaRoutes = require("./routes/areaRoutes");
const blogCategoryRoutes = require("./routes/blogCategoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const builderRoutes = require("./routes/builderRoutes");
const faqRoutes = require("./routes/faqRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const agentRoutes = require("./routes/agentRoutes");
const landingPageEnquiryRoutes = require("./routes/landingPageEnquiryRoutes");
const tourRequestEnquiryRoutes = require("./routes/tourRequestEnquiryRoutes");
const bankerConnectRoutes = require("./routes/bankerConnectRoutes");
const agentContactEnquiryRoutes = require("./routes/agentContactEnquiryRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const callRequestRoutes = require("./routes/callRequestRoutes");
const consultancyEnquiryRoutes = require("./routes/consultancyEnquiryRoutes");
const becomePartnerEnquiryRoutes = require("./routes/becomePartnerEnquiryRoutes");
const propertyEnquiryRoutes = require("./routes/propertyEnquiryRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");
const propertyPageRoutes=require("./routes/propertyPageRoutes")
const architectRoutes=require("./routes/architectRoutes")
const charteredaccountantRoutes=require("./routes/charteredaccountantRoutes.js")
const financerRoutes=require("./routes/financerRoutes.js")
const lawyerRoutes=require("./routes/lawyerRoutes.js")
const partnerRoutes=require("./routes/partnerRoutes.js")
const propertymanagementRoutes=require("./routes/propertymanagementRoutes.js")
const siteContentRoutes = require("./routes/siteContentRoutes");

// const teamRoutes=require("./routes/teamRoutes.js")




//frontend routes import
const landingPageEnquiryFrntRoutes = require("./routes/frontend/landingPageEnquiryFrntRoutes");
const tourRequestEnquiryFrntRoutes = require("./routes/frontend/tourRequestEnquiryFrntRoutes");
const agentContactEnquiryFrntRoutes = require("./routes/frontend/agentContactEnquiryFrntRoutes");
const enquiryFrntRoutes = require("./routes/frontend/enquiryFrntRoutes");
const callRequestFrntRoutes = require("./routes/frontend/callRequestFrntRoutes");
const bankerConnectFrntRoutes = require("./routes/frontend/bankerConnectFrntRoutes");
const cityFrntRoutes = require("./routes/frontend/cityFrntRoutes");
const blogFrntRoutes = require("./routes/frontend/blogFrntRoutes");
const faqFrntRoutes = require("./routes/frontend/faqFrntRoutes");
const propertyFrntRoutes = require("./routes/frontend/propertyFrntRoutes");
const propertyTypeFrntRoutes = require("./routes/frontend/propertyTypeFrntRoutes");
const categoryFrntRoutes = require("./routes/frontend/categoryFrntRoutes");
const testimonialFrntRoutes = require("./routes/frontend/testimonialFrntRoutes");
const builderFrntRoutes = require("./routes/frontend/builderFrntRoutes");
const agentFrntRoutes = require("./routes/frontend/agentFrntRoutes");
const subscribeFrntRoutes = require("./routes/frontend/subscribeFrntRoutes");
const amenityFrntRoutes = require("./routes/frontend/amenityFrntRoutes");
const stateFrntRoutes = require("./routes/frontend/stateFrntRoutes");
const areaFrntRoutes = require("./routes/frontend/areaFrntRoutes");
// const teamFrntRoutes = require("./routes/frontend/teamFrntRoutes");
const partnerFrntRoutes = require("./routes/frontend/partnerFrntRoutes");

const lawyerFrntRoutes = require("./routes/frontend/lawyerFrntRoutes");
const financerFrntRoutes = require("./routes/frontend/financerFrntRoutes");
const architectFrntRoutes = require("./routes/frontend/architectFrntRoutes");
const charteredaccountantFrntRoutes = require("./routes/frontend/charteredaccountantFrntRoutes");
const propertymanagementFrntRoutes = require("./routes/frontend/propertymanagementFrntRoutes");
const becomeapartnerenquiryFrntRoutes = require("./routes/frontend/becomeapartnerenquiryFrntRoutes");

const consultancyenquiryFrntRoutes = require("./routes/frontend/consultancyenquiryFrntRoutes");
const propertyenquiryFrntRoutes = require("./routes/frontend/propertyenquiryFrntRoutes");
const propertyPageFrntRoutes = require("./routes/frontend/propertyPageFrntRoutes");
const siteContentFrntRoutes = require("./routes/frontend/siteContentFrntRoutes");

dotenv.config();
connectDB();

const app = express();

//middleware

const envAllowedOrigins = String(process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // "http://127.0.0.1:3000",
  "https://jameenwallah.akoodedemo.com",
  "https://jameenwallah.com",
  "https://www.jameenwallah.com",
  "https://jameenwallah.vercel.app",
  ...envAllowedOrigins,
];

app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(compression({
  level: 6, // Balanced compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use(cookieParser());

// Add cache headers for static assets
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (req.path.match(/\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache API responses for 5 minutes
  else if (req.path.startsWith('/frontend/api/')) {
    res.set('Cache-Control', 'public, max-age=300');
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "JameenWallah local API is running.",
    docs: {
      health: "/health",
      frontendApi: "/frontend/api",
      adminApi: "/admin/api",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API healthy",
    timestamp: new Date().toISOString(),
  });
});

//admin routes
app.use("/admin/api/auth", adminRoutes);
app.use("/admin/api/property", propertyRoutes);
app.use("/admin/api/amenity", amenityRoutes);
app.use("/admin/api/category", categoryRoutes);
app.use("/admin/api/property-type", propertyTypeRoutes);
app.use("/admin/api/state", stateRoutes);
app.use("/admin/api/city", cityRoutes);
app.use("/admin/api/area", areaRoutes);
app.use("/admin/api/blog-category", blogCategoryRoutes);
app.use("/admin/api/blog", blogRoutes);
app.use("/admin/api/builder", builderRoutes);
app.use("/admin/api/faq", faqRoutes);
app.use("/admin/api/testimonial", testimonialRoutes);
app.use("/admin/api/agent", agentRoutes);
app.use("/admin/api/landing-page-enquiry", landingPageEnquiryRoutes);
app.use("/admin/api/banker-connect", bankerConnectRoutes);
app.use("/admin/api/tour-request-enquiry", tourRequestEnquiryRoutes);
app.use("/admin/api/agent-contact-enquiry", agentContactEnquiryRoutes);
app.use("/admin/api/enquiry", enquiryRoutes);
app.use("/admin/api/call-request", callRequestRoutes);
app.use("/admin/api/consultancy-enquiry", consultancyEnquiryRoutes);
app.use("/admin/api/become-partner-enquiry", becomePartnerEnquiryRoutes);
app.use("/admin/api/property-enquiry", propertyEnquiryRoutes);
app.use("/admin/api/dashboard", adminDashboardRoutes);
app.use("/admin/api/subscribe", subscribeRoutes);
app.use("/admin/api/property-page", propertyPageRoutes);
app.use("/admin/api/architect", architectRoutes);
app.use("/admin/api/charteredaccountant", charteredaccountantRoutes);
app.use("/admin/api/financer", financerRoutes);
app.use("/admin/api/lawyer", lawyerRoutes);
app.use("/admin/api/partner", partnerRoutes);
app.use("/admin/api/propertymanagement", propertymanagementRoutes);
app.use("/admin/api/site-content", siteContentRoutes);




//frontend routes
app.use("/frontend/api/landing-page-enquiry", landingPageEnquiryFrntRoutes);
app.use("/frontend/api/tour-request-enquiry", tourRequestEnquiryFrntRoutes);
app.use("/frontend/api/agent-contact-enquiry", agentContactEnquiryFrntRoutes);
app.use("/frontend/api/enquiry", enquiryFrntRoutes);
app.use("/frontend/api/call-request", callRequestFrntRoutes);
app.use("/frontend/api/banker-connect", bankerConnectFrntRoutes);
app.use("/frontend/api/agent", agentFrntRoutes);
app.use("/frontend/api", cityFrntRoutes);
app.use("/frontend/api", blogFrntRoutes);
app.use("/frontend/api", faqFrntRoutes);
app.use("/frontend/api", propertyFrntRoutes);
app.use("/frontend/api", propertyTypeFrntRoutes);
app.use("/frontend/api", categoryFrntRoutes);
app.use("/frontend/api", testimonialFrntRoutes);
app.use("/frontend/api", builderFrntRoutes);
app.use("/frontend/api", subscribeFrntRoutes);
app.use("/frontend/api", amenityFrntRoutes);
app.use("/frontend/api", stateFrntRoutes);
app.use("/frontend/api", areaFrntRoutes);
// app.use("/frontend/api", teamFrntRoutes);
// app.use("/frontend/api/propertypage", agentFrntRoutes);
app.use("/frontend/api", partnerFrntRoutes);
app.use("/frontend/api/lawyer", lawyerFrntRoutes);
app.use("/frontend/api/financer", financerFrntRoutes);
app.use("/frontend/api/architect", architectFrntRoutes);
app.use("/frontend/api/charteredaccountant", charteredaccountantFrntRoutes);
app.use("/frontend/api/propertymanagement", propertymanagementFrntRoutes);

app.use("/frontend/api/becomeapartnerenquiry", becomeapartnerenquiryFrntRoutes);
app.use("/frontend/api/consultancyenquiry", consultancyenquiryFrntRoutes);
app.use("/frontend/api/propertyenquiry", propertyenquiryFrntRoutes);
app.use("/frontend/api", propertyPageFrntRoutes);
app.use("/frontend/api", siteContentFrntRoutes);

const imagesDir = path.join(__dirname, "public", "images");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// static images route
app.use("/images", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
}, express.static(path.join(__dirname, "public", "images"), {
  setHeaders: (res, path) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Cache-Control", "public, max-age=31536000");
  }
}));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
