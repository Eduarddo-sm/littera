import { supabase } from './supabase';

async function fetchUserData() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        return null;
    
    }
}

async function  getUserProfile(userId: string) {
    const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .single();
    if (error) {
        console.error('Erro ao obter perfil do usuário:', error);
        return null;
    }

    return data;
}

