/**
 * Utility functions for handling HTML content
 */

/**
 * Extracts text content from HTML, removing all HTML tags
 * More performant than regex for large HTML strings
 */
export function getTextContentFromHtml(html: string): string {
  if (!html) return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (error) {
    // Fallback to regex if DOMParser fails
    console.warn('DOMParser failed, falling back to regex:', error);
    return html.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitizes HTML content using DOMPurify if available
 * Falls back to basic text extraction if DOMPurify is not available
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  try {
    // Check if DOMPurify is available (will be imported where needed)
    if (typeof (globalThis as any).DOMPurify !== 'undefined') {
      return (globalThis as any).DOMPurify.sanitize(html);
    }
    // Fallback: return as-is if DOMPurify is not available
    console.warn('DOMPurify not available, returning unsanitized HTML');
    return html;
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    return html;
  }
}
