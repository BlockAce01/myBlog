/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to slug
 * @returns {string} The generated slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} A unique slug
 */
function generateUniqueSlug(baseSlug, existingSlugs = []) {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = {
  generateSlug,
  generateUniqueSlug
};
