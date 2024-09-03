// pages/api/auth.js
import { msalInstance, loginRequest } from '../../config/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      req.session.user = {
        username: loginResponse.account.username,
        token: loginResponse.accessToken,
      };
      res.status(200).json({ success: true, user: req.session.user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
