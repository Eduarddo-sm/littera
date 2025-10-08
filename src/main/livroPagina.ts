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

    console.log('Buscando proposta com:', {
      anuncio_id: anuncioId,
      user_id: user.id
    });


    const { data, error } = await supabase
      .from('propostas')
      .select('status, created_at, anuncio_id, interessado_id, anunciante_id')
      .eq('anuncio_id', anuncioId)
      .or(`interessado_id.eq.${user.id},anunciante_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('Resultado da busca:', { data, error });

    if (error) {
      console.error('Erro ao buscar status da proposta:', error);
      return null;
    }


    if (!data || data.length === 0) {
      console.log('Nenhuma proposta encontrada para este usuário');
      return null;
    }

    console.log('Proposta encontrada:', data[0]);
    

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
    .select('id, titulo, autora, paginas, editora, sobre, imagens')
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
  if (anunciadorLink) anunciadorLink.href = `/perfil.html?id=${user.user_id}`;


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
    imagensDiv.innerHTML = '';
    livro.imagens.forEach((src: string) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = livro.titulo;
      img.className = 'livro-img';
      imagensDiv.appendChild(img);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = getBookIdFromUrl();
  console.log('ID do anúncio na URL:', id);
  
  if (!id) return;
  
  const livro = await fetchBookById(id);
  const user = await fetchUserProfile(id);
  const propostaStatus = await fetchPropostaStatus(id);
  
  console.log('Proposta Status final:', propostaStatus); // Debug
  
  renderBookInfo(livro);
  renderUserProfile(user, propostaStatus);
  
  const btnProposta = document.getElementById('btn-proposta');
  if (btnProposta) {
    btnProposta.addEventListener('click', () => {
      btnProposta
    });
  }
});
