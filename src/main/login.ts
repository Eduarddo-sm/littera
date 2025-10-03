import { supabase } from './supabase';

async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`Erro no login: ${error.message}`);
    else {
        alert('Login realizado com sucesso!');
        window.location.href = '/index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        await signIn(email, password);
    });
});