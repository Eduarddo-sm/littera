import { supabase } from './supabase';

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchBookById(id: string) {
  const { data, error } = await supabase
    .from('anuncios')
    .select('id, titulo, sobre, imagens')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Erro ao buscar livro:', error);
    return null;
  }
  return data;
}

function renderBookInfo(livro: any) {
  if (!livro) return;
  const titulo = document.getElementById('livro-titulo');
  const descricao = document.getElementById('livro-descricao');
  const imagensDiv = document.getElementById('livro-imagens');

  if (titulo) titulo.textContent = livro.titulo;
  if (descricao) descricao.textContent = livro.sobre;
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
  if (!id) return;
  const livro = await fetchBookById(id);
  renderBookInfo(livro);
  const btnProposta = document.getElementById('btn-proposta');
  if (btnProposta) {
    btnProposta.addEventListener('click', () => {
      alert('Proposta enviada!');
    });
  }
});
