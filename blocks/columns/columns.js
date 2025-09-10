export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Handle image-text-split variant specific styling
  if (block.classList.contains('variant-image-text-split')) {
    const firstCol = block.querySelector('div > div:first-child');
    const secondCol = block.querySelector('div > div:last-child');
    
    if (firstCol && secondCol) {
      // Ensure first column is treated as image column
      const pic = firstCol.querySelector('picture');
      if (pic) {
        firstCol.classList.add('columns-img-col');
      }
      
      // Add specific classes for text content styling
      const heading = secondCol.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.classList.add('image-text-split-heading');
      }
      
      const paragraph = secondCol.querySelector('p');
      if (paragraph) {
        paragraph.classList.add('image-text-split-text');
      }
    }
  }
}
