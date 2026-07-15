/* =========================================================
   F-SQUARE — mobile nav
   Toggles the slide-down menu when the burger icon is tapped.
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--mobile-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close the menu when a link inside it is tapped
  nav.querySelectorAll('.nav__links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--mobile-open');
      burger.classList.remove('is-active');
    });
  });
});
