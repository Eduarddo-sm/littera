import { supabase } from './supabase';
import { authGuard } from './auth';

const userName = document.getElementById('user-name') as HTMLHeadingElement | null;
const userFullName = document.getElementById('user-fullname') as HTMLDivElement | null;
const userEmail = document.getElementById('user-email') as HTMLDivElement | null;
const userPhone = document.getElementById('user-phone') as HTMLDivElement | null;
const userBio = document.getElementById('user-bio') as HTMLDivElement | null;

async function loadUserData() {

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userError) {
        console.error(userError);
        return;
    }

    if (!user) {
        authGuard();
        return;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error(profileError);
        return;
    }

    if (userName) userName.innerText = profile.username || '';
    if (userFullName) userFullName.innerText = profile.name || '';
    if (userEmail) userEmail.innerText = profile.email || '';
    if (userPhone) userPhone.innerText = profile.phone || '';
    if (userBio) userBio.innerText = profile.bio || '';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadUserData().catch(err => console.error('Erro ao carregar dados do usuário:', err));
    });
} else {
    loadUserData().catch(err => console.error('Erro ao carregar dados do usuário:', err));
}

