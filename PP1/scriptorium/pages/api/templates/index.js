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
          include: { user: true, tags: true, posts: true },
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
    
    case 'DELETE':
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to delete a template' });
      }
      const {id} = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id required' });
      }
      try {
        const template = await prisma.template.findUnique({
          where: { id: id },
        });
        if (!template) {
          return res.status(404).json({ error: 'Post not found.' });
        }

        if (template.userId !== userId) {
          return res.status(403).json({ error: 'You are not authorized to delete this post.' });
        }
        await prisma.template.delete({
          where: { id: id },
        });
        res.status(200).json({ message: 'Post deleted successfully.' });
      } catch (error) {
        console.error("Error deleting post:", error.message, error.stack);
        res.status(500).json({ error: error.message || "Failed to delete post" });
      }break;
    
    case 'PUT':
      // Update an existing template (authenticated users only)
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to edit a template' });
      }
    
      const { id: templateId, title: updatedTitle, code: updatedCode, explanation: updatedExplanation, tags: updatedTags } = req.body;
    
      if (!templateId || !updatedTitle || !updatedCode) {
        return res.status(400).json({ error: 'Template ID, title, and code are required' });
      }
    
      try {
        // Check if the template exists and belongs to the authenticated user
        const existingTemplate = await prisma.template.findUnique({
          where: { id: templateId },
          include: { user: true },
        });
    
        if (!existingTemplate) {
          return res.status(404).json({ error: 'Template not found' });
        }
    
        if (existingTemplate.userId !== userId) {
          return res.status(403).json({ error: 'You are not authorized to edit this template' });
        }
    
        // Process the tags
        const tagRelations = updatedTags
          ? await Promise.all(
              updatedTags.map(async (tagName) => {
                let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                  tag = await prisma.tag.create({ data: { name: tagName } });
                }
                return { id: tag.id };
              })
            )
          : [];
    
        // Update the template
        const updatedTemplate = await prisma.template.update({
          where: { id: templateId },
          data: {
            title: updatedTitle,
            code: updatedCode,
            explanation: updatedExplanation,
            tags: { set: [], connect: tagRelations }, // Clear existing tags and connect new ones
          },
          include: { tags: true },
        });
    
        res.status(200).json(updatedTemplate);
      } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
      }
      break;
    


    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
