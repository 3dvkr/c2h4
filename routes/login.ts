import { Router, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import session from "express-session";
interface ISessionData
    extends session.Session {
    username: string;
}

export const authRouter = Router();

authRouter.post(`/sign-up`,
    async (
        req: Request,
        res: Response
    ) => {
        if (req.body.username?.length > 0) {
            const {username, password, email} = req.body
            console.log(`found body.name`);
            console.log(req?.session);
            const user = await prisma.user.create({
                data: req.body
            });
            (<ISessionData>req.session).username = req.body.username;
            res.json({message: 'ok'})
        } else {
            res.send({
                title: `Express Login`,
                errorMessage: `Please enter a username and password`
            })
        }
    });