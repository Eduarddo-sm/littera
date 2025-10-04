import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Enable CORS for all origins in development
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Debug log: report invocation
  console.log('DELETE-ACCOUNT invoked:', { method: req.method, headers: req.headers });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server missing Supabase configuration' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    // First, get the user from the token using Supabase client
    const supabaseClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user from token:', userError);
      return res.status(401).json({ error: 'Invalid token', detail: userError });
    }

    const userId = user.id;

    // Delete user from auth using admin client
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      return res.status(500).json({ error: 'Failed to delete user from auth', detail: deleteAuthError });
    }

    // Delete profile data
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('Error deleting profile row:', deleteProfileError);
      // Even if profile deletion fails, auth deletion succeeded, so we should still return success
      // but log the error for monitoring
    }

    return res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (err) {
    console.error('Unexpected error in delete-account:', err);
    return res.status(500).json({ error: 'Unexpected server error', detail: String(err) });
  }
}
