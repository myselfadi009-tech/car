const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('NO_CLIENT_ID'));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services not loaded yet. Please try again.'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          const profile = await res.json();
          resolve({
            name: profile.name,
            email: profile.email,
            googleId: profile.sub,
            avatar: profile.picture,
          });
        } catch (err) {
          reject(err);
        }
      },
    });

    client.requestAccessToken();
  });
}
