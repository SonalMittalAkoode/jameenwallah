/**
 * Format price in Indian currency format (lakhs/crores)
 * @param {number} price - Price in rupees
 * @returns {string} - Formatted price string (e.g., "₹50 Lakhs", "₹2.5 Crores")
 */
export const formatPriceInLakhsCrores = (price) => {
  if (!price || isNaN(price) || price <= 0) {
    return null;
  }

  const priceNum = Number(price);
  
  // 1 Crore = 100 Lakhs = 10,000,000
  if (priceNum >= 10000000) {
    // Format in crores
    const crores = priceNum / 10000000;
    // If it's a whole number, show without decimals, otherwise show 1 decimal
    const formattedCrores = crores % 1 === 0 
      ? crores.toFixed(0) 
      : crores.toFixed(1);
    return `₹${formattedCrores} ${crores === 1 ? 'Crore' : 'Crores'}`;
  } else if (priceNum >= 100000) {
    // Format in lakhs
    const lakhs = priceNum / 100000;
    // If it's a whole number, show without decimals, otherwise show 1 decimal
    const formattedLakhs = lakhs % 1 === 0 
      ? lakhs.toFixed(0) 
      : lakhs.toFixed(1);
    return `₹${formattedLakhs} ${lakhs === 1 ? 'Lakh' : 'Lakhs'}`;
  } else {
    // For amounts less than 1 lakh, show in rupees with commas
    return `₹${priceNum.toLocaleString('en-IN')}`;
  }
};

/**
 * Format price range from min and max prices
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} - Formatted price range string
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice || isNaN(minPrice) || minPrice <= 0) {
    return null;
  }

  const minFormatted = formatPriceInLakhsCrores(minPrice);
  
  if (!maxPrice || isNaN(maxPrice) || maxPrice <= 0 || minPrice === maxPrice) {
    return minFormatted ? `Starting from ${minFormatted}` : null;
  }

  const maxFormatted = formatPriceInLakhsCrores(maxPrice);
  
  if (!maxFormatted) {
    return minFormatted ? `Starting from ${minFormatted}` : null;
  }

  return `Starting from ${minFormatted}`;
};

