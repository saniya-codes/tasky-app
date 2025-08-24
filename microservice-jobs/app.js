import express from "express"
import cors from "cors"
import {individualAuthMiddleware, organisationAuthMiddleware} from "./middlewares/authMiddleware.js"
import { addJobController, deleteJobController, retrieveJobsController } from "./controllers/jobsControllers.js"
import { backupJobsFn } from "./utils/helpers.js"
const app = express();

setInterval(async ()=>{
    await backupJobsFn();
}, 10 * 60 * 1000)

app.use(cors())
app.use(express.json());

app.post("/api/individual/add-jobs", individualAuthMiddleware, addJobController);
app.post("/api/organisation/add-jobs", organisationAuthMiddleware, addJobController);
app.delete("/api/individual/delete-jobs/:taskId", individualAuthMiddleware, deleteJobController);
app.delete("/api/organisation/delete-jobs/:taskId", organisationAuthMiddleware, deleteJobController);
app.use("/api/jobs/retrieve-jobs", retrieveJobsController);

export default app;
