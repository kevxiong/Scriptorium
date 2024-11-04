// pages/api/auth/logout.js

export default function handler(req, res) {
    res.setHeader(
      'Set-Cookie',
      'token=; HttpOnly; Path=/; Max-Age=0' // Set token cookie with Max-Age=0 to clear it
    );
    res.status(200).json({ message: 'Successfully logged out' });
  }
  