
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade");
      observer.unobserve(entry.target);
    }
  });
});
document.querySelectorAll(".fade-trigger").forEach(el => observer.observe(el));

function fadeTransition({ elements, fadeOutClass = 'fade-out', fadeInClass = 'fade', onComplete }) {
  elements.forEach(el => {
    el.classList.remove(fadeInClass);
    void el.offsetWidth;
    el.classList.add(fadeOutClass);
  });

  const primary = elements[0];
  if (primary) {
    primary.addEventListener('animationend', () => {
      onComplete?.();
    }, { once: true });
  }
}

document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetUrl = this.href;

    const elementsToFade = [
      document.querySelector('.topbar'),
      document.querySelector('.main-wrapper'),
      document.querySelector('.kacheln'),
      document.querySelector('.main-wrapper-subsites')
    ].filter(Boolean);
    
    fadeTransition({
      elements: elementsToFade,
      onComplete: () => {
        window.location.href = targetUrl;
      }
    });
  });
});
