
import { supabase } from './supabase';

async function fetchBooks(query?: string) {
  try {
    let builder = supabase
      .from('anuncios')
      .select('id, titulo, autora, paginas, editora, sobre, imagens, status');

    if (query && query.trim() !== '') {
      const q = query.trim();
      builder = builder.ilike('titulo', `%${q}%`);
    }

    const { data, error } = await builder;
    if (error) {
      console.error('Erro ao buscar livros:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Erro inesperado ao buscar livros:', err);
    return [];
  }
}

type Livro = {
  id: string;
  titulo: string;
  autora?: string;
  paginas?: number;
  editora?: string;
  sobre: string;
  imagens: string[];
  status?: string;
};

function createBookCard(livro: Livro) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.position = 'relative';

  const thumb = document.createElement('img');
  thumb.className = 'card-thumb';
  thumb.src = livro.imagens && livro.imagens.length > 0 ? livro.imagens[0] : '';
  thumb.alt = livro.titulo;

  const title = document.createElement('h3');
  title.textContent = livro.titulo;

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const parts: string[] = [];

  if (livro.status) parts.push(livro.status);
  meta.textContent = parts.join(' ');

  const desc = document.createElement('p');
  desc.textContent = livro.sobre;

  const button = document.createElement('button');
  button.className = "more"
  button.textContent = 'Ver mais';
    button.addEventListener('click', () => {
      window.location.href = `../pages/livro/livroPagina.html?id=${livro.id}`;
    });

  card.appendChild(thumb);
  card.appendChild(meta);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(button);

  return card;
}

function showNoResults(container: HTMLElement, query?: string) {
  container.innerHTML = '';
  const msg = document.createElement('div');
  msg.className = 'tooltip-box';
  msg.textContent = query ? `Nenhum resultado encontrado para "${query}".` : 'Nenhum anúncio encontrado.';
  container.appendChild(msg);
}

async function renderBooks(query?: string) {
  const books = await fetchBooks(query);
  const container = document.getElementById('cards-grid');
  if (!container) return;
  container.innerHTML = '';

  if (!books || (Array.isArray(books) && books.length === 0)) {
    showNoResults(container, query);
    return;
  }

  (books as Livro[]).forEach(livro => {
    container.appendChild(createBookCard(livro));
  });
}

function setupSearchHandlers() {
  const input = document.getElementById('popup-input') as HTMLInputElement | null;
  const searchBtn = document.querySelector('.top-nav .btn');

  if (input) {
    // Search on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        renderBooks(q);
      }
    });


    const debounce = <F extends (...args: any[]) => void>(fn: F, wait = 300) => {
      let timer: number | undefined;
      return (...args: Parameters<F>) => {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), wait) as unknown as number;
      };
    };

    const onInput = debounce(() => {
      const q = input.value.trim();
      renderBooks(q === '' ? undefined : q);
    }, 300);

    input.addEventListener('input', onInput);
  }

  if (searchBtn) {
   
    searchBtn.addEventListener('click', (e) => {

      e.preventDefault();
      if (input) {
        input.focus();
        const q = input.value.trim();
        if (q !== '') {
 
          setTimeout(() => renderBooks(q), 100);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {

  renderBooks();
  setupSearchHandlers();
});
