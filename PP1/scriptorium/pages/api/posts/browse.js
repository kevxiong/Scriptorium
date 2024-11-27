//posts/browse.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { postid, tagId, templateid, title, self } = req.query;

    try {
      let posts;

      if (postid) {
        // Search by ID
        posts = await prisma.post.findMany({
          where: {
            id: parseInt(postid),
          },
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      } else if (tagId) {
        // Search by Tag ID
        posts = await prisma.post.findMany({
          where: {
            tags: {
              some: {
                id: parseInt(tagId),
              },
            },
          },
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      } else if (templateid) {
        // Search by Tag ID
        posts = await prisma.post.findMany({
          where: {
            templates: {
              some: {
                id: parseInt(templateid),
              },
            },
          },
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      } else if (title) {
        posts = await prisma.post.findMany({
          where: {
            title: {
              equals: title,
            },
          },
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      } else if (self) {
        const token = req.cookies.token;
        let userId = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;

            // Fetch the user to check if they are an admin
            const user = await prisma.user.findUnique({ where: { id: userId } });
          } catch (error) {
            console.error("Invalid token:", error);
          }
        }


        posts = await prisma.post.findMany({
          where: {
            userId: {
              equals: userId,
            },
          },
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      } 
      
      
      
      else {
        // Return all posts if no search criteria is provided
        posts = await prisma.post.findMany({
          include: {
            user: true,
            comments: true,
            rating: true,
            tags: true,
            templates: true,
          },
        });
      }

      console.log("Fetched posts:", posts);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Detailed Error in fetching posts:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
