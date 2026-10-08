const NEON_AUTH_URL =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
  'https://ep-noisy-shadow-b3ovraox.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function signInWithEmail({ email, password }: SignInCredentials): Promise<SignInResponse> {
  const url = `${NEON_AUTH_URL}/sign-in/email`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login gagal. Periksa kembali email dan password Anda.');
  }

  const data = await response.json();
  
  // Neon Auth / Better Auth returns session with token
  const token = data.token || data.session?.token || data.session?.tokenValue;
  
  return {
    token,
    user: data.user,
  };
}

export async function signOut(): Promise<void> {
  const url = `${NEON_AUTH_URL}/sign-out`;
  try {
    await fetch(url, { method: 'POST' });
  } catch (err) {
    console.error('Sign out error:', err);
  }
}
