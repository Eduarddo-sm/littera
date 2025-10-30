import { supabase } from './supabase';
import { showPopup } from './popup';

const form = document.getElementById('form-cadastrar-livro') as HTMLFormElement | null;

let selectedFiles: File[] = [];
let selectedGeneros: string[] = [];

function renderImagePreviews() {
  const previewContainer = document.getElementById('image-preview');
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'image-preview-item';
      
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'image-preview-remove';
      removeBtn.innerHTML = '×';
      removeBtn.type = 'button';
      removeBtn.style = `
            width: 30%;
            background: #737373;
            border: none;
            color: #ffffff;
      `
      removeBtn.onclick = () => {
        selectedFiles.splice(index, 1);
        renderImagePreviews();
        updateFileInput();
      };
      
      div.appendChild(img);
      div.appendChild(removeBtn);
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function renderGenerosTags() {
  const tagsContainer = document.getElementById('generos-tags');
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  selectedGeneros.forEach((genero, index) => {
    const tag = document.createElement('div');
    tag.className = 'genero-tag';
    
    const text = document.createElement('span');
    text.textContent = genero;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'genero-tag-remove';
    removeBtn.innerHTML = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => {
      selectedGeneros.splice(index, 1);
      renderGenerosTags();
    };
    
    tag.appendChild(text);
    tag.appendChild(removeBtn);
    tagsContainer.appendChild(tag);
  });
}

function updateFileInput() {
  const imagensInput = document.getElementById('imagem') as HTMLInputElement;
  if (!imagensInput) return;
  
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => dataTransfer.items.add(file));
  imagensInput.files = dataTransfer.files;
}

async function uploadImages(files: FileList): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < Math.min(files.length, 5); i++) {
    const file = files[i];
    const fileExt = file.name.split('.').pop();
    const fileName = `public/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('livros')
      .upload(fileName, file);
    
    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
    
    if (!data) {
      console.error('Upload retornou sem dados');
      throw new Error('Falha no upload da imagem');
    }
    
    const { data: publicData } = supabase.storage
      .from('livros')
      .getPublicUrl(fileName);
    
    if (publicData?.publicUrl) {
      urls.push(publicData.publicUrl);
    } else {
      console.error('Não foi possível obter URL pública');
      throw new Error('Falha ao obter URL da imagem');
    }
  }
  
  return urls;
}

if (form) {
  const imagensInput = document.getElementById('imagem') as HTMLInputElement;
  const generoInput = document.getElementById('genero-input') as HTMLInputElement;
  
  if (generoInput) {
    generoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const genero = generoInput.value.trim();
        
        if (genero === '') return;
        
        if (selectedGeneros.length >= 10) {
          showPopup('Você pode adicionar no máximo 10 gêneros.', 3000, 0);
          return;
        }
        
        if (selectedGeneros.includes(genero)) {
          showPopup('Este gênero já foi adicionado.', 3000, 0);
          return;
        }
        
        selectedGeneros.push(genero);
        renderGenerosTags();
        generoInput.value = '';
      }
    });
  }
  
  if (imagensInput) {
    imagensInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      
      if (files.length > 5) {
        showPopup('Você pode selecionar no máximo 5 imagens.', 3000, 0);
        imagensInput.value = '';
        selectedFiles = [];
        renderImagePreviews();
        return;
      }
      
      selectedFiles = Array.from(files);
      renderImagePreviews();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = (document.getElementById('titulo') as HTMLInputElement).value;
    const autora = (document.getElementById('autora') as HTMLInputElement).value;
    const paginas = parseInt((document.getElementById('paginas') as HTMLInputElement).value, 10);
    const editora = (document.getElementById('editora') as HTMLInputElement).value;
    const sobre = (document.getElementById('sobre') as HTMLTextAreaElement).value;
    const imagensInput = document.getElementById('imagem') as HTMLInputElement;
    const files = imagensInput.files;
    
    if (!files || files.length === 0) {
      showPopup('Selecione pelo menos uma imagem.', 3000, 0);
      return;
    }
    
    if (files.length > 5) {
      showPopup('Você pode enviar no máximo 5 imagens.', 3000, 0);
      return;
    }
    
    if (selectedGeneros.length === 0) {
      showPopup('Adicione pelo menos um gênero literário.', 3000, 0);
      return;
    }
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        showPopup('Usuário não autenticado.', 3000, 0);
        console.error('Erro de autenticação:', userError);
        return;
      }
      
      const user_id = userData.user.id;
      let imagens: string[] = [];
      
      try {
        imagens = await uploadImages(files);
      } catch (uploadErr: any) {
        showPopup('Erro ao fazer upload das imagens. Tente novamente.', 3000, 0);
        console.error('Erro upload imagens:', uploadErr);
        return;
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('anuncios')
        .insert([
          {
            user_id,
            titulo,
            autora,
            paginas,
            editora,
            sobre,
            imagens,
            generos: selectedGeneros,
          },
        ]);
      
      if (insertError) {
        showPopup('Erro ao inserir no banco.', 3000, 0);
        console.error('Erro insert:', insertError);
        return;
      }
      
      console.log('Insert data:', insertData);
      showPopup('Livro cadastrado com sucesso!', 3000, 1);
      form.reset();
      selectedFiles = [];
      selectedGeneros = [];
      renderImagePreviews();
      renderGenerosTags();
      
      const modal = document.getElementById('add-book-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
      
      window.location.reload();
      
    } catch (err: any) {
      showPopup('Erro inesperado ao cadastrar livro.', 3000, 0);
      console.error('Erro inesperado:', err);
    }
  });
}
