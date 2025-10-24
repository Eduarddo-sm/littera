import { supabase } from './supabase';
import { showPopup } from './popup';

async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Login error:', error);
            showPopup(`Erro no login: ${error.message}`, 3000, 0);

            return false;
        }

        if (data.session.user) {
            return true;
        }

        console.warn('Login returned no user data', data);
        showPopup('Não foi possível efetuar o login. Tente novamente.', 3000, 0);
        return false;

    } catch (err) {
        console.error('Unexpected signIn error', err);
        showPopup('Erro inesperado ao tentar logar. Veja o console para mais detalhes.', 3000, 0);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    if (!form) {
        console.warn('loginForm não encontrado no DOM.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('email') as HTMLInputElement | null;
        const passwordEl = document.getElementById('password') as HTMLInputElement | null;
        if (!emailEl || !passwordEl) {
            showPopup('Campos de email ou senha não encontrados na página.', 3000, 0);
            return false;
        }

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        if (!email || !password) {
            showPopup('Preencha email e senha antes de enviar.', 3000, 0);
            return;
        }
        const ok = await signIn(email, password);
        if (ok) {
            showPopup('Login realizado com sucesso!', 2000, 2);
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        }
    });
});
