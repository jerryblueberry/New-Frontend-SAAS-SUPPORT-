/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes script tags and dangerous event handlers
 * 
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove script tags and dangerous attributes
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach((script) => script.remove());

  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((element) => {
    const dangerousAttrs = [
      'onclick',
      'onload',
      'onerror',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ];
    dangerousAttrs.forEach((attr) => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });

    // Remove href from non-anchor elements
    if (element.tagName.toLowerCase() !== 'a' && element.hasAttribute('href')) {
      element.removeAttribute('href');
    }
  });

  return tempDiv.innerHTML;
};
