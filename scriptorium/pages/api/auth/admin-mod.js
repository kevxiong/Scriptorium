//auth\admin-mod.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have set JWT_SECRET in your environment variables

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.cookies.token;

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

      // Fetch posts with report count
      const posts = await prisma.post.findMany({
        include: {
          reports: true,
        },
      });

      // Calculate report count for each post
      const postsWithReportCount = posts.map(post => ({
        ...post,
        reportCount: post.reports.length,
      }));

      // Sort posts by report count
      const sortedPosts = postsWithReportCount.sort((a, b) => {
        return req.query.sort === 'asc' ? a.reportCount - b.reportCount : b.reportCount - a.reportCount;
      });

      // Fetch comments with report count
      const comments = await prisma.comment.findMany({
        include: {
          reports: true,
        },
      });

      // Calculate report count for each comment
      const commentsWithReportCount = comments.map(comment => ({
        ...comment,
        reportCount: comment.reports.length,
      }));

      // Sort comments by report count
      const sortedComments = commentsWithReportCount.sort((a, b) => {
        return req.query.sort === 'asc' ? a.reportCount - b.reportCount : b.reportCount - a.reportCount;
      });

      res.status(200).json({ posts: sortedPosts, comments: sortedComments });
    } catch (error) {
      console.error('Error fetching reported content:', error);
      res.status(500).json({ error: 'Failed to fetch reported content' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
