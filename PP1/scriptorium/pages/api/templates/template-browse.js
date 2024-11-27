//posts/browse.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const {tagId, code, title, explanation, self } = req.query;

    try {
      let templates;

      if (tagId) {
        // Search by Tag ID
        templates = await prisma.template.findMany({
          where: {
            tags: {
              some: {
                id: parseInt(tagId),
              },
            },
          },
          include: {
            user: true,
            tags: true,
            posts: true,
          },
        });
      } else if (code) {
        templates = await prisma.template.findMany({
          where: {
            code: {
              equals: code,
            },
          },
          include: {
            user: true,
            tags: true,
            posts: true,
          },
        });
      } else if (title) {
        templates = await prisma.template.findMany({
          where: {
            title: {
              equals: title,
            },
          },
          include: {
            user: true,
            tags: true,
            posts: true,
          },
        });
      } else if (explanation) {
        templates = await prisma.template.findMany({
            where: {
                explanation: {
                  equals: explanation,
                },
              },
          include: {
            user: true,
            tags: true,
            posts: true,
          },
        });
    }
    else if (self) {
        const token = req.cookies.token;
        let userId = null;
      
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
      
            // Fetch the user to check if they are an admin
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { templates: { include: { tags: true, posts: true, user: true } } },
              });
      
            if (!user) {
              return res.status(404).json({ error: "User not found." });
            }

            if (!user.templates || user.templates.length === 0) {
                console.log("No templates found for user.");
                templates = [];
                return res.status(200).json([]);
              }
          
            return res.status(200).json(user.templates);
          } catch (error) {
            console.error("Invalid token:", error);
            return res.status(401).json({ error: "Invalid or expired token." });
          }
        } else {
          return res.status(401).json({ error: "Authentication required." });
        }
      }
      
      
      else {
        // Return all templates if no search criteria is provided
        templates = await prisma.template.findMany({
          include: {
            user: true,
            tags: true,
            posts: true,
          },
        });
      }

      console.log("Fetched templates:", templates);
      res.status(200).json(templates);
    } catch (error) {
      console.error('Detailed Error in fetching templates:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Failed to fetch templates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
