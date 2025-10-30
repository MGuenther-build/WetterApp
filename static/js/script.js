function hideSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) spinner.style.display = 'none';
}

function showSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) {
    spinner.style.display = 'block';
    setTimeout(hideSpinner, 3500);
  }
}

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

function decodeEmail() {
  const parts = ["UHJvdG9vbHMxODAy", "Z21haWwuY29t"];
  const email = atob(parts[0]) + "@" + atob(parts[1]);
  const emailSpan = document.getElementById("email");
  if (emailSpan) emailSpan.textContent = email;
}

function initPage() {
  hideSpinner();
  decodeEmail();
  document.querySelectorAll('.fade-out').forEach(el => {
    el.classList.remove('fade-out');
    el.classList.add('fade');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade");
        observer.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll(".fade-trigger").forEach(el => observer.observe(el));

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetUrl = this.href;
      if (targetUrl.startsWith(location.origin)) {
        e.preventDefault();
        showSpinner();

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
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initPage);

window.addEventListener('pageshow', (event) => {
  initPage();
  if (event.persisted) {
    document.querySelectorAll('.fade-out').forEach(el => {
      el.classList.remove('fade-out');
      el.classList.add('fade');
    });
  }
});

window.addEventListener('popstate', () => {
  initPage();
});
