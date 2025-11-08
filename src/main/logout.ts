import { supabase } from "./supabase";
import { authGuard, verifyAuth } from "./auth";
import { showPopup } from "./popup";

const signOutBtn = document.getElementById('signout-btn') as HTMLAnchorElement | null;
const userArea = document.getElementById('userArea') as HTMLAnchorElement | null;
const areaDoCliente = document.getElementById('areaDoCliente') as HTMLDivElement | null;
const btnAdd = document.getElementById('add-book-btn') as HTMLButtonElement | null;
const body = document.getElementsByTagName('body')[0] as HTMLBodyElement | null;


async function checkAuth() {
    try {
        let verify = await verifyAuth();
        if (verify) {
            if (signOutBtn) signOutBtn.style.display = "block";
            if (userArea) userArea.style.display = "block";
            if (areaDoCliente) areaDoCliente.innerHTML = `
                <p><a href="./pages/meusAnuncios/meusAnuncios.html">Meus Anuncios</a></p>
                <p><a href="./pages/minhasPropostas/minhasPropostas.html">Minhas Propostas</a></p>
                <p><a href="./pages/perfil/perfil.html">Sua Loja</a></p>
            `
        } else {
            if (signOutBtn) signOutBtn.style.display = "none";
            if (areaDoCliente!) {
                areaDoCliente.style.display = "none";
                areaDoCliente.innerHTML = ``;
            }
            if (btnAdd) btnAdd.style.display = "none"
            if (userArea) {
                userArea.innerText = "Faça login";
                userArea.href = "../pages/login/login.html";
            }
        }

        body!.style.display = "block"
    } catch (err) {
        console.error('Erro ao checar autenticação:', err);
    }
}

if (signOutBtn) {
    signOutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signOut();
            const verify = await verifyAuth();
            console.log("estado auth:", verify);

            if (!verify) {
                if (signOutBtn) signOutBtn.style.display = "none";
                if (areaDoCliente) areaDoCliente.style.display = "none";
            }
            if (userArea) {
                userArea.innerText = "Faça login";
                userArea.href = "../pages/login/login.html";
            }
        } catch (error) {
            console.error('Erro no fluxo de signOut:', error);
            showPopup('Erro ao sair. Veja o console para detalhes.', 3000, 0);
        }
    });
}

authGuard();
checkAuth();
