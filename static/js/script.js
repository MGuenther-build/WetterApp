function hideSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) spinner.style.display = 'none';
}

function showSpinner() {
  const spinner = document.getElementById('global-loading-indicator');
  if (spinner) {
    spinner.style.display = 'block';
    setTimeout(hideSpinner, 3000);
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
        handleInternalNavigation(e, link.href);
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
    link.onclick = (e) => handleInternalNavigation(e, link.href);
  });

  document.getElementById('wetterForm').addEventListener('submit', function (e) {
  const input = document.getElementById('stationInput');
  const hidden = document.getElementById('station');
  const datalist = document.getElementById('stationenList');

  const match = Array.from(datalist.options).find(opt => opt.value.trim() === input.value.trim());
  if (match) {
    hidden.value = match.dataset.staid;
  } else {
    e.preventDefault();
    alert("❌ Kein Ort mit diesem Namen gefunden!");
  }
});
}

function handleInternalNavigation(e, targetUrl) {
  if (!targetUrl || !targetUrl.startsWith(location.origin)) 
    return;

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

// Initialisierung //
window.addEventListener('DOMContentLoaded', initPage);
