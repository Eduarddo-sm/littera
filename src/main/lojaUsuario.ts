import { supabase } from './supabase';
import { showPopup } from './popup';

interface Anuncio {
  id: string;
  titulo: string;
  autora: string;
  imagens: string[];
  generos: string[];
  status: string;
  user_id: string;
  created_at: string; // Adicionar esta propriedade
}

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

let todosAnuncios: Anuncio[] = [];
let filtroAtual = 'todos';
let isOwnProfile = false; // Mover para escopo global

function getUserIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function carregarPerfilUsuario(userId?: string) {
  try {
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
    
      if (userError || !userData?.user) {
        showPopup('Você precisa estar logado para ver esta página', 3000, 0);
        window.location.href = '/pages/login/login.html';
        return null;
      }
      userId = userData.user.id;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      showPopup('Perfil não encontrado', 3000, 0);
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showPopup('Erro ao carregar perfil', 3000, 0);
    return null;
  }
}

async function carregarAnuncios(userId: string) {
  try {
    const { data: anuncios, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anúncios:', error);
      showPopup('Erro ao carregar anúncios', 3000, 0);
      return [];
    }

    return anuncios as Anuncio[];
  } catch (error) {
    console.error('Erro ao carregar anúncios:', error);
    return [];
  }
}

function renderizarPerfil(profile: Profile) {
  const userAvatar = document.getElementById('user-avatar') as HTMLImageElement;
  const userName = document.getElementById('user-name');
  const userUsername = document.getElementById('user-username');
  const userBio = document.getElementById('user-bio');

  if (userAvatar) {
    if (profile.avatar_url) {
      const { data } = supabase.storage
        .from('userProfiles')
        .getPublicUrl(profile.avatar_url);
      
      userAvatar.src = data.publicUrl;
      userAvatar.style.objectFit = 'cover';
    } else {
      userAvatar.src = '../../images/default-avatar.png';
    }
  }

  if (userName) {
    userName.textContent = profile.name || 'Usuário Littera';
  }

  if (userUsername) {
    userUsername.textContent = profile.username ? `${profile.username}` : '';
  }

  if (userBio) {
    userBio.textContent = profile.bio || 'Sem biografia';
  }

  const filterContainer = document.querySelector('.filter-container h2');
  if (filterContainer) {
    filterContainer.textContent = isOwnProfile 
      ? 'Minha Loja' 
      : `Loja de ${profile.name || profile.username || 'Usuário'}`;
  }
}

function atualizarEstatisticas(anuncios: Anuncio[]) {
  const totalAnuncios = document.getElementById('total-anuncios');
  const totalAbertos = document.getElementById('total-abertos');
  const totalFechados = document.getElementById('total-fechados');

  const abertos = anuncios.filter(a => a.status === 'EM ABERTO').length;
  const fechados = anuncios.filter(a => a.status === 'FECHADO').length;

  if (totalAnuncios) totalAnuncios.textContent = anuncios.length.toString();
  if (totalAbertos) totalAbertos.textContent = abertos.toString();
  if (totalFechados) totalFechados.textContent = fechados.toString();
}

function formatarData(data: string): string {
  try {
    const date = new Date(data);
    const opcoes: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', opcoes);
  } catch (error) {
    return 'Data não disponível';
  }
}

function renderizarAnuncios(anuncios: Anuncio[]) {
  const booksGrid = document.getElementById('books-grid');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');

  if (!booksGrid || !loadingState || !emptyState) {
    console.error('Elementos não encontrados no DOM');
    return;
  }

  loadingState.style.display = 'none';

  if (anuncios.length === 0) {
    emptyState.style.display = 'block';
    booksGrid.innerHTML = '';
    return;
  }

  emptyState.style.display = 'none';
  booksGrid.innerHTML = '';

  anuncios.forEach(anuncio => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.onclick = () => {
      window.location.href = `/pages/livro/livroPagina.html?id=${anuncio.id}`;
    };

    const statusClass = anuncio.status === 'EM ABERTO' ? 'aberto' : 'fechado';
    const statusText = anuncio.status === 'EM ABERTO' ? 'Em Aberto' : 'Fechado';

    const imagemPrincipal = anuncio.imagens && anuncio.imagens.length > 0 
      ? anuncio.imagens[0] 
      : '../../images/default-book.png';

    const generosTags = anuncio.generos && anuncio.generos.length > 0
      ? anuncio.generos.slice(0, 3).map(genero => 
          `<span class="genre-tag">${genero}</span>`
        ).join('')
      : '<span class="genre-tag">Sem gênero</span>';

    card.innerHTML = `
      <div class="book-status ${statusClass}">${statusText}</div>
      <img src="${imagemPrincipal}" alt="${anuncio.titulo}" class="book-image" onerror="this.src='../../images/default-book.png'">
      <div class="book-content">
        <h3 class="book-title">${anuncio.titulo}</h3>
        <p class="book-author">por ${anuncio.autora || 'Autor desconhecido'}</p>
        <div class="book-genres">
          ${generosTags}
        </div>
        <p class="book-date">Anunciado em ${formatarData(anuncio.created_at)}</p>
      </div>
    `;

    booksGrid.appendChild(card);
  });
}

function filtrarAnuncios(filtro: string) {
  filtroAtual = filtro;

  let anunciosFiltrados: Anuncio[];

  if (filtro === 'todos') {
    anunciosFiltrados = todosAnuncios;
  } else {
    anunciosFiltrados = todosAnuncios.filter(a => a.status === filtro);
  }

  renderizarAnuncios(anunciosFiltrados);
}

function inicializarFiltros() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filtro = button.getAttribute('data-filter') || 'todos';
      filtrarAnuncios(filtro);
    });
  });
}

async function inicializar() {
  
  const userIdFromUrl = getUserIdFromUrl();
  let targetUserId: string | null = null;

  if (userIdFromUrl) {
    targetUserId = userIdFromUrl;
    const { data: userData } = await supabase.auth.getUser();
    isOwnProfile = userData?.user?.id === userIdFromUrl;
  } else {
    const { data: userData, error } = await supabase.auth.getUser();
    if (userData?.user) {
      targetUserId = userData.user.id;
      isOwnProfile = true;
    } else {
      console.error('Erro ao obter usuário:', error);
      showPopup('Você precisa estar logado', 3000, 0);
      setTimeout(() => {
        window.location.href = '/pages/login/login.html';
      }, 3000);
      return;
    }
  }


  if (!targetUserId) {
    showPopup('Usuário não encontrado', 3000, 0);
    return;
  }

  // Carrega o perfil
  const profile = await carregarPerfilUsuario(targetUserId);
  if (!profile) {
    console.error('Perfil não encontrado');
    return;
  }

  renderizarPerfil(profile);

  todosAnuncios = await carregarAnuncios(targetUserId);
  
  atualizarEstatisticas(todosAnuncios);
  renderizarAnuncios(todosAnuncios);
  inicializarFiltros();
}

document.addEventListener('DOMContentLoaded', inicializar);