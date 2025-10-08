import { supabase } from './supabase';

type Proposta = {
  id: string;
  anuncio_id: string;
  interessado_id: string;
  anunciante_id: string;
  mensagem: string;
  valor_oferecido: number;
  imagens: string[];
  status: 'pendente' | 'aceita' | 'recusada' | 'cancelada';
  created_at: string;
  anuncios?: {
    titulo: string;
    autora: string;
    imagens: string[];
  };
  profiles?: {
    username: string;
    avatar_url: string;
  };
};

let currentFilter = 'todas';
let currentPropostaId: string | null = null;
let allPropostas: Proposta[] = [];


async function fetchMinhasPropostas() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return [];
    }

    const { data, error } = await supabase
      .from('propostas')
      .select(`
        *,
        anuncios (
          titulo,
          autora,
          imagens
        ),
        profiles!propostas_anunciante_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('interessado_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar propostas:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Erro inesperado:', err);
    return [];
  }
}


function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}


function createPropostaCard(proposta: Proposta): HTMLElement {
  const card = document.createElement('div');
  card.className = `proposta-card ${proposta.status === 'cancelada' ? 'cancelada' : ''}`;
  card.dataset.status = proposta.status;

  const statusClass = `status-${proposta.status}`;
  const statusTexto = {
    'pendente': 'Pendente',
    'aceita': 'Aceita',
    'recusada': 'Recusada',
    'cancelada': 'Cancelada'
  }[proposta.status] || proposta.status;

  const anuncioTitulo = proposta.anuncios?.titulo || 'Anúncio removido';
  const primeiraImagem = proposta.imagens && proposta.imagens.length > 0 
    ? proposta.imagens[0] 
    : (proposta.anuncios?.imagens && proposta.anuncios.imagens.length > 0 
        ? proposta.anuncios.imagens[0] 
        : '');

  card.innerHTML = `
    <div class="proposta-header">
      <div>
        <h3 class="proposta-titulo">${anuncioTitulo}</h3>
        <p class="proposta-anuncio">${proposta.anuncios?.autora || ''}</p>
      </div>
      <span class="status-badge ${statusClass}">${statusTexto}</span>
    </div>
    
    <div class="proposta-info">
      <p class="proposta-mensagem">${proposta.mensagem || 'Sem mensagem'}</p>
      <div class="proposta-valor">${formatCurrency(proposta.valor_oferecido)}</div>
      ${primeiraImagem ? `<img src="${primeiraImagem}" alt="Imagem da proposta" class="proposta-imagem" />` : ''}
      <p class="proposta-data">Enviada em ${formatDate(proposta.created_at)}</p>
    </div>

    <div class="proposta-actions">
      <button class="btn btn-details" data-id="${proposta.id}">Ver Detalhes</button>
      ${proposta.status === 'pendente' 
        ? `<button class="btn btn-cancel" data-id="${proposta.id}">Cancelar</button>` 
        : ''}
    </div>
  `;

  return card;
}


function renderPropostas(propostas: Proposta[]) {
  const container = document.getElementById('propostas-container');
  if (!container) return;

  container.innerHTML = '';

  if (propostas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma proposta encontrada</h3>
        <p>Você ainda não enviou nenhuma proposta${currentFilter !== 'todas' ? ' com este status' : ''}.</p>
      </div>
    `;
    return;
  }

  propostas.forEach(proposta => {
    container.appendChild(createPropostaCard(proposta));
  });


  setupCardListeners();
}


function filterPropostas(filter: string) {
  currentFilter = filter;
  
  let filtered = allPropostas;
  if (filter !== 'todas') {
    filtered = allPropostas.filter(p => p.status === filter);
  }

  renderPropostas(filtered);


  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    }
  });
}


async function cancelarProposta(propostaId: string) {
  try {
    const { error } = await supabase
      .from('propostas')
      .update({ status: 'cancelada' })
      .eq('id', propostaId);

    if (error) {
      console.error('Erro ao cancelar proposta:', error);
      alert('Erro ao cancelar proposta. Tente novamente.');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro inesperado:', err);
    alert('Erro ao cancelar proposta. Tente novamente.');
    return false;
  }
}


function showPropostaDetails(propostaId: string) {
  const proposta = allPropostas.find(p => p.id === propostaId);
  if (!proposta) return;

  const modal = document.getElementById('details-modal');
  const detailsBody = document.getElementById('details-body');
  
  if (!modal || !detailsBody) return;

  const statusTexto = {
    'pendente': 'Pendente',
    'aceita': 'Aceita',
    'recusada': 'Recusada',
    'cancelada': 'Cancelada'
  }[proposta.status] || proposta.status;

  const statusClass = `status-${proposta.status}`;

  let imagesHtml = '';
  if (proposta.imagens && proposta.imagens.length > 0) {
    imagesHtml = `
      <div class="detail-row">
        <div class="detail-label">Imagens Enviadas:</div>
        <div class="detail-images">
          ${proposta.imagens.map(img => `<img src="${img}" alt="Imagem da proposta" class="detail-image" />`).join('')}
        </div>
      </div>
    `;
  }

  detailsBody.innerHTML = `
    <div class="detail-row">
      <div class="detail-label">Anúncio:</div>
      <div class="detail-value">${proposta.anuncios?.titulo || 'Anúncio removido'}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Autor do Livro:</div>
      <div class="detail-value">${proposta.anuncios?.autora || 'N/A'}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Status:</div>
      <div class="detail-value">
        <span class="status-badge ${statusClass}">${statusTexto}</span>
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Valor Oferecido:</div>
      <div class="detail-value" style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">
        ${formatCurrency(proposta.valor_oferecido)}
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Mensagem:</div>
      <div class="detail-value">${proposta.mensagem || 'Sem mensagem'}</div>
    </div>

    ${imagesHtml}

    <div class="detail-row">
      <div class="detail-label">Data de Envio:</div>
      <div class="detail-value">${formatDate(proposta.created_at)}</div>
    </div>
  `;

  modal.classList.add('active');
}

// Setup event listeners
function setupCardListeners() {
  // Botões de ver detalhes
  document.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const propostaId = (btn as HTMLElement).dataset.id;
      if (propostaId) showPropostaDetails(propostaId);
    });
  });

  // Botões de cancelar
  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const propostaId = (btn as HTMLElement).dataset.id;
      if (propostaId) {
        currentPropostaId = propostaId;
        const modal = document.getElementById('cancel-modal');
        if (modal) modal.classList.add('active');
      }
    });
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  // Buscar propostas
  allPropostas = await fetchMinhasPropostas() as Proposta[];
  renderPropostas(allPropostas);

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter) filterPropostas(filter);
    });
  });

  // Modal de cancelamento
  const cancelModal = document.getElementById('cancel-modal');
  const confirmCancel = document.getElementById('confirm-cancel');
  const cancelCancel = document.getElementById('cancel-cancel');

  if (confirmCancel) {
    confirmCancel.addEventListener('click', async () => {
      if (currentPropostaId) {
        const success = await cancelarProposta(currentPropostaId);
        if (success) {
          // Atualizar lista
          allPropostas = await fetchMinhasPropostas() as Proposta[];
          filterPropostas(currentFilter);
          
          if (cancelModal) cancelModal.classList.remove('active');
          currentPropostaId = null;
        }
      }
    });
  }

  if (cancelCancel) {
    cancelCancel.addEventListener('click', () => {
      if (cancelModal) cancelModal.classList.remove('active');
      currentPropostaId = null;
    });
  }

  // Fechar modais
  document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });

  // Fechar modal ao clicar fora
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
});
