import { Router, Request, Response } from 'express';

import session from "express-session";
interface ISessionData
    extends session.Session {
    username: string;
}

export const authRouter = Router();

authRouter.post(`/login`,
    (
        req: Request,
        res: Response
    ) => {
        if (req.body.username?.length > 0) {
            (<ISessionData>req.session).username = req.body.username;
            res.json({message: 'ok'})
        } else {
            res.send({
                title: `Express Login`,
                errorMessage: `Please enter a username and password`
            })
        }
    });