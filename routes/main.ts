import { Router, Request, Response } from 'express';

export const defaultRoute = Router();

defaultRoute.get('/', (req: Request, res: Response) => {
  res.send(req.url);
});
