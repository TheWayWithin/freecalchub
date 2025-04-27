// Page speed optimization for CalcHub
document.addEventListener('DOMContentLoaded', function() {
  // Lazy load images that are below the fold
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  } else {
    // Fallback for browsers that don't support native lazy loading
    // Load lazysizes library if needed
    if (typeof lazySizes === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      document.body.appendChild(script);
      
      // Add lazyload class to images
      const images = document.querySelectorAll('img:not([loading="eager"])');
      images.forEach(img => {
        img.classList.add('lazyload');
        img.setAttribute('data-src', img.getAttribute('src'));
        img.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
      });
    }
  }
  
  // Defer non-critical JavaScript
  const deferScripts = document.querySelectorAll('script[defer-loading]');
  deferScripts.forEach(script => {
    const src = script.getAttribute('defer-loading');
    script.removeAttribute('defer-loading');
    
    setTimeout(() => {
      script.setAttribute('src', src);
    }, 2000); // Load after 2 seconds
  });
  
  // Preconnect to external domains
  const domains = [
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://www.googletagmanager.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
});
