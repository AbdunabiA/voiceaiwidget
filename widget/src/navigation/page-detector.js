export function getCurrentPage() {
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    hash: window.location.hash,
  };
}
