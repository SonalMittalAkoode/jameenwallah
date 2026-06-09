import React from "react";
import SearchBox from "./SearchBox";
import Categrory from "./Categrory";
import LatestPost from "./LatestPost";
import ContactForm from "@/components/pages/contact/Form";

const BlogSidebar = () => {
  return (
    <div className="blog-sidebar">
      <SearchBox />
      <Categrory />
      <LatestPost />
      <div className="sidebar-widget mb30 pb20">
        <h6 className="widget-title">Enquiry</h6>
        <ContactForm source="blog" />
      </div>
    </div>
  );
};

// Mobile Search Component - Shows at top on small screens
BlogSidebar.MobileSearch = () => {
  return (
    <div className="mobile-blog-search">
      <SearchBox />
    </div>
  );
};

export default BlogSidebar;
