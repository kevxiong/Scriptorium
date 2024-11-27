import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {

      var userId = req.query.userid;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else if (req.method === 'PUT') {
    try {
      const userId = req.body.userid;
      const { firstName, lastName, avatar, phoneNumber } = req.body;
      console.log({ firstName, lastName, avatar, phoneNumber })
      // Update user with new info
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          avatar,
          phoneNumber,
        },
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          phoneNumber: true,
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
