import { supabase } from "../main/supabase";

const signOutBtn = document.getElementById('signout-btn') as HTMLAnchorElement | null;
const userArea = document.getElementById('userArea') as HTMLAnchorElement | null;

checkAuth();

export async function authGuard() {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    window.location.href = "../pages/login/login.html";
    console.log("Usuário não autenticado. Redirecionando para a página de login.");
  }
}

async function checkAuth() {
    const { data } = await supabase.auth.getUser();

    if (data.user){
        signOutBtn.style.display = "block";
        userArea.style.display = "block";
    }
}