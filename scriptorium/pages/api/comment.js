//comment.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userId } = decoded;
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
