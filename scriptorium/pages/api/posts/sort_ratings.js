//posts\sort_ratings.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { sort = 'desc' } = req.query;
    try {
      const posts = await prisma.post.findMany({
        include: {
          user: true,
          comments: true,
          tags: true,
          templates: true,
          rating: {
            select: {
              upvote: true,
              downvote: true,
            },
          },
        },
      });

      const postsWithNetRating = posts.map(post => {
        const upvotes = post.rating.filter(r => r.upvote).length;
        const downvotes = post.rating.filter(r => r.downvote).length;
        const netRating = upvotes - downvotes;

        return {
          ...post,
          netRating, // Add net rating to the post object
        };
      });
      
      const sortedPosts = postsWithNetRating.sort((a, b) => {
        if (sort === 'asc') {
          return a.netRating - b.netRating;
        } else {
          return b.netRating - a.netRating;
        }
      });

      console.log("Fetched sorted posts:", sortedPosts);
      res.status(200).json(sortedPosts);

    } catch (error) {
      console.error('Detailed Error in fetching posts:', error.message, error.stack); // Detailed logging
      res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
