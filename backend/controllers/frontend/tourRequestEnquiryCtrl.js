const TourRequestEnquiry = require("../../models/tourRequestEnquiry");
const Property = require("../../models/property");
const Agent = require("../../models/agent");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

// create tour request enquiry
const createTourRequestEnquiry = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    tourType,
    preferredTourDate,
    message,
    property,
    assignedAgent,
  } = req.body;

  if (
    !name ||
    !email ||
    !phoneNumber ||
    !tourType ||
    !preferredTourDate ||
    !property
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Required fields missing: name, email, phoneNumber, tourType, preferredTourDate, property",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (!["in-person", "video-chat"].includes(tourType)) {
    return res.status(400).json({
      status: "error",
      message: "tourType must be either 'in-person' or 'video-chat'",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Validate phone number - must be exactly 10 digits
  const cleanedPhone = phoneNumber.trim().replace(/[\s\-\(\)\+]/g, "");
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number should contain only numbers",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if exactly 10 digits
  if (cleanedPhone.length !== 10) {
    return res.status(400).json({
      status: "error",
      message: "Phone number must be exactly 10 digits",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Indian phone number validation (must start with 6-9)
  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number should start with 6, 7, 8, or 9",
      code: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Convert phone number to number type
  const phoneNumberAsNumber = Number(cleanedPhone);

  const propertyDoc = await Property.findById(property).select(
    "description.title assignedAgent"
  );

  if (!propertyDoc) {
    return res.status(404).json({
      status: "error",
      message: "Property not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const resolvedAgentId =
    assignedAgent ||
    (Array.isArray(propertyDoc.assignedAgent) &&
      propertyDoc.assignedAgent[0]) ||
    null;

  const agentDoc = resolvedAgentId
    ? await Agent.findById(resolvedAgentId).select("_id name email phoneNumber")
    : null;

  if (resolvedAgentId && !agentDoc) {
    return res.status(404).json({
      status: "error",
      message: "Assigned agent not found",
      code: 404,
      timestamp: new Date().toISOString(),
    });
  }

  const enquiry = await TourRequestEnquiry.create({
    name,
    email,
    phoneNumber: phoneNumberAsNumber,
    tourType,
    preferredTourDate,
    message,
    property: propertyDoc._id,
    assignedAgent: agentDoc?._id || null,
  });

  if (agentDoc?.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    sendTourRequestEmail({
      agent: agentDoc,
      propertyTitle: propertyDoc.description?.title,
      visitor: {
        name,
        email,
        phoneNumber,
        tourType,
        preferredTourDate,
        message,
      },
    }).catch((error) => console.error("Tour email error:", error));
  }

  res.status(201).json({
    status: "success",
    message: "Tour request enquiry submitted successfully",
    data: enquiry,
    timestamp: new Date().toISOString(),
  });
});

const sendTourRequestEmail = async ({ agent, propertyTitle, visitor }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { name, email, phoneNumber, tourType, preferredTourDate, message } =
    visitor;

  const html = `
    <p>Hi ${agent.name || "Agent"},</p>
    <p>A new tour request has been submitted for the property <strong>${
      propertyTitle || "N/A"
    }</strong>.</p>
    <p><strong>Visitor details:</strong></p>
    <ul>
      <li>Name: ${name}</li>
      <li>Email: ${email}</li>
      <li>Phone: ${phoneNumber}</li>
      <li>Tour Type: ${
        tourType === "in-person" ? "In-Person" : "Video Chat"
      }</li>
      <li>Preferred Tour Date: ${new Date(
        preferredTourDate
      ).toLocaleString()}</li>
    </ul>
    ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ""}
    <p>Please reach out to the visitor to confirm the schedule.</p>
    <p>Regards,<br/>BigCat Team</p>
  `;

  await transporter.sendMail({
    from: `"BigCat" <${process.env.EMAIL_USER}>`,
    to: agent.email,
    subject: "New tour request enquiry assigned",
    html,
  });
};

module.exports = {
  createTourRequestEnquiry,
};
