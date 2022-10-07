import { Router, Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

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
      const user = await prisma.user.create({
        data: {
          username,
          password,
          email,
        },
      });
      (<ISessionData>req.session).username = req.body.username;
      res.json({ message: "ok" });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

authRouter.post("/login", async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: {
      username: req.body.username,
    },
    include: {
      item: {
        orderBy: {
          expiry: "asc", // earlier dates first, far future dates last
        },
      },
    },
  });
  res.send();
});
