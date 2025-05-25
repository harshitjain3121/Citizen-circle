/**
 * Calculate distance between two geographic coordinates
 * @param {Array} coords1 [longitude, latitude]
 * @param {Array} coords2 [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
exports.calculateDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  // Earth's radius in kilometers
  const R = 6371;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

/**
 * Format date to a readable string
 * @param {Date} date Date object
 * @returns {String} Formatted date string
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleString();
};

/**
 * Generate a slug from a string
 * @param {String} text Input text
 * @returns {String} URL-friendly slug
 */
exports.generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};