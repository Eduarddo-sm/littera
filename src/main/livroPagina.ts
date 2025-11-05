import { supabase } from './supabase';

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchUserProfile(id: string){
  const {data, error} = await supabase
    .from('anuncios')
    .select(`
      user_id,
      profiles(
          avatar_url,
          username
          )
      `)
      .eq('id', id)
      .single();

      if(error){
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }
      return data;
}

async function fetchPropostaStatus(anuncioId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('Usuário não autenticado');
      return null;
    }


    const { data, error } = await supabase
      .from('propostas')
      .select('status, created_at, anuncio_id, interessado_id, anunciante_id')
      .eq('anuncio_id', anuncioId)
      .or(`interessado_id.eq.${user.id},anunciante_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao buscar status da proposta:', error);
      return null;
    }


    if (!data || data.length === 0) {
      return null;
    }
    

    const proposta = data[0];
    proposta.userRole = proposta.interessado_id === user.id ? 'interessado' : 'anunciante';
    
    return proposta;
  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    return null;
  }
}

async function fetchBookById(id: string) {
  const { data, error } = await supabase
    .from('anuncios')
    .select('id, titulo, autora, paginas, editora, sobre, imagens, status')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Erro ao buscar livro:', error);
    return null;
  }
  return data;
}

function renderUserProfile(user: any, propostaStatus: any = null) {
  if (!user || !user.profiles) return;
  const anunciadorLink = document.getElementById('anunciador-link') as HTMLAnchorElement;
  const anunciadorImg = anunciadorLink?.querySelector('img') as HTMLImageElement;
  const anunciadorName = anunciadorLink?.querySelector('p') as HTMLParagraphElement;
  const statusElement = document.getElementById('proposta-status') as HTMLSpanElement;

  const profile = user.profiles;


  if (anunciadorImg) {
    if (profile?.avatar_url) {
      const { data } = supabase.storage
        .from('userProfiles')
        .getPublicUrl(profile.avatar_url);
      
      anunciadorImg.src = data.publicUrl;
      anunciadorImg.alt = profile?.username || 'Avatar do usuário';
    } else {

      anunciadorImg.src = '../../images/default-avatar.png';
      anunciadorImg.alt = 'Avatar padrão';
    }
  }
  
  if (anunciadorName) anunciadorName.textContent = profile?.username || 'Usuário';
  if (anunciadorLink) anunciadorLink.href = `../perfil/perfil.html?id=${user.user_id}`;


  if (statusElement && propostaStatus) {
    const statusTexto: Record<string, string> = {
      'pendente': propostaStatus.userRole === 'anunciante' ? 'Pendente' : 'Pendente',
      'aceita': 'Encerrado',
      'recusada': 'Encerrada'
    };

    statusElement.textContent = statusTexto[propostaStatus.status] || 'Status desconhecido';
    statusElement.className = `status-badge status-${propostaStatus.status}`;
    statusElement.style.display = 'inline-block';
  } else if (statusElement) {
    statusElement.style.display = 'none';
  }
}

let currentImageIndex = 0;
let totalImages = 0;

function renderBookInfo(livro: any) {
  if (!livro) return;
  const titulo = document.getElementById('livro-titulo');
  const autor = document.getElementById('livro-autor');
  const numeroPaginas = document.getElementById('numero-paginas');
  const editora = document.getElementById('livro-editora');
  const descricao = document.getElementById('livro-descricao');
  const imagensDiv = document.getElementById('livro-imagens');

  if (titulo) titulo.textContent = `${livro.titulo}`;
  if (descricao) descricao.textContent = `Descrição: ${livro.sobre || 'Descrição não disponível'}`;
  if (autor) autor.textContent = `Autor: ${livro.autora || 'Autor não disponível'}`;
  if (numeroPaginas) numeroPaginas.textContent = `Número de páginas: ${livro.paginas || 'N/A'}`;
  if (editora) editora.textContent = `Editora: ${livro.editora || 'Editora não disponível'}`;
  
  if (imagensDiv && livro.imagens && livro.imagens.length > 0) {
    totalImages = livro.imagens.length;
    currentImageIndex = 0;
    

    renderCurrentImage(imagensDiv, livro.imagens, livro.titulo);
    

    setupImageNavigation(imagensDiv, livro.imagens, livro.titulo);
  }
}

function renderCurrentImage(container: HTMLElement, imagens: string[], titulo: string) {
  container.innerHTML = '';
  
  if (imagens.length > 0) {
    const img = document.createElement('img');
    img.src = imagens[currentImageIndex];
    img.alt = `${titulo} - Imagem ${currentImageIndex + 1} de ${totalImages}`;
    img.className = 'livro-img';
    container.appendChild(img);
  }
}

function setupImageNavigation(container: HTMLElement, imagens: string[], titulo: string) {
  const btnPrev = document.getElementById('btn-prev-img');
  const btnNext = document.getElementById('btn-next-img');
  

  const updateButtonsVisibility = () => {
    if (btnPrev) {
      btnPrev.style.display = totalImages > 1 ? 'block' : 'none';
    }
    if (btnNext) {
      btnNext.style.display = totalImages > 1 ? 'block' : 'none';
    }
  };
  
  updateButtonsVisibility();
  
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
      renderCurrentImage(container, imagens, titulo);
    });
  }
  
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % totalImages;
      renderCurrentImage(container, imagens, titulo);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = getBookIdFromUrl();
  
  if (!id) return;
  
  const livro = await fetchBookById(id);
  const user = await fetchUserProfile(id);
  const propostaStatus = await fetchPropostaStatus(id);
  
  
  renderBookInfo(livro);
  renderUserProfile(user, propostaStatus);
  
  const btnProposta = document.getElementById('btn-proposta') as HTMLButtonElement;
  if (btnProposta && livro) {
    if (livro.status === 'FECHADO') {
      btnProposta.disabled = true;
      btnProposta.textContent = 'Anúncio Fechado';
      btnProposta.style.background = '#323232';
      btnProposta.style.cursor = 'not-allowed';
    }
  }
});
