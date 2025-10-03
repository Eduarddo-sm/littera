import { supabase } from './supabase';

async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('SignUp error:', error);
      alert(`Erro no cadastro: ${error.message}`);
      return;
    }

    console.log('SignUp response:', data);
    alert('Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar a conta.');
    window.location.href = '/pages/login/login.html';
  } catch (err) {
    console.error('Unexpected signUp error', err);
    alert('Erro inesperado ao tentar cadastrar. Veja o console para mais detalhes.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement | null;
    const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement | null;

    if (!emailInput || !passwordInput) {
      alert('Campos de email ou senha não encontrados no formulário.');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) { alert('Informe um email válido.'); return; }
    if (!password || password.length < 6) { alert('A senha deve ter ao menos 6 caracteres'); return; }

    await signUp(email, password);
  });
});
