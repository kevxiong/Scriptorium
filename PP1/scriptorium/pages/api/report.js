//report.js
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
      const { postId, commentId, reason } = req.body;

      // Check that either postId or commentId is provided, but not both
      if ((!postId && !commentId) || (postId && commentId)) {
        return res.status(400).json({ error: 'You must report either a post or a comment, not both.' });
      }

      if (!reason || reason.trim() === '') {
        return res.status(400).json({ error: 'reason is required.' });
      }

      // Verify the existence of the post or comment being reported
      if (postId) {
        const postExists = await prisma.post.findUnique({
          where: { id: postId },
        });
        if (!postExists) {
          return res.status(404).json({ error: 'Post not found.' });
        }
      } else if (commentId) {
        const commentExists = await prisma.comment.findUnique({
          where: { id: commentId },
        });
        if (!commentExists) {
          return res.status(404).json({ error: 'Comment not found.' });
        }
      }

      // Create the report
      const report = await prisma.report.create({
        data: {
          userId,
          postId: postId || null,
          commentId: commentId || null,
          reason,
        },
      });

      res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
