import { supabase } from "./supabase";

export async function authGuard() {
    try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            window.location.href = "../pages/login/login.html";
            console.log("Usuário não autenticado. Redirecionando para a página de login.");
        }
    } catch (err) {
        console.error('Erro ao obter usuário:', err);
        window.location.href = "../pages/login/login.html";
    }
}