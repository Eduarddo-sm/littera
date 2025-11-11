import { supabase } from './supabase';

type SearchType = 'books' | 'users' | 'all';

async function fetchBooks(query?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let builder = supabase
      .from('anuncios')
      .select('id, titulo, autora, paginas, editora, sobre, imagens, status, user_id, generos')
      .or('status.eq.EM ABERTO,status.is.null,status.eq.FECHADO');

    if (user) {
      builder = builder.neq('user_id', user.id);
    }

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

async function fetchUsers(query?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!query || query.trim() === '') {
      return [];
    }

    const q = query.trim();
    
    let builder = supabase
      .from('profiles')
      .select('id, name, username, avatar_url, bio');

    builder = builder.or(`name.ilike.%${q}%,username.ilike.%${q}%`);

    if (user) {
      builder = builder.neq('id', user.id);
    }

    builder = builder.limit(5);

    const { data, error } = await builder;
    
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Erro inesperado ao buscar usuários:', err);
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
  generos?: string[];
};

type Usuario = {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio: string;
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
  if (livro.status === 'FECHADO') {
    meta.style.color = '#bb0000ff';
    meta.style.background = '#ffa9a9d5';
  }
  meta.textContent = parts.join(' ');

  const generosContainer = document.createElement('div');
  generosContainer.className = 'card-generos';
  
  if (livro.generos && livro.generos.length > 0) {
    livro.generos.slice(0, 3).forEach(genero => {
      const generoTag = document.createElement('span');
      generoTag.className = 'genero-tag';
      generoTag.textContent = genero;
      generosContainer.appendChild(generoTag);
    });
  } else {
    const generoTag = document.createElement('span');
    generoTag.className = 'genero-tag';
    generoTag.textContent = 'Sem gênero';
    generosContainer.appendChild(generoTag);
  }

  const button = document.createElement('button');
  button.className = "more";
  button.textContent = 'Ver mais';
  button.addEventListener('click', () => {
    window.location.href = `/pages/livro/livroPagina.html?id=${livro.id}`;
  });

  card.appendChild(thumb);
  card.appendChild(meta);
  card.appendChild(title);
  card.appendChild(generosContainer);
  card.appendChild(button);

  return card;
}

function createUserCard(usuario: Usuario) {
  const card = document.createElement('div');
  card.className = 'card user-card';
  card.style.cursor = 'pointer';
  
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'user-avatar-container';
  
  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  
  if (usuario.avatar_url) {
    const { data } = supabase.storage
      .from('userProfiles')
      .getPublicUrl(usuario.avatar_url);
    avatar.src = data.publicUrl;
  } else {
    avatar.src = '../../images/defaulticon.jpg';
  }
  avatar.alt = usuario.name || usuario.username;
  
  avatarContainer.appendChild(avatar);

  const userBadge = document.createElement('div');
  userBadge.className = 'user-badge';
  userBadge.textContent = 'PERFIL';

  const userName = document.createElement('h3');
  userName.className = 'user-name';
  userName.textContent = usuario.name || usuario.username;

  const userUsername = document.createElement('p');
  userUsername.className = 'user-username';
  userUsername.textContent = `@${usuario.username}`;

  const userBio = document.createElement('p');
  userBio.className = 'user-bio';
  userBio.textContent = usuario.bio || 'Sem biografia';

  const button = document.createElement('button');
  button.className = "more";
  button.textContent = 'Ver loja';
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `/pages/loja/perfil.html?id=${usuario.id}`;
  });

  card.addEventListener('click', () => {
    window.location.href = `/pages/loja/perfil.html?id=${usuario.id}`;
  });

  card.appendChild(userBadge);
  card.appendChild(avatarContainer);
  card.appendChild(userName);
  card.appendChild(userUsername);
  card.appendChild(userBio);
  card.appendChild(button);

  return card;
}

function createSearchTypeToggle(currentType: SearchType, onTypeChange: (type: SearchType) => void) {
  const container = document.createElement('div');
  container.className = 'search-type-toggle';
  container.style.cssText = `
    display: flex;
    gap: 10px;
    margin: 20px 0;
    justify-content: center;
  `;

  const types: { type: SearchType; label: string;}[] = [
    { type: 'books', label: 'Livros' },
    { type: 'users', label: 'Perfis' }
  ];

  types.forEach(({ type, label }) => {
    const button = document.createElement('button');
    button.className = 'search-type-btn';
    button.textContent = label;
    button.style.cssText = `
      padding: 10px 20px;
      border: 2px solid #ddd;
      border-radius: 20px;
      background: ${currentType === type ? '#393a3aff' : '#fff'};
      color: ${currentType === type ? '#fff' : '#333'};
      cursor: pointer;
      font-weight: ${currentType === type ? 'bold' : 'normal'};
      transition: all 0.3s ease;
    `;

    button.addEventListener('click', () => {
      onTypeChange(type);
    });

    button.addEventListener('mouseenter', () => {
      if (currentType !== type) {
        button.style.background = '#f0f0f0';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (currentType !== type) {
        button.style.background = '#fff';
      }
    });

    container.appendChild(button);
  });

  return container;
}

function showNoResults(container: HTMLElement, query?: string, searchType?: SearchType) {
  container.innerHTML = '';
  const msg = document.createElement('div');
  msg.className = 'tooltip-box';
  
  let message = 'Nenhum resultado encontrado.';
  if (query) {
    if (searchType === 'books') {
      message = `Nenhum livro encontrado para "${query}".`;
    } else if (searchType === 'users') {
      message = `Nenhum perfil encontrado para "${query}".`;
    } else {
      message = `Nenhum resultado encontrado para "${query}".`;
    }
  }
  
  msg.textContent = message;
  container.appendChild(msg);
}

let currentSearchType: SearchType = 'all';

async function renderBooks(query?: string, searchType: SearchType = currentSearchType) {
  const container = document.getElementById('cards-grid');
  const contentArea = document.querySelector('.content-area');
  if (!container) return;
  
  container.innerHTML = '';

  const existingToggle = document.querySelector('.search-type-toggle');
  if (existingToggle) {
    existingToggle.remove();
  }

  if (query && query.trim() !== '' && contentArea) {
    const toggleContainer = createSearchTypeToggle(searchType, (newType) => {
      currentSearchType = newType;
      renderBooks(query, newType);
    });
    contentArea.insertBefore(toggleContainer, container);
  } else {
    currentSearchType = 'books';
  }

  let books: Livro[] = [];
  let users: Usuario[] = [];

  if (searchType === 'all' || searchType === 'books') {
    books = await fetchBooks(query);
  }

  if (searchType === 'all' || searchType === 'users') {
    users = await fetchUsers(query);
  }

  const hasBooks = books && Array.isArray(books) && books.length > 0;
  const hasUsers = users && Array.isArray(users) && users.length > 0;

  if (!hasBooks && !hasUsers) {
    if (query && query.trim() !== '') {
      showNoResults(container, query, searchType);
    }
    return;
  }

  if (hasUsers && (searchType === 'all' || searchType === 'users')) {
    const usersSection = document.createElement('div');
    usersSection.className = 'users-section';
    
    const usersTitle = document.createElement('h2');
    usersTitle.className = 'section-title';
    usersTitle.textContent = searchType === 'users' ? 'Perfis' : 'Perfis Encontrados';
    usersSection.appendChild(usersTitle);

    const usersGrid = document.createElement('div');
    usersGrid.className = 'users-grid';
    
    users.forEach(usuario => {
      usersGrid.appendChild(createUserCard(usuario));
    });

    usersSection.appendChild(usersGrid);
    container.appendChild(usersSection);
  }

  if (hasBooks && (searchType === 'all' || searchType === 'books')) {
    const booksSection = document.createElement('div');
    booksSection.className = 'books-section';
    
    const booksTitle = document.createElement('h2');;
    booksTitle.className = 'section-title';
    booksTitle.textContent = searchType === 'books' ? 'Livros' : 'Livros Encontrados';
    booksSection.appendChild(booksTitle);

    const booksGrid = document.createElement('div');
    booksGrid.className = 'books-grid';
    
    books.forEach(livro => {
      booksGrid.appendChild(createBookCard(livro));
    });

    booksSection.appendChild(booksGrid);
    container.appendChild(booksSection);
  }
}

function setupSearchHandlers() {
  const input = document.getElementById('popup-input') as HTMLInputElement | null;
  const searchBtn = document.querySelector('.top-nav .btn');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        renderBooks(q !== '' ? q : undefined, currentSearchType);
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
      renderBooks(q !== '' ? q : undefined, currentSearchType);
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
          setTimeout(() => renderBooks(q, currentSearchType), 100);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBooks();
  setupSearchHandlers();
});
