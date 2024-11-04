// pages/api/templates/index.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { method, query } = req;
  const token = req.cookies.token;
  let userId = null;

  // Decode token if available to check for authenticated user
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  switch (method) {
    case 'GET':
      // Fetch all templates or filter based on query parameters
      const { search, userOnly } = query;

      try {
        const filters = {};
        if (search) {
          filters.OR = [
            { title: { contains: search } },
            { code: { contains: search } },
            { explanation: { contains: search } },
            { tags: { some: { name: { contains: search } } } }, // Search in tags
          ];
        }
        if (userOnly && userId) {
          filters.userId = userId;
        }

        const templates = await prisma.template.findMany({
          where: filters,
          include: { user: true, tags: true },
        });

        res.status(200).json(templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).json({ error: 'Failed to fetch templates' });
      }
      break;

    case 'POST':
      // Create a new template (authenticated users only)
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to save a template' });
      }

      const { title, code, explanation, tags } = req.body;
      if (!title || !code) {
        return res.status(400).json({ error: 'Title and code are required' });
      }

      try {
        const tagRelations = tags
          ? await Promise.all(
              tags.map(async (tagName) => {
                let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                  tag = await prisma.tag.create({ data: { name: tagName } });
                }
                return { id: tag.id };
              })
            )
          : [];

        const newTemplate = await prisma.template.create({
          data: {
            title,
            code,
            explanation,
            user: { connect: { id: userId } },
            tags: { connect: tagRelations },
          },
          include: { tags: true },
        });
        res.status(201).json(newTemplate);
      } catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ error: 'Failed to save template' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
