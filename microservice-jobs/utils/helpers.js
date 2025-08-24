import IndividualJobModel from "../models/IndividualJobs.js"
import OrganisationJobModel from "../models/OrganisationJobs.js"
import sendEmail from "./sendEmail.js"
import sendSms from "./sendSms.js"
import { scheduledJobs, scheduleJob } from "node-schedule";
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TaskReminderEmail from "./emailReminder.js";
import IndividualTaskyModel from "../models/Individual.js";
import OrganisationTasksModel from "../models/Tasks.js";
import OrganisationTaskyModel from "../models/Organisation.js";

//in case jobs failed to generate for a task (backdated tasks are not considered)
async function backupJobsFn(){
    try{
        let orgTasks = await OrganisationTasksModel.find({});
        let individuals = await IndividualTaskyModel.find({});
        let individualTasks = [];
        //collect all required info -> individual (nested)
        for(const individual of individuals){
            const {mobile, email, firstname, _id} = individual
            let tasks = individual.tasks;
            for(const task of tasks){
                let newTask = {};
                newTask["reminders"] = task.reminders;
                newTask["taskname"] = task.taskname;
                newTask["taskstatus"] = task.taskstatus;
                newTask["individual"] = _id;
                newTask["_id"] = task._id;
                newTask["deadline"] = task.deadline;
                individualTasks.push({...newTask, email, mobile, firstname})
            }  
        }
        //orgIdsToBackup
        await fetchTasksToBackup([...orgTasks, ...individualTasks]);
        console.log(fetchScheduledJobs())    
    }catch(error){
        console.log(error.message);
    }
}


async function fetchTasksToBackup(tasks){
    for(const task of tasks){
        let model = task.member ? OrganisationJobModel : IndividualJobModel;
        let usertype = task.member ? "organisation" : "individual";
        let taskIds = [...Array(3)].map((value, index) => `${task._id}${++index}`);
        //if jobs of a task are not backed-up
        let backedUpTasks = await model.find({ task: { $in: taskIds } });
        if(backedUpTasks.length == 0 && new Date() < new Date(task.deadline)){
            let newTask = {};
            //collect info -> org 
            if(task.member){
                newTask["reminders"] = task.reminders;
                newTask["taskname"] = task.taskname;
                newTask["_id"] = task._id;
                newTask["deadline"] = task.deadline;
                newTask["member"] = task.member;
                newTask["organisation"] = task.organisation;
                newTask["team"] = task.team;
                let orgData = await OrganisationTaskyModel.findById(task.organisation);
                newTask["email"] = orgData.email;
                newTask["mobile"] = orgData.mobile;
                newTask["firstname"] = orgData.firstname;
            }else{
                newTask = task;
            }
            let userId = newTask.member ? newTask.organisation : newTask._id;
            await insertJobsInPool(newTask.reminders, newTask.email, newTask.mobile, userId, newTask, model, newTask.firstname, usertype)
        }
    }
}


async function insertJobsInPool(reminders, email, mobile, userId, task, model, firstname, usertype){
    let count = 0;
    for(const deadline of reminders){
        let count2 = ++count;
        let smsData = {
            message : `reminder for : ${task.taskname}, \n deadline : ${Date(task.deadline)}`,
            mobile
        }
        const emailDataHtml = ReactDOMServer.renderToString(React.createElement(TaskReminderEmail, {fname : firstname, taskname : task.taskname, deadline : Date(task.deadline)}));
        let emailData = {
            to : email,
            subject : `Friendly Reminder to ${task.taskname}!`,
            html : emailDataHtml
        }
        scheduleJob(`${task._id}${count2}`, new Date(deadline) , async function(){
            let id = `${task._id}${count2}`;
            //chron - true
            await model.updateMany(
                { task: id, notificationtype: { $in: ["email", "sms"] } },
                { $set: { chronstatus: true } }
            );
            sendSms(smsData, id, usertype);
            sendEmail(emailData, id, usertype);
            //job - true
        })
        let jobs = [
            {task : `${task._id}${count2}`, user : userId, timestamp : deadline, actionpayload : smsData, notificationtype : "sms"},
            {task : `${task._id}${count2}`, user : userId, timestamp : deadline, actionpayload : emailData, notificationtype : "email"}
        ]
        await model.insertMany(jobs);
        //add jobs to pool ("email"/"sms" share taskId)
    }
}


async function retrieveJobs(jobs){
    for(const job of jobs){
        let model = job.usertype == 'organisation' ? OrganisationJobModel : IndividualJobModel;
        let action = job.notificationtype == 'email' ? sendEmail : sendSms;
        if((job.chronstatus == true) || (new Date().getTime() > new Date(job.timestamp).getTime())){
            action(job.actionpayload, job._id);
        }else{
            //if already scheduled, will be replaced (no duplicates)
            scheduleJob(`${job.task}`, job.timestamp, async ()=>{
                await model.findByIdAndUpdate(job.task, {chronstatus : true});
                action(job.actionpayload, job.task);
            })
        }
    }
}


function fetchScheduledJobs(){
    let jobs = [], obj={};
    for(const jobId in scheduledJobs){
        obj._id = jobId;
        obj.timeStamp = scheduledJobs[jobId].nextInvocation().toString();
        jobs.push(obj);
        obj = {};
    }
    return jobs;
}


//Fetch analytics (clean up db, collect user records)
async function fetchJobAnalytics(){
    
}


export {fetchScheduledJobs, insertJobsInPool, retrieveJobs, backupJobsFn}