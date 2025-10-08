import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PropostaData {
  anuncio_id: string;
  interessado_id: string;
  anunciante_id: string;
  mensagem: string;
  valor_oferecido: number;
  imagens?: string[];
}

async function uploadImagem(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`; 

    const { data, error } = await supabase.storage
      .from('proposta') 
      .upload(filePath, file);

    if (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('proposta') 
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return null;
  }
}

async function enviarProposta(propostaData: PropostaData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('propostas')
      .insert([propostaData]);

    if (error) {
      console.error('Erro ao enviar proposta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    return false;
  }
}

function initPropostaModal() {
  const modal = document.getElementById('proposta-modal') as HTMLElement;
  const btnProposta = document.getElementById('btn-proposta') as HTMLButtonElement;
  const closeBtn = document.getElementById('close-modal') as HTMLElement;
  const form = document.getElementById('proposta-form') as HTMLFormElement;

  if (!modal || !btnProposta || !closeBtn || !form) {
    console.error('Elementos do modal não encontrados');
    return;
  }


  btnProposta.addEventListener('click', () => {
    modal.style.display = 'flex';
  });


  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
  });


  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      form.reset();
    }
  });


  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
     
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para enviar uma proposta');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Proposta';
        return;
      }


      const urlParams = new URLSearchParams(window.location.search);
      const anuncioId = urlParams.get('id');

      if (!anuncioId) {
        alert('ID do anúncio não encontrado');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Proposta';
        return;
      }


      const { data: anuncio } = await supabase
        .from('anuncios')
        .select('user_id')
        .eq('id', anuncioId)
        .single();

      if (!anuncio) {
        alert('Anúncio não encontrado');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Proposta';
        return;
      }


      const imagemInput = document.getElementById('imagem') as HTMLInputElement;
      let imagemUrl: string | null = null;

      if (imagemInput.files && imagemInput.files[0]) {
        imagemUrl = await uploadImagem(imagemInput.files[0]);
        
        if (!imagemUrl) {
          alert('Erro ao fazer upload da imagem. Tente novamente.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Proposta';
          return;
        }
      }


      const propostaData: PropostaData = {
        anuncio_id: anuncioId,
        interessado_id: user.id,
        anunciante_id: anuncio.user_id,
        mensagem: (document.getElementById('mensagem') as HTMLTextAreaElement).value,
        valor_oferecido: parseFloat((document.getElementById('valor_oferecido') as HTMLInputElement).value),
        imagens: imagemUrl ? [imagemUrl] : undefined
      };


      const sucesso = await enviarProposta(propostaData);

      if (sucesso) {
        alert('Proposta enviada com sucesso!');
        modal.style.display = 'none';
        form.reset();
      } else {
        alert('Erro ao enviar proposta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar proposta:', error);
      alert('Erro ao enviar proposta. Tente novamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Proposta';
    }
  });
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPropostaModal);
} else {
  initPropostaModal();
}