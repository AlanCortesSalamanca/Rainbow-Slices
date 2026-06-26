import type { RequestHandler } from 'express';
import { supabase } from '../config/supabase';

function getBearerToken(header?: string) {
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

export const requireAdminAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = getBearerToken(req.header('Authorization'));

    if (!token) {
      res.status(401).json({ message: 'Missing bearer token' });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ message: 'Invalid or expired session' });
      return;
    }

    const role = data.user.user_metadata?.role ?? data.user.app_metadata?.role;

    if (role !== 'admin') {
      res.status(403).json({ message: 'Admin role required' });
      return;
    }

    req.authUser = data.user;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Could not validate session' });
  }
};
