import { supabase } from './supabase';
import { authGuard } from '../auth/guard';

const userName = document.getElementById('user-name') as HTMLHeadingElement | null;
const userFullName = document.getElementById('user-fullname') as HTMLDivElement | null;
const userEmail = document.getElementById('user-email') as HTMLDivElement | null;
const userPhone = document.getElementById('user-phone') as HTMLDivElement | null;
const userBio = document.getElementById('user-bio') as HTMLDivElement | null;
const deleteAccountBtn = document.getElementById('delete-account') as HTMLAnchorElement | null;

async function loadUserData() {
    // Pegar o usuário logado
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

    // Pegar dados do perfil na tabela "profiles"
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error(profileError);
        return;
    }

    // Preencher elementos no frontend
    if (userName) userName.innerText = profile.username || '';
    if (userFullName) userFullName.innerText = profile.name || '';
    if (userEmail) userEmail.innerText = profile.email || '';
    if (userPhone) userPhone.innerText = profile.phone || '';
    if (userBio) userBio.innerText = profile.bio || '';
}

// Chama a função para carregar os dados quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadUserData().catch(err => console.error('Erro ao carregar dados do usuário:', err));
    });
} else {
    loadUserData().catch(err => console.error('Erro ao carregar dados do usuário:', err));
}

deleteAccountBtn?.addEventListener('click', async (e) =>{
    const confirmDelete = confirm("Tem certeza que deseja apagar sua conta? Esta ação é irreversível.");    
    if(!confirmDelete) return;
    const {data: {user}} = await supabase.auth.getUser();
    if(!user) {
        alert("Usuário não autenticado.");
        return;
    }

    // Get current session to obtain access token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (sessionError || !accessToken) {
        console.error('Erro ao obter token de sessão:', sessionError);
        alert('Não foi possível obter credenciais para deletar a conta. Faça login novamente e tente novamente.');
        return;
    }


    try {

        console.log('DEBUG_DELETE_ACCOUNT_TOKEN:', accessToken);
    } catch (e) {
    }

    try {
        const resp = await fetch('/api/delete-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
        });

        if (!resp.ok) {
            const errBody = await resp.json().catch(() => null);
            console.error('Erro ao deletar conta (server):', resp.status, errBody);
            alert('Erro ao deletar conta. Veja o console para mais detalhes.');
            return;
        }

        // On success, sign out client and redirect
        await supabase.auth.signOut();
        window.location.href = '../index.html';
    } catch (err) {
        console.error('Erro na requisição de delete-account:', err);
        alert('Erro ao conectar com o servidor para deletar conta. Veja o console para detalhes.');
    }

    })
