import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { postid, tagId, templateid, title } = req.query;

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
          },
        });
      } else if (templateid) {
        // Search by Tag ID
        posts = await prisma.post.findMany({
          where: {
            tags: {
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
          },
        });
      } else {
        // Return all posts if no search criteria is provided
        posts = await prisma.post.findMany({
          include: {
            user: true,
            comments: true,
            rating: true,
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
