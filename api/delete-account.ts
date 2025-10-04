import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Debug log: report invocation
  console.log('DELETE-ACCOUNT invoked:', { method: req.method, headers: req.headers });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server missing Supabase configuration' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) return res.status(401).json({ error: 'Missing access token' });

  try {
    const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: serviceRoleKey,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(401).json({ error: 'Invalid token', detail: text });
    }

    const user = await resp.json();
    const userId = user?.id;

    if (!userId) return res.status(400).json({ error: 'Unable to determine user id from token' });

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      return res.status(500).json({ error: 'Failed to delete user from auth', detail: deleteAuthError });
    }

    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('Error deleting profile row:', deleteProfileError);
      return res.status(500).json({ error: 'User deleted from auth but failed to delete profile', detail: deleteProfileError });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error in delete-account:', err);
    return res.status(500).json({ error: 'Unexpected server error', detail: String(err) });
  }
}
