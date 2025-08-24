import IndividualJobModel from "../models/IndividualJobs.js";
import OrganisationJobModel from "../models/OrganisationJobs.js";
import { scheduledJobs } from "node-schedule";
import { fetchScheduledJobs, insertJobsInPool, retrieveJobs } from "../utils/helpers.js";

async function addJobController(req, res){
    try{
        //must be extracted from token
        let {task, firstname} = req.body;
        let {email, mobile, userId, usertype} = req.user;
        let model = (usertype == "individual") ? IndividualJobModel : OrganisationJobModel;
        let reminders = task.reminders;
        await insertJobsInPool(reminders, email, mobile, userId, task, model, firstname, usertype)
        /**
            all insert task requests are fired iteratively (but handled concurrently)
            Therefore, we enter the job in pool first, and then save to db (async op), storing in pool is delayed otherwise. 
            If not, jobs are being placed in pool only after promise resolves (in which case we can't access them)
            By doing this, we can access jobs in pool as soon as promise resolves!

            Since multiple promises can resolve concurrently, jobs in pool for all
            tasks being entered will be printed during response.
        **/
        res.status(200).json({success : {msg : "jobs scheduled!"}})
    }catch(error){
        console.log(error);
    }
}

async function deleteJobController(req, res){
    try{
        let {usertype} = req.user;
        let taskId = req.params.taskId;
        let model = (usertype == "individual") ? IndividualJobModel : OrganisationJobModel;
        //new RegExp(`${taskId}\\d[1-3]$`)
        const taskIds = [...Array(3)].map((value, index) => `${taskId}${++index}`);
        await model.deleteMany({ task: { $in: taskIds } });
        for(const jobId in scheduledJobs){
            if(jobId.slice(0, jobId.length-1) == taskId){ 
                scheduledJobs[jobId].cancel();
            }
        }
        return res.status(200).json({success : {msg : "scheduled jobs flushed!"}})
    }catch(error){
        console.log(error);
    }
}


//re-create job if chron/job are still false, fire job instantly if chron is true
async function retrieveJobsController(req, res){
    try{
        //query for jobs : false, if chron : true (fire immediatelly, else retrieve)
        let individualJobs = await IndividualJobModel.find({jobstatus : false});
        let organisationJobs = await OrganisationJobModel.find({jobstatus : false});
        let jobs = [...individualJobs, ...organisationJobs];
        await retrieveJobs(jobs);
        res.status(200).json({success : {msg : "jobs retirieved succesfully"}});
        console.log(fetchScheduledJobs());
    }catch(error){
        console.log(error);
    }
}


export {addJobController, deleteJobController, retrieveJobsController}
