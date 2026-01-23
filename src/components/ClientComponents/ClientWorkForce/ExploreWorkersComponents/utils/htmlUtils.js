/**
 * HTML Utilities
 * 
 * Pure utility functions for HTML sanitization and manipulation.
 * Framework-agnostic and reusable across the application.
 */

/**
 * Sanitize HTML content
 * Removes potentially dangerous tags and attributes while preserving formatting
 * 
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags and other dangerous elements
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
  dangerousTags.forEach(tag => {
    const elements = temp.getElementsByTagName(tag);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  });
  
  // Remove dangerous attributes
  const allElements = temp.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    const attributes = Array.from(element.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'formaction') {
        element.removeAttribute(attr.name);
      }
    });
  }
  
  return temp.innerHTML;
};

/**
 * Strip HTML tags for preview
 * 
 * @param {string} html - HTML string to strip
 * @returns {string} - Plain text string
 */
export const stripHTML = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};
