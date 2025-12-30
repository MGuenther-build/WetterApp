
function decodeEmail() {
  const parts = ["UHJvdG9vbHMxODAy", "Z21haWwuY29t"];
  const email = atob(parts[0]) + "@" + atob(parts[1]);
  const emailSpan = document.getElementById("email");
  if (emailSpan) emailSpan.textContent = email;
}



function fadeTransition({ elements, fadeOutClass = 'fade-out', fadeInClass = 'fade', onComplete }) {
  elements.forEach(el => {
    el.classList.remove(fadeInClass);
    void el.offsetWidth;
    el.classList.add(fadeOutClass);
  });
  
  const primary = elements[0];
  if (primary) {
    requestAnimationFrame(() => {
      const onEnd = () => onComplete?.();
      primary.addEventListener('animationend', onEnd, { once: true });
      primary.addEventListener('transitionend', onEnd, { once: true });
    });
  }
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
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('show');
    });
  });
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
  document.querySelectorAll('a[href]').forEach(link => {
    const isExternal = !link.href.startsWith(location.origin);
    if (!isExternal) {
      link.onclick = (e) => handleNavigation(e, link.href);
    }
  });
  initBurgermenu();
  if (document.getElementById('wetterFormVorhersage')) {
    initWettervorhersage();
  }
  if (document.getElementById('wetterForm')) {
    initWetterarchiv();
  }
}



function handleNavigation(e, targetUrl) {
  if (!targetUrl || !targetUrl.startsWith(location.origin)) 
    return;
  e.preventDefault();

  const pageWrapper = document.querySelector('.page-wrapper');
  if (!pageWrapper) {
    window.location.href = targetUrl;
    return;
  }

  const loadPromise = fetch(targetUrl)
    .then(res => res.text())
    .catch(() => window.location.href = targetUrl);

  fadeTransition({
    elements: [pageWrapper],
    onComplete: async () => {
      const html = await loadPromise;
      applyNewPage(html, targetUrl);

      pageWrapper.classList.remove('fade-out');
      void pageWrapper.offsetWidth;
      pageWrapper.classList.add('fade');
    }
  });
}



function applyNewPage(html, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const newWrapper = doc.querySelector('.page-wrapper');
  const oldWrapper = document.querySelector('.page-wrapper');

  if (newWrapper && oldWrapper) {
    oldWrapper.replaceWith(newWrapper);
  } else {
    window.location.href = url;
    return;
  }

  const newTopbar = doc.querySelector('#topbar');
  const oldTopbar = document.querySelector('#topbar');
  if (newTopbar && oldTopbar) {
    oldTopbar.className = newTopbar.className;
    oldTopbar.innerHTML = newTopbar.innerHTML;
  }

  const newFooter = doc.querySelector('#footer');
  const oldFooter = document.querySelector('#footer');
  if (newFooter && oldFooter) {
    oldFooter.className = newFooter.className;
    oldFooter.innerHTML = newFooter.innerHTML;
  }

  window.scrollTo({ top: 0, behavior: 'instant' });

  history.pushState(null, '', url);
  initPage();
  updateActiveLink(url);
}



function normalizeUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.pathname;
}
function updateActiveLink(currentUrl) {
  const path = normalizeUrl(currentUrl);
  const links = document.querySelectorAll('.topbar a');
  links.forEach(link => {
    const li = link.parentElement;
    if (normalizeUrl(link.href) === path) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}



window.addEventListener('popstate', () => {
  loadPage(location.href);
});
window.addEventListener('DOMContentLoaded', initPage);
