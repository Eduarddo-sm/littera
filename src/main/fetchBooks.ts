
import { supabase } from './supabase';

async function fetchBooks() {
  const { data, error } = await supabase
    .from('anuncios')
    .select('id, titulo, sobre, imagens');

  if (error) {
    console.error('Erro ao buscar livros:', error);
    return [];
  }
  return data || [];
}

type Livro = {
  id: string;
  titulo: string;
  sobre: string;
  imagens: string[];
};

function createBookCard(livro: Livro) {
  const card = document.createElement('div');
  card.className = 'card';

  const thumb = document.createElement('img');
  thumb.className = 'card-thumb';
  thumb.src = livro.imagens && livro.imagens.length > 0 ? livro.imagens[0] : '';
  thumb.alt = livro.titulo;

  const title = document.createElement('h3');
  title.textContent = livro.titulo;

  const desc = document.createElement('p');
  desc.textContent = livro.sobre;

  const button = document.createElement('button');
  button.className = "more"
  button.textContent = 'Ver mais';
    button.addEventListener('click', () => {
      window.location.href = `../pages/livro/livroPagina.html?id=${livro.id}`;
    });

  card.appendChild(thumb);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(button);

  return card;
}

async function renderBooks() {
  const books = await fetchBooks();
  const container = document.getElementById('cards-grid');
  if (!container) return;
  container.innerHTML = '';
  (books as Livro[]).forEach(livro => {
    container.appendChild(createBookCard(livro));
  });
}

document.addEventListener('DOMContentLoaded', renderBooks);
