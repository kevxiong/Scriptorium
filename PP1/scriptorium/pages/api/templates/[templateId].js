// pages/api/templates/[templateId].js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { method, query } = req;
  const { templateId } = query;  // Extract the template ID from the URL
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
      // Retrieve a single template by ID
      if (!templateId) return res.status(400).json({ error: 'Template ID is required' });
      try {
        const template = await prisma.template.findUnique({
          where: { id: parseInt(templateId) },
          include: { tags: true, user: true },
        });
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.status(200).json(template);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch template' });
      }
      break;

    case 'PUT':
      // Update a template (only if the user is the owner)
      if (!templateId) return res.status(400).json({ error: 'Template ID is required' });
      if (!userId) return res.status(401).json({ error: 'Authentication required' });

      const { newTitle, newCode, newExplanation, newTags } = req.body;
      if (!newTitle || !newCode) return res.status(400).json({ error: 'Title and code are required' });

      try {
        const template = await prisma.template.findUnique({ where: { id: parseInt(templateId) } });
        if (!template) return res.status(404).json({ error: 'Template not found' });
        if (template.userId !== userId) return res.status(403).json({ error: 'Not authorized' });

        const tagRelations = newTags
          ? await Promise.all(newTags.map(async (tagName) => {
              let tag = await prisma.tag.findUnique({ where: { name: tagName } });
              if (!tag) tag = await prisma.tag.create({ data: { name: tagName } });
              return { id: tag.id };
            }))
          : [];

        const updatedTemplate = await prisma.template.update({
          where: { id: parseInt(templateId) },
          data: { title: newTitle, code: newCode, explanation: newExplanation, tags: { set: tagRelations } },
          include: { tags: true },
        });
        res.status(200).json(updatedTemplate);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update template' });
      }
      break;

    case 'DELETE':
      // Delete a template (only if the user is the owner)
      if (!templateId) return res.status(400).json({ error: 'Template ID is required' });
      if (!userId) return res.status(401).json({ error: 'Authentication required' });

      try {
        const template = await prisma.template.findUnique({ where: { id: parseInt(templateId) } });
        if (!template) return res.status(404).json({ error: 'Template not found' });
        if (template.userId !== userId) return res.status(403).json({ error: 'Not authorized' });

        await prisma.template.delete({ where: { id: parseInt(templateId) } });
        res.status(200).json({ message: 'Template deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
