//posts/index.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.cookies.token;
    let posts;

    try {
      let userId = null;
      let isAdmin = false;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId;

          // Fetch the user to check if they are an admin
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) isAdmin = user.isAdmin;
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }

      // Build the `OR` conditions
      const whereCondition = isAdmin
        ? {} // Admin sees all posts
        : userId
        ? {
            OR: [
              { isHidden: false },                 // Public posts
              { isHidden: true, userId: userId },  // Hidden posts owned by the user
            ],
          }
        : { isHidden: false }; // Only public posts for unauthenticated users

      // Fetch posts based on the constructed `where` condition
      posts = await prisma.post.findMany({
        where: whereCondition,
        include: {
          user: true,
          comments: true,
          rating: true,
          tags: true,
          templates: true,
        },
      });

      console.log("Fetched posts:", posts);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Detailed Error in fetching posts:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
  } else if (req.method === 'POST') {
    const token = req.cookies.token;// Extract the JWT from the cookies
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Verify the JWT and get user data
      const { userId } = decoded;
      const { title, description, tags, templates } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }
      // Initialize the `data` object with required fields
      const data = {
        title,
        description,
        userId,
      };
      // Optionally add tags if they are provided
      if (tags && tags.length > 0) {
        const tagConnections = tags.map(tagId => ({ id: tagId }));
        data.tags = {
          connect: tagConnections,
        };
      }
      // Optionally add templates if they are provided
      if (templates && templates.length > 0) {
        const templateConnections = templates.map(id => ({ id }));
        data.templates = {
          connect: templateConnections,
        };
      }
      // Create the post with optional tags and templates
      const newPost = await prisma.post.create({
        data,
      });
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Detailed Error:", error.message, error.stack); // Log detailed error
      res.status(500).json({ error: error.message || "Failed to create post" });
    }


  } else if (req.method === 'DELETE') {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userId } = decoded;
      const { postId } = req.body;

      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required.' });
      }

      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to delete this post.' });
      }

      // Delete the post
      await prisma.post.delete({
        where: { id: postId },
      });

      res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
      console.error("Error deleting post:", error.message, error.stack);
      res.status(500).json({ error: error.message || "Failed to delete post" });
    }
  }else if (req.method === 'PUT') {
    // Edit a post
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userId } = decoded;
      const { postId, title, description, tags, templates } = req.body;

      if (!postId || !title || !description) {
        return res.status(400).json({ error: 'Post ID, title, and description are required.' });
      }

      const post = await prisma.post.findUnique({ // Verify that the post exists and belongs to the user
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to edit this post.' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          title,
          description,
          userId, // Use the userId from the JWT
          tags,
          templates,
        },
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error.message, error.stack);
      res.status(500).json({ error: error.message || "Failed to update post" });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
