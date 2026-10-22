const navigationLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('#selected-work, #resume, #contact');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-15% 0px -20% 0px' });
  sections.forEach(section => observer.observe(section));
}
