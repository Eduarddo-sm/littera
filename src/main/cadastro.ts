import { supabase } from './supabase';

async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(`Erro no cadastro: ${error.message}`);
  } else {
    alert('Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar a conta.');
    window.location.href = '/pages/login/login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = Array.from(form.querySelectorAll('input')) as HTMLInputElement[];
    const emailInput = inputs.find((i) => i.type === 'email');
    const passwordInput = inputs.find((i) => i.type === 'password');

    if (!emailInput || !passwordInput) {
      alert('Campos de email ou senha não encontrados');
      return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    if (password.length < 6) {
      alert('A senha deve ter ao menos 6 caracteres');
      return;
    }

    await signUp(email, password);
  });
});
