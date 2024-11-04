// pages/api/templates.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { method } = req;
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
    case 'POST':
      // Save a new template (Authenticated users only)
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to save a template' });
      }

      const { title, code, explanation, tags } = req.body;

      if (!title || !code) {
        return res.status(400).json({ error: 'Title and code are required' });
      }

      try {
        // Convert tag names to tag relations
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
            tags: { connect: tagRelations }, // Relate tags to the template
          },
          include: {
            tags: true, // Ensure tags are included in the response
          },
        });
        res.status(201).json(newTemplate);
      } catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ error: 'Failed to save template' });
      }
      break;

    case 'GET':
      // View or search templates (Available to all)
      const { search, userOnly } = req.query;

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
          include: {
            user: true,
            tags: true, // Include tags for all retrieved templates
          },
        });
        res.status(200).json(templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).json({ error: 'Failed to fetch templates' });
      }
      break;

    case 'PUT':
      // Edit a template (Authenticated users only)
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to edit a template' });
      }

      const { templateId, newTitle, newCode, newExplanation, newTags } = req.body;
      if (!templateId || !newTitle || !newCode) {
        return res.status(400).json({ error: 'Template ID, title, and code are required' });
      }

      try {
        const template = await prisma.template.findUnique({ where: { id: templateId } });
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
        if (template.userId !== userId) {
          return res.status(403).json({ error: 'You are not authorized to edit this template' });
        }

        // Update tags
        const tagRelations = newTags
          ? await Promise.all(
              newTags.map(async (tagName) => {
                let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                  tag = await prisma.tag.create({ data: { name: tagName } });
                }
                return { id: tag.id };
              })
            )
          : [];

        const updatedTemplate = await prisma.template.update({
          where: { id: templateId },
          data: {
            title: newTitle,
            code: newCode,
            explanation: newExplanation,
            tags: { set: tagRelations }, // Update tags
          },
          include: {
            tags: true, // Ensure tags are included in the response
          },
        });
        res.status(200).json(updatedTemplate);
      } catch (error) {
        console.error("Error updating template:", error);
        res.status(500).json({ error: 'Failed to update template' });
      }
      break;

    case 'DELETE':
      // Delete a template (Authenticated users only)
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to delete a template' });
      }

      const { templateId: deleteTemplateId } = req.body;
      if (!deleteTemplateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      try {
        const template = await prisma.template.findUnique({ where: { id: deleteTemplateId } });
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
        if (template.userId !== userId) {
          return res.status(403).json({ error: 'You are not authorized to delete this template' });
        }

        await prisma.template.delete({ where: { id: deleteTemplateId } });
        res.status(200).json({ message: 'Template deleted successfully' });
      } catch (error) {
        console.error("Error deleting template:", error);
        res.status(500).json({ error: 'Failed to delete template' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
