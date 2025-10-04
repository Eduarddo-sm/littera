import { supabase } from './supabase';

const form = document.getElementById('form-cadastrar-livro') as HTMLFormElement | null;

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
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = (document.getElementById('titulo') as HTMLInputElement).value;
    const autora = (document.getElementById('autora') as HTMLInputElement).value;
    const paginas = parseInt((document.getElementById('paginas') as HTMLInputElement).value, 10);
    const editora = (document.getElementById('editora') as HTMLInputElement).value;
    const imagensInput = document.getElementById('imagem') as HTMLInputElement;
    const files = imagensInput.files;
    if (!files || files.length === 0) {
      alert('Selecione pelo menos uma imagem.');
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
    } catch (err: any) {
      alert('Erro inesperado ao cadastrar livro: ' + err.message);
      console.error('Erro inesperado:', err);
    }
  });
}
