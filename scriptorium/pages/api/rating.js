import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { userId } = decoded;
      const { postId, commentId, upvote, downvote } = req.body;

      if ((upvote && downvote) || (!upvote && !downvote)) {
        return res.status(400).json({ error: 'Choose either upvote or downvote, not both.' });
      }

      if ((!postId && !commentId) || (postId && commentId)) {
        return res.status(400).json({ error: 'One postId OR commentId is required.' });
      }

      // Check if the user already rated this post or comment
      const existingRating = await prisma.rating.findFirst({
        where: {
          userId,
        },
      });

      let rating;

      if (existingRating) {
        // Update the existing rating
        console.log("Existing rating found:", existingRating);
        rating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: {
            upvote: Boolean(upvote),
            downvote: Boolean(downvote),
          },
        });
        console.log("Updated rating:", rating);
      } else {
        // Create a new rating
        const data = {
            upvote,
            downvote,
            userId,
        }
        if(postId){
            data.postId = postId;
        }else if(commentId){
            data.commentId = commentId;
        }
        rating = await prisma.rating.create({
          data,
        });
        console.log("Created new rating:", rating);
      }

      res.status(200).json({ message: 'Rating submitted successfully', rating });
    } catch (error) {
        console.error("Error processing rating:", error.message, error.stack);
        res.status(500).json({ error: `Failed to submit rating: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
