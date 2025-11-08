import { authGuard, verifyAuth } from "./auth";

const addBookBtn = document.getElementById('add-book-btn') as HTMLButtonElement;
const addBookModal = document.getElementById('add-book-modal') as HTMLElement;
const closeAddBookModal = document.getElementById('close-add-book-modal') as HTMLElement;



if (addBookBtn) {
  addBookBtn.addEventListener('click', async () => {
    let verify = await verifyAuth();
    if (verify) {
      addBookModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      addBookBtn.style.display = "none";
    }
  });
}

if (closeAddBookModal) {
  closeAddBookModal.addEventListener('click', () => {
    addBookModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

addBookModal?.addEventListener('click', (e) => {
  if (e.target === addBookModal) {
    addBookModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && addBookModal?.classList.contains('active')) {
    addBookModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

const imagemInput = document.getElementById('imagem') as HTMLInputElement;
const imagePreview = document.getElementById('image-preview') as HTMLElement;
