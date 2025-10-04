import { supabase } from './supabase';

async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Login error:', error);
            alert(`Erro no login: ${error.message}`);
            return false;
        }

        if (data && data.user) {
            return true;
        }

        console.warn('Login returned no user data', data);
        alert('Não foi possível efetuar o login. Tente novamente.');
        return false;

    } catch (err) {
        console.error('Unexpected signIn error', err);
        alert('Erro inesperado ao tentar logar. Veja o console para mais detalhes.');
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
            alert('Campos de email ou senha não encontrados na página.');
                    return false;
        }

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        if (!email || !password) {
            alert('Preencha email e senha antes de enviar.');
            return;
        }
        const ok = await signIn(email, password);
        if (ok) {
            alert('Login realizado com sucesso!');
            window.location.href = '/index.html';
        }
    });
});
