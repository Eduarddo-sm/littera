import { supabase } from './supabase';

type Proposta = {
  id: string;
  anuncio_id: string;
  interessado_id: string;
  anunciante_id: string;
  mensagem: string | null;
  valor_oferecido: number | null;
  imagens: string[] | null;
  status: 'pendente' | 'aceita' | 'recusada';
  created_at: string;
  anuncio_titulo?: string;
  interessado_username?: string;
  interessado_name?: string;
};

async function fetchPropostasRecebidas(): Promise<Proposta[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Usuário não autenticado');
      return [];
    }

    const { data, error } = await supabase
      .from('propostas')
      .select(`
        id,
        anuncio_id,
        interessado_id,
        anunciante_id,
        mensagem,
        valor_oferecido,
        imagens,
        status,
        created_at,
        anuncios:anuncio_id (titulo),
        profiles:interessado_id (username, name)
      `)
      .eq('anunciante_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar propostas:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      anuncio_id: p.anuncio_id,
      interessado_id: p.interessado_id,
      anunciante_id: p.anunciante_id,
      mensagem: p.mensagem,
      valor_oferecido: p.valor_oferecido,
      imagens: p.imagens,
      status: p.status,
      created_at: p.created_at,
      anuncio_titulo: p.anuncios?.titulo || 'Anúncio não encontrado',
      interessado_username: p.profiles?.username || p.profiles?.name || 'Usuário desconhecido'
    }));
  } catch (err) {
    console.error('Erro inesperado ao buscar propostas:', err);
    return [];
  }
}

function createPropostaCard(proposta: Proposta): HTMLElement {
  const card = document.createElement('div');
  card.className = `proposta-card ${proposta.status}`;

  const header = document.createElement('div');
  header.className = 'proposta-header';

  const titulo = document.createElement('div');
  titulo.className = 'proposta-titulo';
  titulo.textContent = proposta.anuncio_titulo || 'Sem título';

  const statusBadge = document.createElement('span');
  statusBadge.className = `proposta-status ${proposta.status}`;
  statusBadge.textContent = proposta.status;

  header.appendChild(titulo);
  header.appendChild(statusBadge);

  const info = document.createElement('div');
  info.className = 'proposta-info';
  info.textContent = `De: ${proposta.interessado_username}`;

  const valor = document.createElement('div');
  valor.className = 'proposta-valor';
  valor.textContent = proposta.valor_oferecido 
    ? `R$ ${proposta.valor_oferecido.toFixed(2)}` 
    : 'Sem valor definido';

  card.appendChild(header);
  card.appendChild(info);
  card.appendChild(valor);


  card.addEventListener('click', () => openPropostaModal(proposta));

  return card;
}

function openPropostaModal(proposta: Proposta) {
  const modal = document.getElementById('proposta-modal');
  const modalBody = document.getElementById('modal-body');
  
  if (!modal || !modalBody) return;

  modalBody.innerHTML = '';


  const infoAnuncio = document.createElement('div');
  infoAnuncio.className = 'modal-proposta-info';
  infoAnuncio.innerHTML = `<strong>Anúncio:</strong> ${proposta.anuncio_titulo}`;
  modalBody.appendChild(infoAnuncio);

  const infoInteressado = document.createElement('div');
  infoInteressado.className = 'modal-proposta-info';
  infoInteressado.innerHTML = `<strong>Interessado:</strong> ${proposta.interessado_username}`;
  modalBody.appendChild(infoInteressado);

  const infoValor = document.createElement('div');
  infoValor.className = 'modal-proposta-info';
  infoValor.innerHTML = `<strong>Valor Oferecido:</strong> ${
    proposta.valor_oferecido ? `R$ ${proposta.valor_oferecido.toFixed(2)}` : 'Não informado'
  }`;
  modalBody.appendChild(infoValor);

  const infoMensagem = document.createElement('div');
  infoMensagem.className = 'modal-proposta-info';
  infoMensagem.innerHTML = `<strong>Mensagem:</strong><br>${proposta.mensagem || 'Sem mensagem'}`;
  modalBody.appendChild(infoMensagem);

  const infoStatus = document.createElement('div');
  infoStatus.className = 'modal-proposta-info';
  infoStatus.innerHTML = `<strong>Status:</strong> <span class="proposta-status ${proposta.status}">${proposta.status}</span>`;
  modalBody.appendChild(infoStatus);


  if (proposta.imagens && proposta.imagens.length > 0) {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'modal-images';
    proposta.imagens.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Imagem da proposta';
      imgContainer.appendChild(img);
    });
    modalBody.appendChild(imgContainer);
  }


  if (proposta.status === 'pendente') {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';

    const btnAceitar = document.createElement('button');
    btnAceitar.className = 'btn-aceitar';
    btnAceitar.textContent = 'Aceitar';
    btnAceitar.addEventListener('click', async () => {
      await updatePropostaStatus(proposta.id, 'aceita');
      closeModal();
      renderPropostas(); 
    });

    const btnRecusar = document.createElement('button');
    btnRecusar.className = 'btn-recusar';
    btnRecusar.textContent = 'Recusar';
    btnRecusar.addEventListener('click', async () => {
      await updatePropostaStatus(proposta.id, 'recusada');
      closeModal();
      renderPropostas(); 
    });

    actionsDiv.appendChild(btnAceitar);
    actionsDiv.appendChild(btnRecusar);
    modalBody.appendChild(actionsDiv);
  }

  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('proposta-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

async function updatePropostaStatus(propostaId: string, newStatus: 'aceita' | 'recusada') {
  try {
    const { error } = await supabase
      .from('propostas')
      .update({ status: newStatus })
      .eq('id', propostaId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar proposta. Tente novamente.');
    } else {
      alert(`Proposta ${newStatus} com sucesso!`);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
    alert('Erro inesperado. Tente novamente.');
  }
}

async function renderPropostas() {
  const propostas = await fetchPropostasRecebidas();
  const container = document.getElementById('propostas-list');
  
  if (!container) return;

  container.innerHTML = '';

  if (propostas.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Nenhuma proposta recebida.';
    empty.style.textAlign = 'center';
    empty.style.color = '#6b7280';
    container.appendChild(empty);
    return;
  }

  propostas.forEach(proposta => {
    container.appendChild(createPropostaCard(proposta));
  });
}


document.addEventListener('DOMContentLoaded', () => {
  renderPropostas();


  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }


  const modal = document.getElementById('proposta-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});
