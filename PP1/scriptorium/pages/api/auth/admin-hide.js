//auth\admin-hide.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { CreateAccessToken, validateAccessToken, validateRefreshToken } from './token';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have set JWT_SECRET in your environment variables

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
    const { postId, isHidden} = req.body;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let userId;

    try {
      const decoded = validateAccessToken(accessToken);
      userId = decoded.userId;
    } catch (err) {
      if (err.name === 'TokenExpiredError' && refreshToken) {
        try {
          const decoded = validateRefreshToken(refreshToken);
          userId = decoded.userId;

          const newAccessToken = CreateAccessToken(userId);
          res.setHeader('Set-Cookie', cookie.serialize('token', newAccessToken, { httpOnly: true, maxAge: 900 }));
        } catch (refreshError) {
          return res.status(403).json({ error: 'Refresh token expired or invalid' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid access token' });
      }
    }

    try {

      // Fetch the user from the database
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }

      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required.' });
      }

      if(isHidden == null) {
        return res.status(400).json({ error: 'isHidden is required.' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          isHidden,
        },
      });

      res.status(200).json(updatedPost);

    } catch (error) {
      console.error('Error fetching reported content:', error);
      res.status(500).json({ error: 'Failed to fetch reported content' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
