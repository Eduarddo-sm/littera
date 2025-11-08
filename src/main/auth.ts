import { supabase } from "./supabase";

export async function authGuard() {
    try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            console.log("Usuário não autenticado. Redirecionando para a página de login.");
        }
    } catch (err) {
        console.error('Erro ao obter usuário:', err);
    }
}

export async function verifyAuth(){
    try {
        const { data} = await supabase.auth.getUser();
        if (data.user){
            return true;
        }else{
            return false
        }
    } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        return false;
    }
}