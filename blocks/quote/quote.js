/**
 * Entry point to the block's JavaScript.
 * Must be exported as default and accept a block's DOM element.
 * This function is called by the project's scripts.js, passing the block's element.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
export default function decorate(block) {
  const [quoteWrapper] = block.children;
  const [quote, author] = quoteWrapper.children;

  // Create blockquote element
  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
  
  // Create a div for the author
  const authorDiv = document.createElement('div');
  
  // Check if author element exists and has content
  if (author && author.textContent.trim()) {
    // Find paragraph in author div if it exists
    const authorParagraph = author.querySelector('p');
    
    // If paragraph exists, use its content, otherwise use the author element's content
    const authorText = authorParagraph ? authorParagraph.textContent : author.textContent.trim();
    
    // Set the author div content
    authorDiv.textContent = authorText;
    
    // Add the author class to the div
    authorDiv.classList.add('author');
    
    // Create a container for the author
    const authorContainer = document.createElement('div');
    authorContainer.appendChild(authorDiv);
    
    // Add the author container after the blockquote
    quoteWrapper.appendChild(authorContainer);
  }

  // Block options are handled automatically by EDS through CSS classes
  // No JavaScript needed for background style management
}