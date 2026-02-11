export function highlightElement(element, primaryColor) {
  const color = primaryColor || '#6C5CE7';

  element.style.transition = 'outline 0.3s ease, box-shadow 0.3s ease';
  element.style.outline = `3px solid ${color}`;
  element.style.boxShadow = `0 0 20px ${color}40`;

  setTimeout(() => {
    element.style.outline = 'none';
    element.style.boxShadow = 'none';
  }, 3000);
}
