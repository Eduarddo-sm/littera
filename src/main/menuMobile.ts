const menuToggle = document.getElementById('menu-toggle') as HTMLButtonElement;
const sidebar = document.getElementById('sidebar') as HTMLElement;
const sidebarOverlay = document.getElementById('sidebar-overlay') as HTMLElement;
const sidebarClose = document.getElementById('sidebar-close') as HTMLButtonElement;


function openMenu() {
  sidebar.classList.add('active');
  sidebarOverlay.classList.add('active');
  menuToggle.classList.add('active');
  document.body.style.overflow = 'hidden'; 
  
  if (window.innerWidth <= 768) {
    if (sidebarClose) sidebarClose.style.display = 'block';
  }
}


function closeMenu() {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  menuToggle.classList.remove('active');
  document.body.style.overflow = ''; 
  
  if (sidebarClose) sidebarClose.style.display = 'none';
}


if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeMenu);
}

if (sidebarClose) {
  sidebarClose.addEventListener('click', closeMenu);
}


const sidebarLinks = sidebar.querySelectorAll('a');
sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  });
});


window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
    if (sidebarClose) sidebarClose.style.display = 'none';
  }
});


document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflowX = 'hidden';
});