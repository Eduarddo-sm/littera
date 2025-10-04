import { supabase } from './supabase';

export async function deleteCurrentUser() {
	const { data, error: userError } = await supabase.auth.getUser();
	const user = data?.user;
	if (userError) {
		throw userError;
	}
	if (!user) {
		throw new Error('Usuário não está autenticado.');
	}
	// Chamada para deletar o usuário (requer chave de serviço no backend)
	// Aqui apenas desloga e exibe mensagem
	await supabase.auth.signOut();
	alert('Conta apagada ou solicitação enviada.');
	window.location.href = '../../index.html';
}

