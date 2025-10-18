
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add("fade");
      }, 100);
    }
  });
});
document.querySelectorAll(".fade").forEach(el => observer.observe(el));



document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    const targetUrl = this.href;
    const topbar = document.querySelector('.topbar');
    const mainWrapper = document.querySelector('.main-wrapper');
    const kacheln = document.querySelector('.kacheln');
    const mainWrapperSubsites = document.querySelector('.main-wrapper-subsites');

    topbar?.classList.remove('fade');
    mainWrapper?.classList.remove('fade');
    kacheln?.classList.remove('fade');
    mainWrapperSubsites?.classList.remove('fade');
    topbar?.classList.add('fade-out');
    mainWrapper?.classList.add('fade-out');
    kacheln?.classList.add('fade-out');
    mainWrapperSubsites?.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
  });
});
