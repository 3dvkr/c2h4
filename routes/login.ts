import { Router, Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import session from "express-session";
interface ISessionData extends session.Session {
  username: string;
}

const signUpSchema = z.object({
  username: z
    .string({
      required_error: "User name is required",
    })
    .min(4)
    .max(10),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Not a valid email"),
  password: z.string({
    required_error: "Password is required",
  }),
  confirmPassword: z.string({
    required_error: "Password confirmation is required",
  }),
});
const validateSignUp = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["password"],
        })
        .parseAsync(req.body);
      return next();
    } catch (error) {
      return res.status(400).json({ error });
    }
  };
};

export const authRouter = Router();

authRouter.post(
  `/sign-up`,
  validateSignUp(signUpSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hash,
          email,
        },
      });
      res.json({ message: "user created" });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email == null || password == null) {
    return res.sendStatus(403);
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
      include: {
        item: {
          orderBy: {
            expiry: "asc",
          },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(403).json({ message: "Incorrect password." });
    }
    return res.status(200);
  } catch (err) {
    res.status(400).json(err);
  }
});
