"use client";

import React, { useState, useRef, useEffect } from "react";
import { normalizePropertyDetail } from "@/utils/propertyDetail";

const ProperytyDescriptions = ({ property }) => {
  const data = normalizePropertyDetail(property);
  const description = data.description || "Property description is not available.";
  const [expanded, setExpanded] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [truncatedText, setTruncatedText] = useState(description);
  const textRef = useRef(null);

  useEffect(() => {
    // Check if description has more than 80 words
    const plainText = description.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/);
    
    // If description has more than 80 words, show truncated version
    if (words.length > 80) {
      setShowLoadMore(true);
      
      // Create truncated version that preserves HTML tags for the first 80 words
      let wordCount = 0;
      let truncatedHTML = '';
      let insideTag = false;
      let tagBuffer = '';
      
      for (let i = 0; i < description.length && wordCount < 80; i++) {
        const char = description[i];
        
        if (char === '<') {
          insideTag = true;
          tagBuffer = '<';
        } else if (char === '>' && insideTag) {
          insideTag = false;
          tagBuffer += '>';
          truncatedHTML += tagBuffer;
          tagBuffer = '';
        } else if (insideTag) {
          tagBuffer += char;
        } else {
          // We're in text content
          if (char === ' ' || char === '\n' || char === '\t') {
            wordCount++;
            if (wordCount >= 80) {
              break;
            }
          }
          truncatedHTML += char;
        }
      }
      
      // Close any open tags
      if (insideTag) {
        truncatedHTML += tagBuffer + '>';
      }
      
      truncatedHTML = truncatedHTML.trim() + '...';
      setTruncatedText(truncatedHTML);
    }
  }, [description]);

  const handleLoadMore = () => {
    setExpanded(true);
    setShowLoadMore(false);
  };

  const handleShowLess = () => {
    setExpanded(false);
    setShowLoadMore(true);
  };

  return (
    <>
      <div className="property-description-wrapper" ref={textRef}>
        <div 
          className="property-description-text" 
          dangerouslySetInnerHTML={{ 
            __html: expanded ? description : truncatedText 
          }}
        />
      </div>
      
      {showLoadMore && (
        <button 
          className="load-more-btn mt-3" 
          onClick={handleLoadMore}
        >
          Load More <i className="fa fa-angle-down ms-1"></i>
        </button>
      )}
      
      {expanded && showLoadMore === false && (
        <button 
          className="show-less-btn mt-3" 
          onClick={handleShowLess}
        >
          Show Less <i className="fa fa-angle-up ms-1"></i>
        </button>
      )}
    </>
  );
};

export default ProperytyDescriptions;
