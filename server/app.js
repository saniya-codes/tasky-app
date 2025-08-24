import express from 'express';
import userRouter from "./routes/userRouter.js";
import individualRouter from "./routes/individualRouter.js";
import organisationRouter from "./routes/organisationRouter.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser(process.env.COOKIE_SECRET_KEY)); //parses/signs cookie while req/res

app.use("/api/user", userRouter); 
app.use("/api/individual", individualRouter); 
app.use("/api/organisation", organisationRouter); 

app.get("/", (req, res) => {
    res.send("Hello World");
});

export default app; 