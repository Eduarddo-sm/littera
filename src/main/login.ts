import { supabase } from './supabase';

async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Login error:', error);
            alert(`Erro no login: ${error.message}`);
            return;
        }

        if (data && data.user) {
            alert('Login realizado com sucesso!');
            window.location.href = '/index.html';
        } else {
            console.warn('Login returned no user data', data);
            alert('Não foi possível efetuar o login. Tente novamente.');
        }
    } catch (err) {
        console.error('Unexpected signIn error', err);
        alert('Erro inesperado ao tentar logar. Veja o console para mais detalhes.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('email') as HTMLInputElement | null;
        const passwordEl = document.getElementById('password') as HTMLInputElement | null;
        if (!emailEl || !passwordEl) {
            alert('Campos de email ou senha não encontrados na página.');
            return;
        }

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        if (!email || !password) {
            alert('Preencha email e senha antes de enviar.');
            return;
        }

        await signIn(email, password);
    });
});