import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { CreateAccessToken, validateAccessToken, validateRefreshToken } from './token';
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    let accuserId;
    try {
      const decoded = validateAccessToken(accessToken);
      accuserId = decoded.userId;

      var userId = req.query.userid;
      const user = await prisma.user.findUnique({
        where: { email: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });
      if (user.id != accuserId){
        return res.status(401).json({ error: 'unauthorized access' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else if (req.method === 'PUT') {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    let accuserId;

    try {
      const decoded = validateAccessToken(accessToken);
      accuserId = decoded.email;

      const userId = req.body.userid;

      if (userId != accuserId){
        return res.status(401).json({ error: 'unauthorized access' });
      }
      
      const { firstName, lastName, avatar, phone } = req.body;
      console.log({ firstName, lastName, avatar, phone })
      // Update user with new info
      const updatedUser = await prisma.user.update({
        where: { email: userId },
        data: {
          firstName,
          lastName,
          avatar,
          phone,
        },
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          phone: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
