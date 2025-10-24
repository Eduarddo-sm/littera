
import { supabase } from './supabase';
import { showPopup } from './popup';
  

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
}

let currentUser: UserProfile | null = null;
let selectedAvatarFile: File | null = null;


const viewMode = document.getElementById('view-mode') as HTMLElement;
const editMode = document.getElementById('edit-mode') as HTMLElement;
const editProfileBtn = document.getElementById('edit-profile-btn') as HTMLButtonElement;
const cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
const editForm = document.getElementById('edit-profile-form') as HTMLFormElement;
const avatarInput = document.getElementById('edit-avatar') as HTMLInputElement;
const avatarPreview = document.getElementById('avatar-preview') as HTMLElement;
const bioInput = document.getElementById('edit-bio') as HTMLTextAreaElement;


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
    showPopup('Erro ao carregar perfil do usuário', 3000, 0);
  }
}


function displayUserProfile(profile: UserProfile) {

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
  
  
  if (profile.avatar_url) {
    const avatarUrl = supabase.storage.from('userProfiles').getPublicUrl(profile.avatar_url).data.publicUrl;
    userAvatarEl.style.backgroundImage = `url(${avatarUrl})`;
  }


  (document.getElementById('edit-username') as HTMLInputElement).value = profile.username || '';
  (document.getElementById('edit-fullname') as HTMLInputElement).value = profile.name || '';
  (document.getElementById('edit-email') as HTMLInputElement).value = profile.email || '';
  (document.getElementById('edit-phone') as HTMLInputElement).value = profile.phone || '';
  
  if (profile.avatar_url) {
    const avatarUrl = supabase.storage.from('userProfiles').getPublicUrl(profile.avatar_url).data.publicUrl;
    avatarPreview.style.backgroundImage = `url(${avatarUrl})`;
  }
}


avatarInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      showPopup('Por favor, selecione uma imagem JPG ou PNG', 3000, 0);
      avatarInput.value = '';
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      showPopup('A imagem deve ter no máximo 5MB', 3000, 0);
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


editProfileBtn.addEventListener('click', () => {
  viewMode.style.display = 'none';
  editMode.style.display = 'block';
});


cancelEditBtn.addEventListener('click', () => {
  editMode.style.display = 'none';
  viewMode.style.display = 'block';
  selectedAvatarFile = null;
  if (currentUser) {
    displayUserProfile(currentUser);
  }
});


editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) return;

  const submitBtn = editForm.querySelector('button[type="submit"]') as HTMLButtonElement;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';

  try {
    let avatarUrl = currentUser.avatar_url;


    if (selectedAvatarFile) {

      if (currentUser.avatar_url) {
        await supabase.storage
          .from('userProfiles')
          .remove([currentUser.avatar_url]);
      }


      const fileExt = selectedAvatarFile.name.split('.').pop();
      const fileName = `public/${currentUser.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('userProfiles')
        .upload(fileName, selectedAvatarFile);

      if (uploadError) throw uploadError;

      avatarUrl = fileName;
    }


    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: (document.getElementById('edit-username') as HTMLInputElement).value,
        name: (document.getElementById('edit-fullname') as HTMLInputElement).value,
        phone: (document.getElementById('edit-phone') as HTMLInputElement).value,
        avatar_url: avatarUrl,
        bio: bioInput.value
      })
      .eq('id', currentUser.id);

    if (updateError) throw updateError;

    showPopup('Perfil atualizado com sucesso!', 3000, 1);
    

    await loadUserProfile();
    

    editMode.style.display = 'none';
    viewMode.style.display = 'block';
    selectedAvatarFile = null;

  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    showPopup('Erro ao salvar alterações. Tente novamente.', 3000, 0);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Salvar Alterações';
    window.location.reload()
  }
});


loadUserProfile();