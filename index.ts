import express, { Express, Request, Response } from 'express';
import expressSession from 'express-session';
import dotenv from 'dotenv';
import { defaultRoute } from "./routes/main"
import { authRouter } from "./routes/login"

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession(
  {
      secret: `${process.env.SESSION_SECRET}`,
      resave: false,
      saveUninitialized: true
  }
));

const port = process.env.PORT;
app.use("/api", 
  defaultRoute, 
  authRouter
);

app.listen(port, () => {
  console.log(`[server]: Fridge running at https://localhost:${port}`);
});