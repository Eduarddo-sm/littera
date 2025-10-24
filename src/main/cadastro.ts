import { supabase } from './supabase';
import { showPopup } from './popup';

type SignUpExtra = {
  name?: string;
  username?: string;
  phone?: string;
};

async function signUp(email: string, password: string, extra: SignUpExtra = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: extra.username ?? extra.name ?? null,
          phone: extra.phone ?? null
        }
      }
    });
    console.debug('signUp response data:', data);
    console.debug('signUp response error:', error);

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        username: extra.username ?? null,
        name: extra.name ?? null,
        email: user.email ?? email,
        phone: extra.phone ?? null
      });

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        showPopup('Erro ao criar perfil. Tente novamente.', 2000, 0);
        return false;
      } else {
        showPopup('Perfil criado com sucesso!', 2000, 1);
      }

    }

    return true;
  } catch (err) {
    console.error('Unexpected signUp error', err);
    showPopup('Erro inesperado ao tentar cadastrar. Veja o console para mais detalhes.')
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement | null;
    const usernameInput = form.querySelector('input[name="username"]') as HTMLInputElement | null;
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement | null;
    const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement | null;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement | null;
    const confirmInput = form.querySelector('input[name="confirmPassword"]') as HTMLInputElement | null;

    if (!emailInput || !passwordInput || !confirmInput) {
      showPopup('Campos de email ou senha não encontrados no formulário.', 3000, 2)
      return;
    }

    const name = nameInput?.value.trim() ?? '';
    const username = usernameInput?.value.trim() ?? '';
    const phone = phoneInput?.value.trim() ?? '';
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!email) { showPopup('Informe um email válido.', 2000, 0); return; }
    if (!password || password.length < 6) { showPopup('A senha deve ter ao menos 6 caracteres', 2000); return; }
    if (password !== confirmPassword) { showPopup('As senhas não conferem.', 2000, 0); return; }

    const ok = await signUp(email, password, { name, username, phone });
    if (ok) {
      showPopup('Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar a conta.')
      setTimeout(() => {
        window.location.href = '/pages/login/login.html';
      }, 3000);
    } else {
      showPopup('Não foi possível completar o cadastro. Veja o console para mais detalhes.')
    }
  });
});
