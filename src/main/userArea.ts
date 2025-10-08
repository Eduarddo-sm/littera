import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

let currentUser: UserProfile | null = null;
let selectedAvatarFile: File | null = null;

// Elementos do DOM
const viewMode = document.getElementById('view-mode') as HTMLElement;
const editMode = document.getElementById('edit-mode') as HTMLElement;
const editProfileBtn = document.getElementById('edit-profile-btn') as HTMLButtonElement;
const cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
const editForm = document.getElementById('edit-profile-form') as HTMLFormElement;
const avatarInput = document.getElementById('edit-avatar') as HTMLInputElement;
const avatarPreview = document.getElementById('avatar-preview') as HTMLElement;

// Carregar perfil do usuário
async function loadUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = '/src/pages/login/login.html';
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    currentUser = profile;
    displayUserProfile(profile);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    alert('Erro ao carregar perfil do usuário');
  }
}

// Exibir perfil no modo visualização
function displayUserProfile(profile: UserProfile) {
  // Atualizar elementos de visualização
  const userNameEl = document.getElementById('user-name') as HTMLElement;
  const userFullnameEl = document.getElementById('user-fullname') as HTMLElement;
  const userEmailEl = document.getElementById('user-email') as HTMLElement;
  const userPhoneEl = document.getElementById('user-phone') as HTMLElement;
  const userBioEl = document.getElementById('user-bio') as HTMLElement;
  const userAvatarEl = document.getElementById('user-avatar') as HTMLElement;

  userNameEl.textContent = profile.username || 'Username';
  userFullnameEl.textContent = profile.name || 'Nome não informado';
  userEmailEl.textContent = profile.email || 'Email não informado';
  userPhoneEl.textContent = profile.phone || 'Telefone não informado';
  
  // Carregar avatar se existir
  if (profile.avatar_url) {
    const avatarUrl = supabase.storage.from('userProfiles').getPublicUrl(profile.avatar_url).data.publicUrl;
    userAvatarEl.style.backgroundImage = `url(${avatarUrl})`;
  }

  // Preencher formulário de edição
  (document.getElementById('edit-username') as HTMLInputElement).value = profile.username || '';
  (document.getElementById('edit-fullname') as HTMLInputElement).value = profile.name || '';
  (document.getElementById('edit-email') as HTMLInputElement).value = profile.email || '';
  (document.getElementById('edit-phone') as HTMLInputElement).value = profile.phone || '';
  
  if (profile.avatar_url) {
    const avatarUrl = supabase.storage.from('userProfiles').getPublicUrl(profile.avatar_url).data.publicUrl;
    avatarPreview.style.backgroundImage = `url(${avatarUrl})`;
  }
}

// Preview do avatar selecionado
avatarInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    // Validar tipo de arquivo
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Por favor, selecione uma imagem JPG ou PNG');
      avatarInput.value = '';
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      avatarInput.value = '';
      return;
    }

    selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.style.backgroundImage = `url(${e.target?.result})`;
    };
    reader.readAsDataURL(file);
  }
});

// Alternar para modo de edição
editProfileBtn.addEventListener('click', () => {
  viewMode.style.display = 'none';
  editMode.style.display = 'block';
});

// Cancelar edição
cancelEditBtn.addEventListener('click', () => {
  editMode.style.display = 'none';
  viewMode.style.display = 'block';
  selectedAvatarFile = null;
  if (currentUser) {
    displayUserProfile(currentUser);
  }
});

// Salvar alterações
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) return;

  const submitBtn = editForm.querySelector('button[type="submit"]') as HTMLButtonElement;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';

  try {
    let avatarUrl = currentUser.avatar_url;

    // Upload do avatar se foi selecionado
    if (selectedAvatarFile) {
      // Deletar avatar antigo se existir
      if (currentUser.avatar_url) {
        await supabase.storage
          .from('userProfiles')
          .remove([currentUser.avatar_url]);
      }

      // Upload do novo avatar
      const fileExt = selectedAvatarFile.name.split('.').pop();
      const fileName = `public/${currentUser.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('userProfiles')
        .upload(fileName, selectedAvatarFile);

      if (uploadError) throw uploadError;

      avatarUrl = fileName;
    }

    // Atualizar perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: (document.getElementById('edit-username') as HTMLInputElement).value,
        name: (document.getElementById('edit-fullname') as HTMLInputElement).value,
        phone: (document.getElementById('edit-phone') as HTMLInputElement).value,
        avatar_url: avatarUrl
      })
      .eq('id', currentUser.id);

    if (updateError) throw updateError;

    alert('Perfil atualizado com sucesso!');
    
    // Recarregar perfil
    await loadUserProfile();
    
    // Voltar ao modo visualização
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
    selectedAvatarFile = null;

  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    alert('Erro ao salvar alterações. Tente novamente.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Salvar Alterações';
  }
});

// Inicializar
loadUserProfile();