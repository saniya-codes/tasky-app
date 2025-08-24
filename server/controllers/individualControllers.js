import { validationResult } from "express-validator";
import { generateReminders } from "../utils/helpers.js";
import IndividualTaskyModel from "../models/Individual.js";
import axios from "axios"

async function getTasksController(req, res){
    try{
        let userId = req.user.userId;
        let userData = await IndividualTaskyModel.findById(userId);
        let tasks = userData.tasks;
        return res.status(200).json({success : {msg : `welcome, ${userData.firstname}!`, tasks}, errors : []}); 
    }catch(error){
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


/*
API : /user/tasks/:taskId
method : GET
description : specific todo 
*/
async function getTaskByIdController(req, res) {
    try{
        const result = validationResult(req);
        const userId = req.user.userId;
        let taskId = req.params.taskId;
        let taskData = await IndividualTaskyModel.findOne({ '_id': userId }, { 'tasks': { $elemMatch: { '_id': taskId } } });
        if(!taskData) return res.status(400).json({success : "", errors : [{msg : "task not found!", path : "userStatus"}]});
        if(!result.isEmpty()){
            res.send(400).json({errors : result.array(), success : ""})
        }else{
            res.status(200).json({success : {tasks : taskData.tasks[0]}, errors : []});
        }   
    }catch(error){
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


/*
API : /user/tasks/edit/:taskId
method : PUT
description : edit todo
*/
async function editTaskController(req, res) {
    try{
        const result = validationResult(req);
        const userId = req.user.userId;
        let taskId = req.params.taskId;
        if(!result.isEmpty()){
            let userData = await IndividualTaskyModel.findById(userId);
            res.status(400).json({errors : result.array(), success : {tasks : userData.tasks}})
        }else{
            //reminders re-generated if task is being re-scheduled by user
            if(req.body.taskstatus == false){
                req.body.reminders = generateReminders(req.body.deadline); 
            }
            req.body._id = taskId; //id added to payload
            const updatedTasks = await IndividualTaskyModel.findByIdAndUpdate(
                userId,
                { $set: { 'tasks.$[task]': {...req.body} } },
                { new: true, arrayFilters: [{ 'task._id': taskId }] }
            );
            if(!updatedTasks) return res.status(400).json({ success: "", errors: [{ msg: "task not found!", path: "userStatus" }] });
            res.status(200).json({errors : [], success : {msg : "task edited!", tasks : updatedTasks.tasks}});
            let task = updatedTasks.tasks[updatedTasks.tasks.length - 1];
            let token = req.headers["x-auth-header"];
            if(task.taskstatus == false){
                let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/individual/delete-jobs/${taskId}`, {
                    headers : {
                        "x-auth-header" : token
                    }
                })
                //console.log(`delete jobs : `, delJobApiRes.data.success.msg);
                let addJobsApiRes = await axios.post(`${process.env.HOST_NAME_MICROSERVICE}/api/individual/add-jobs`, {task, firstname : updatedTasks.firstname}, {
                    headers : {
                        "x-auth-header" : token
                    }
                })
                //console.log(`add jobs : `, addJobsApiRes.data.success.msg);
            }else{
                let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/individual/delete-jobs/${taskId}`, {
                    headers : {
                        "x-auth-header" : token
                    }
                })
                //console.log(`delete jobs : `, delJobApiRes.data.success.msg);
            }
        }   
    }catch(error){
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


/*
API : /user/tasks/add
method : POST
description : user todo insert
*/
async function deleteTaskController(req, res) {
    try{
        const userId = req.user.userId;
        let taskId = req.params.taskId;
        const result = validationResult(req);
        if(!result.isEmpty()){
            let userData = await IndividualTaskyModel.findById(userId);
            return res.status(400).json({errors : result.array(), success : {tasks : userData.tasks}})
        }else{
            const updatedTasks = await IndividualTaskyModel.findByIdAndUpdate(
                userId,
                { $pull: { 'tasks': { _id: taskId } } },
                { new: true }
            );
            if(!updatedTasks) return res.status(400).json({ success: "", errors: [{ msg: "task not found!", path: "userStatus" }] });
            res.status(200).json({success : {msg : "task deleted successfully", tasks : updatedTasks.tasks}});
            let token = req.headers["x-auth-header"];
            let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/individual/delete-jobs/${taskId}`, {
                headers : {
                    "x-auth-header" : token
                }
            })
            let apiMsg = delJobApiRes.data.success.msg;
        }
    }catch(error){
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}

/*
API : /user/tasks/add
method : POST
description : user todo insert
*/
async function addTaskController(req, res){
    try{
        const result = validationResult(req);
        const userId = req.user.userId; 
        if(!result.isEmpty()){
            let userData = await IndividualTaskyModel.findById(userId);
            return res.status(400).json({errors : result.array(), success : {tasks : userData.tasks}})
        }else{
            req.body.reminders = generateReminders(req.body.deadline);
            //nested array mongodb push query
            let updatedTasks = await IndividualTaskyModel.findByIdAndUpdate(userId, {$push : {'tasks' : {...req.body}}}, {new : true})
            let task = updatedTasks.tasks[updatedTasks.tasks.length - 1];
            res.status(200).json({errors : [], success : {msg : `task added!`, tasks : updatedTasks.tasks}});
            let token = req.headers["x-auth-header"];
            let addJobsApiRes = await axios.post(`${process.env.HOST_NAME_MICROSERVICE}/api/individual/add-jobs`, {task, firstname : updatedTasks.firstname}, {
                headers : {
                    "x-auth-header" : token
                }
            })
            let apiMsg = addJobsApiRes.data.success.msg;
        }
    }catch(error){
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


export { getTasksController, getTaskByIdController, addTaskController, editTaskController, deleteTaskController };