import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have set JWT_SECRET in your environment variables

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const token = req.cookies.token;
    const { postId, isHidden} = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Verify the JWT and get the user ID
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userId } = decoded;

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
