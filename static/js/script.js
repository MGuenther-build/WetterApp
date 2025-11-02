function hideSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) spinner.style.display = 'none';
}

function showSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) spinner.style.display = 'block';
}

function fadeTransition({ elements, fadeOutClass = 'fade-out', fadeInClass = 'fade', onComplete }) {
  elements.forEach(el => {
    el.classList.remove(fadeInClass);
    void el.offsetWidth;
    el.classList.add(fadeOutClass);
  });

  const primary = elements[0];
  if (primary) {
  const onEnd = () => onComplete?.();
  primary.addEventListener('animationend', onEnd, { once: true });
  primary.addEventListener('transitionend', onEnd, { once: true });
}

}

function decodeEmail() {
  const parts = ["UHJvdG9vbHMxODAy", "Z21haWwuY29t"];
  const email = atob(parts[0]) + "@" + atob(parts[1]);
  const emailSpan = document.getElementById("email");
  if (emailSpan) emailSpan.textContent = email;
}

function initPage() {
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

  const menuButton = document.getElementById('mobile-menu');
  const navList = document.querySelector('.topbar ul');
  if (menuButton && navList) {
    menuButton.onclick = (e) => {
      e.stopPropagation();
      navList.classList.toggle('show');
    };
    navList.querySelectorAll('a').forEach(link => {
      link.onclick = (e) => {
        navList.classList.remove('show');
        handleNavigation(e, link.href);
      };
    });
  }

  document.addEventListener('click', (e) => {
    const clickedInsideMenu = navList.contains(e.target);
    const clickedToggle = menuButton.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      navList.classList.remove('show');
    }
  });

  document.querySelectorAll('a:not(.topbar a)').forEach(link => {
    link.onclick = (e) => handleNavigation(e, link.href);
  });
}

function showError(message) {
  const errorBox = document.getElementById("errorMessage");
  if (!errorBox) 
    return;

  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  }, 3000);
}

function handleNavigation(e, targetUrl) {
  if (!targetUrl || !targetUrl.startsWith(location.origin)) 
    return;

  e.preventDefault();

  const elementsToFade = [
    document.querySelector('.main-wrapper'),
    document.querySelector('.kacheln'),
    document.querySelector('.main-wrapper-subsites'),
    document.querySelector('.main-wrapper-impressum')
  ].filter(Boolean);

  fadeTransition({
    elements: elementsToFade,
    onComplete: () => {
      history.pushState(null, '', targetUrl);
      loadPage(targetUrl);
    }
  });
}

async function loadPage(url) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newMain = doc.querySelector('.main-wrapper');
      const newSubsite = doc.querySelector('.main-wrapper-subsites');
      const newImpressum = doc.querySelector('.main-wrapper-impressum');

      const containerMain = document.querySelector('.main-wrapper');
      const containerSubsite = document.querySelector('.main-wrapper-subsites');
      const containerImpressum = document.querySelector('.main-wrapper-impressum');

      if (newMain && containerMain) {
        containerMain.innerHTML = newMain.innerHTML;
      } else if (newSubsite && containerSubsite) {
        containerSubsite.innerHTML = newSubsite.innerHTML;
      } else if (newImpressum && containerImpressum) {
        containerImpressum.innerHTML = newImpressum.innerHTML;
      } else {
        window.location.href = url;
        return;
      }

      initPage();

    })
    .catch(err => {
      console.error('Fehler beim Laden der Seite:', err);
      window.location.href = url;
    });
}

window.addEventListener('popstate', () => {
  loadPage(location.href);
});

// Initialisierung //
window.addEventListener('DOMContentLoaded', initPage);
