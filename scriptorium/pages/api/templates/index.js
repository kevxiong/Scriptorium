import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const templates = await prisma.template.findMany({
        include: {
          posts: true, // Include related posts for each template
        },
      });

      // Add a postLink to each post using the query string format
      const templatesWithLinks = templates.map(template => ({
        ...template,
        posts: template.posts.map(post => ({
          ...post,
          postLink: `/api/posts/browse?postid=${post.id}`, // Map to the query string format
        })),
      }));

      res.status(200).json(templatesWithLinks);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
