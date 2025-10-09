const searchIcon = document.getElementById('search-icon') as HTMLElement;
const closeSearch = document.getElementById('close-search') as HTMLElement;
const searchContainer = document.getElementById('popup-search-container') as HTMLElement;
const searchInput = document.getElementById('popup-input') as HTMLInputElement;
const logoHeader = document.getElementById('logo-header') as HTMLElement;

let isSearchActive = false;


function openSearch() {
  if (isSearchActive) return;
  
  isSearchActive = true;
  searchContainer.classList.add('active');
  logoHeader.classList.add('hidden');
  closeSearch.classList.add('active');
  searchIcon.style.display = 'none';
  

  setTimeout(() => {
    searchInput.focus();
  }, 300);
}


function closeSearchBar() {
  if (!isSearchActive) return;
  
  isSearchActive = false;
  searchContainer.classList.remove('active');
  logoHeader.classList.remove('hidden');
  closeSearch.classList.remove('active');
  searchIcon.style.display = 'block';
  
}


if (searchIcon) {
  searchIcon.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  });
}


if (closeSearch) {
  closeSearch.addEventListener('click', () => {
    closeSearchBar();
  });
}


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isSearchActive) {
    closeSearchBar();
  }
});


if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && isSearchActive) {

      console.log('Pesquisando:', searchInput.value);
      

      setTimeout(() => {
        closeSearchBar();
      }, 500);
    }
  });
  

  searchInput.addEventListener('blur', () => {

    setTimeout(() => {
      if (isSearchActive && document.activeElement !== searchInput) {
        closeSearchBar();
      }
    }, 200);
  });
}


if (searchContainer) {
  searchContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}