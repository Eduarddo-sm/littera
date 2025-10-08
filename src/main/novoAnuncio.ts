import { supabase } from './supabase';

const form = document.getElementById('form-cadastrar-livro') as HTMLFormElement | null;

let selectedFiles: File[] = [];

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
    if (error) throw error;
  const { data: publicData } = supabase.storage.from('livros').getPublicUrl(fileName);
  urls.push(publicData.publicUrl);
  }
  return urls;
}

if (form) {

  const imagensInput = document.getElementById('imagem') as HTMLInputElement;
  
  if (imagensInput) {
    imagensInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      
      if (files.length > 5) {
        alert('Você pode selecionar no máximo 5 imagens.');
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
      alert('Selecione pelo menos uma imagem.');
      return;
    }
    
    if (files.length > 5) {
      alert('Você pode enviar no máximo 5 imagens.');
      return;
    }
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        alert('Usuário não autenticado.');
        console.error('Erro de autenticação:', userError);
        return;
      }
      const user_id = userData.user.id;
      let imagens: string[] = [];
      try {
        imagens = await uploadImages(files);
      } catch (uploadErr: any) {
        alert('Erro ao fazer upload das imagens: ' + uploadErr.message);
        console.error('Erro upload imagens:', uploadErr);
        return;
      }
      const { data: insertData, error: insertError } = await supabase.from('anuncios').insert([
        {
          user_id,
          titulo,
          autora,
          paginas,
          editora,
          sobre,
          imagens,
          
        },
      ]);
      if (insertError) {
        alert('Erro ao inserir no banco: ' + insertError.message);
        console.error('Erro insert:', insertError);
        return;
      }
      console.log('Insert data:', insertData);
      alert('Livro cadastrado com sucesso!');
      form.reset();
      selectedFiles = [];
      renderImagePreviews();
    } catch (err: any) {
      alert('Erro inesperado ao cadastrar livro: ' + err.message);
      console.error('Erro inesperado:', err);
    }
  });
}
