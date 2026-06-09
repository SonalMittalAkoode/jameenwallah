const nodemailer = require("nodemailer");

// Create reusable transporter
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send blog notification email to subscribers
const sendBlogNotificationEmail = async (subscriberEmail, blog) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("Email service not configured. Skipping email notification.");
    return;
  }

  // Get frontend URL from environment or use default
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const blogUrl = `${frontendUrl}/blog-detail/${blog.slug}`;

  // Truncate description for email preview
  const descriptionPreview = blog.description
    ? blog.description.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
    : "Read more about this exciting new blog post!";

  // Format date
  const blogDate = blog.date
    ? new Date(blog.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Blog Post: ${blog.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fff2e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #1a1a1a; margin: 0;">BigCat Realty</h1>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1a1a1a; margin-top: 0;">New Blog Post: ${blog.title}</h2>
        
        ${blog.image ? `
        <div style="margin: 20px 0;">
          <img src="${blog.image.startsWith('http') ? blog.image : apiBaseUrl + blog.image}" 
               alt="${blog.title}" 
               style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>
        ` : ""}
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          <strong>Published:</strong> ${blogDate}
        </p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #555;">${descriptionPreview}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${blogUrl}" 
             style="display: inline-block; background-color: #fc9401; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Read Full Article
          </a>
        </div>
        
        ${blog.tags && blog.tags.length > 0 ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            <strong>Tags:</strong> ${blog.tags.join(", ")}
          </p>
        </div>
        ` : ""}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          You're receiving this email because you subscribed to BigCat Realty newsletter.
        </p>
        <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
          <a href="${frontendUrl}" style="color: #fc9401; text-decoration: none;">Visit our website</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
New Blog Post: ${blog.title}

Published: ${blogDate}

${descriptionPreview}

Read the full article: ${blogUrl}

${blog.tags && blog.tags.length > 0 ? `Tags: ${blog.tags.join(", ")}` : ""}

---
You're receiving this email because you subscribed to BigCat Realty newsletter.
Visit our website: ${frontendUrl}
  `;

  try {
    await transporter.sendMail({
      from: `"BigCat Realty" <${process.env.EMAIL_USER}>`,
      to: subscriberEmail,
      subject: `New Blog Post: ${blog.title}`,
      html,
      text,
    });
  } catch (error) {
    console.error(`Failed to send email to ${subscriberEmail}:`, error.message);
    throw error;
  }
};

// Send blog notifications to all active subscribers
const notifySubscribersAboutBlog = async (blog) => {
  // Only send notifications for active blogs
  if (blog.status !== "active") {
    console.log("Blog is not active. Skipping subscriber notifications.");
    return;
  }

  const Subscriber = require("../models/subscribe");
  
  try {
    // Fetch all active subscribers
    const subscribers = await Subscriber.find({ isActive: true }).select("email");
    
    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found. Skipping email notifications.");
      return;
    }

    console.log(`Sending blog notification to ${subscribers.length} subscribers...`);

    // Send emails to all subscribers (in parallel, but handle errors individually)
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        await sendBlogNotificationEmail(subscriber.email, blog);
        console.log(`✓ Email sent to ${subscriber.email}`);
      } catch (error) {
        console.error(`✗ Failed to send email to ${subscriber.email}:`, error.message);
        // Continue with other emails even if one fails
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`Blog notification emails sent to ${subscribers.length} subscribers.`);
  } catch (error) {
    console.error("Error sending blog notifications to subscribers:", error);
    // Don't throw - we don't want to fail blog creation if email fails
  }
};

module.exports = {
  sendBlogNotificationEmail,
  notifySubscribersAboutBlog,
};

