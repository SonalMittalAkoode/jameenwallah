const AgentContactEnquiry = require("../../models/agentContactEnquiry");
const Agent = require("../../models/agent");
const Property = require("../../models/property");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const createAgentContactEnquiry = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    message,
    agent: agentIdentifier, // slug or ObjectId
    property,
  } = req.body;

  console.log("AGENT IDENTIFIER RECEIVED:", req.body.agent);

  // ---------- Basic validation ----------
  if (!name || !email || !phoneNumber || !agentIdentifier) {
    return res.status(400).json({
      status: "error",
      message: "Required fields missing: name, email, phoneNumber, agent",
    });
  }

  // ---------- Phone validation ----------
  const cleanedPhone = phoneNumber.trim().replace(/[\s\-\(\)\+]/g, "");

  if (!/^\d+$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number should contain only numbers",
    });
  }

  // Validate exactly 10 digits
  if (cleanedPhone.length !== 10) {
    return res.status(400).json({
      status: "error",
      message: "Phone number must be exactly 10 digits",
    });
  }

  // Validate starts with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return res.status(400).json({
      status: "error",
      message: "Phone number must start with 6, 7, 8, or 9",
    });
  }

  // ---------- Agent lookup (slug first) ----------
  let agentDoc = null;
  const normalizedSlug = String(agentIdentifier).toLowerCase().trim();

  try {
    agentDoc = await Agent.findOne({ slug: normalizedSlug })
      .select("_id name phoneNumber email")
      .lean();

    // Fallback to ObjectId (legacy support)
    if (!agentDoc && mongoose.Types.ObjectId.isValid(agentIdentifier)) {
      agentDoc = await Agent.findById(agentIdentifier)
        .select("_id name phoneNumber email")
        .lean();
    }
  } catch (err) {
    console.error("Agent lookup error:", err);
    return res.status(500).json({
      status: "error",
      message: "Error finding agent",
    });
  }

  if (!agentDoc) {
    return res.status(404).json({
      status: "error",
      message: "Agent not found",
    });
  }

  // ---------- Property (optional, non-blocking) ----------
  let propertyInfo = null;

  if (property && mongoose.Types.ObjectId.isValid(property)) {
    try {
      const propertyDoc = await Property.findById(property)
        .select("description.title details.customId")
        .lean();

      if (propertyDoc) {
        propertyInfo = {
          title: propertyDoc.description?.title || null,
          customId: propertyDoc.details?.customId || null,
        };
      }
    } catch (err) {
      console.error("Property lookup failed:", err);
    }
  }

  // ---------- Create enquiry ----------
  const enquiry = await AgentContactEnquiry.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phoneNumber: Number(cleanedPhone),
    message: message?.trim(),
    agent: agentDoc._id,
  });

  // ---------- Email (async, non-blocking) ----------
  if (agentDoc.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    sendAgentContactEmail({
      agent: agentDoc,
      visitor: { name, email, phoneNumber, message },
      propertyInfo,
    }).catch(console.error);
  }

  res.status(201).json({
    status: "success",
    message: "Agent contact enquiry submitted successfully",
    data: enquiry,
  });
});

// send agent contact email
const sendAgentContactEmail = async ({ agent, visitor, propertyInfo }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const propertyText =
    propertyInfo?.title || propertyInfo?.customId
      ? `<p><strong>Property:</strong> ${
          propertyInfo.title || propertyInfo.customId
        }</p>`
      : "";

  const html = `
    <p>Hi ${agent.name || "Agent"},</p>
    <p>A new contact enquiry has been submitted.</p>
    ${propertyText}
    <p><strong>Visitor details:</strong></p>
    <ul>
      <li>Name: ${visitor.name}</li>
      <li>Email: ${visitor.email}</li>
      <li>Phone: ${visitor.phoneNumber}</li>
    </ul>
    ${
      visitor.message
        ? `<p><strong>Message:</strong><br/>${visitor.message}</p>`
        : ""
    }
    <p>Please reach out to the visitor at your earliest convenience.</p>
    <p>Regards,<br/>BigCat Team</p>
  `;

  await transporter.sendMail({
    from: `"BigCat" <${process.env.EMAIL_USER}>`,
    to: agent.email,
    subject: "New agent contact enquiry",
    html,
  });
};

module.exports = {
  createAgentContactEnquiry,
};
