
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



function initBurgermenu() {
    const menuButton = document.getElementById('mobile-menu');
    const navList = document.querySelector('.topbar ul');

    if (!menuButton || !navList) 
      return;

    menuButton.onclick = (e) => {
        e.stopPropagation();
        navList.classList.toggle('show');
    };

    document.addEventListener('click', (e) => {
        if (!navList.contains(e.target) && !menuButton.contains(e.target)) {
            navList.classList.remove('show');
        }
    });
}



function initPage() {
  decodeEmail();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade");
        observer.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll(".fade-trigger").forEach(el => observer.observe(el));

  document.querySelectorAll('a:not(.topbar a)').forEach(link => {
    link.onclick = (e) => handleNavigation(e, link.href);
  });

  initBurgermenu();
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
  try {
    const response = await fetch(url);
    const html = await response.text();

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

  } catch (err) {
    console.error('Fehler beim Laden der Seite:', err);
    window.location.href = url;
  }
}



window.addEventListener('popstate', () => {
  loadPage(location.href);
});



// Initialisierung //
window.addEventListener('DOMContentLoaded', initPage);
