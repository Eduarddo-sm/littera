import { supabase } from "./supabase";
import { authGuard } from "./auth";

const signOutBtn = document.getElementById('signout-btn') as HTMLAnchorElement | null;
const userArea = document.getElementById('userArea') as HTMLAnchorElement | null;

checkAuth();

authGuard();

async function checkAuth() {
    try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
            if (signOutBtn) signOutBtn.style.display = "block";
            if (userArea) userArea.style.display = "block";
        } else {
            if (signOutBtn) signOutBtn.style.display = "none";
            if (userArea) {
                userArea.innerText = "Faça login";
                userArea.href = "../pages/login/login.html";
            }
        }
    } catch (err) {
        console.error('Erro ao checar autenticação:', err);
    }
}

if (signOutBtn) {
    signOutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signOut();


            if (signOutBtn) signOutBtn.style.display = "none";
            if (userArea) {
                userArea.innerText = "Faça login";
                userArea.href = "../pages/login/login.html";
            }
        } catch (err) {
            console.error('Erro no fluxo de signOut:', err);
            alert('Erro ao sair. Veja o console para detalhes.');
        }
    });
}
