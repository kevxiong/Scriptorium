//comment.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { CreateAccessToken, validateAccessToken, validateRefreshToken } from './auth/token';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
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
      const { postId, parentId, content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Content is required.' });
      }

      // Verify that the post exists
      const postExists = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!postExists) {
        return res.status(404).json({ error: 'Post not found.' });
      }
      const data = {
        content,
        userId,
        postId,
      }
      if (parentId) {
        data.parentId = parentId;
      }

      // Create the comment or reply
      const newComment = await prisma.comment.create({
        data,
      });

      res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
