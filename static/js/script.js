
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

    const spinner = document.getElementById('global-loading-indicator');
    if (spinner) {
      spinner.style.display = 'block';
    }

    const elementsToFade = [
      document.querySelector('.main-wrapper'),
      document.querySelector('.kacheln'),
      document.querySelector('.main-wrapper-subsites'),
      document.querySelector('.main-wrapper-impressum')
    ].filter(Boolean);

    fadeTransition({
      elements: elementsToFade,
      onComplete: () => {
        window.location.href = targetUrl;
      }
    });
  });
});

function decodeEmail() {
  const parts = ["UHJvdG9vbHMxODAy", "Z21haWwuY29t"];
  const email = atob(parts[0]) + "@" + atob(parts[1]);
  const emailSpan = document.getElementById("email");
  if (emailSpan) {
    emailSpan.textContent = email;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) {
    spinner.style.display = 'none';
  }
  decodeEmail();
});
