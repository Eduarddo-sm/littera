import { supabase } from './supabase';

const deleteBtn = document.getElementById('delete-account');

export async function deleteAuthenticatedUser() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado.');
    }
    const userId = userData.user.id;
    const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar usuário.');
    }
    return result;
}


if (deleteBtn) {
    deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja apagar sua conta? Esta ação é irreversível.')) {
            try {
                await deleteAuthenticatedUser();
                alert('Conta apagada com sucesso!');
                window.location.href = '../../index.html';
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                alert('Erro ao apagar conta: ' + errorMessage);
                console.log(errorMessage)
            }
        }
    });
}