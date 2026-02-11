import { highlightElement } from './highlighter.js';

export class Navigator {
  constructor(primaryColor) {
    this.primaryColor = primaryColor || '#6C5CE7';
  }

  executeAction(action) {
    if (action.type === 'navigate_to') {
      this.navigateTo(action.params.target, action.params.highlight);
    } else if (action.type === 'open_external_link') {
      window.open(action.params.url, '_blank');
    }
  }

  navigateTo(target, highlight) {
    if (!target) return;

    if (target.startsWith('/') && !target.includes('#')) {
      window.location.href = target;
      return;
    }

    if (target.includes('#')) {
      const [path, hash] = target.split('#');

      if (path && path !== '/' && path !== window.location.pathname) {
        window.location.href = target;
        return;
      }

      const element =
        document.getElementById(hash) ||
        document.querySelector(`[data-section="${hash}"]`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (highlight) {
          highlightElement(element, this.primaryColor);
        }
      }
    }
  }
}
