import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Extend Express Request to carry the google profile after OAuth
declare global {
  namespace Express {
    interface Request {
      googleProfile?: {
        googleId: string;
        email: string;
        name: string;
      };
    }
  }
}

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

/** Redirect the user to Google's consent screen */
export function redirectToGoogle(_req: Request, res: Response) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

/** Handle the OAuth callback from Google */
export async function handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    return res.redirect(`${env.APP_BASE_URL}/auth?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      console.error('[google-oauth] Token exchange failed:', tokenData);
      return res.redirect(`${env.APP_BASE_URL}/auth?error=google_failed`);
    }

    // Fetch user info
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = (await userRes.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      email_verified?: boolean;
    };

    if (!userInfo.sub || !userInfo.email) {
      return res.redirect(`${env.APP_BASE_URL}/auth?error=google_failed`);
    }

    req.googleProfile = {
      googleId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name ?? userInfo.email.split('@')[0],
    };

    next();
  } catch (err) {
    console.error('[google-oauth] Error:', err);
    next(err);
  }
}
