import OrganisationTasksModel from "../models/Tasks.js";
import OrganisationTaskyModel from "../models/Organisation.js";
import axios from "axios"

function generateReminders(deadline) {
    const currentTime = new Date();
    deadline = new Date(deadline);
    const timeDiff = deadline - currentTime;
    let reminders = [], reminder, scheduled;
    for (let i = 1; i < 4; i++) {
        reminder = (timeDiff * i / 4);
        scheduled = new Date(currentTime.getTime() + reminder);
        reminders.push(scheduled) //current time + reminder = first reminder
    }
    return reminders;
}

async function fetchTasksForTeams(teams) {
    const tasksData = [];
    for (const team of teams) {
        let obj = {
            [team.teamname]: `${team._id}`,
            members: {}
        };
        const members = team.members;
        for (const member of members) {
            //not shown on second screen if not verified (member Ids are not send to frontend)
            if (member.isverified.email && member.isverified.mobile) {
                //if tasks are assigned
                if (member.tasks.length) {
                    //perform async io
                    obj.members[member.firstname] = await OrganisationTasksModel.find({ _id: { $in: member.tasks } });
                } else {
                    obj.members[member.firstname] = member._id;
                }
            }
        }
        tasksData.push(obj);
    }
    return tasksData; // Resolve the promise with tasksData
}


async function insertOrgTasks(reminders, members, taskname, deadline, userId, teamId) {
    let tasksToInsert = []
    for (const member of members) {
        let obj = {};
        obj.taskname = taskname;
        obj.reminders = reminders;
        obj.deadline = deadline;
        obj.organisation = userId;
        obj.team = teamId;
        obj.member = member;
        let task = new OrganisationTasksModel(obj);
        //update task
        await OrganisationTaskyModel.updateOne(
            { '_id': userId, 'teams._id': teamId, 'teams.members._id': member },
            { $push: { 'teams.$[outer].members.$[inner].tasks': task._id } },
            { arrayFilters: [{ 'outer._id': teamId }, { 'inner._id': member }] }
        );
        tasksToInsert.push(task);
        await task.save();
    }
    return tasksToInsert;
}

//axios has independant exception handler 
async function addJobs(tasks, orgData, token) {
    let count = 0;
    for (const task of tasks) {
        let firstname = orgData.teams[0].members[+count].firstname;
        await axios.post(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/add-jobs`, { task, firstname }, {
            headers: {
                "x-auth-header": token
            }
        })
    }
}


async function deleteJobs(tasks, token){
    for(const task of tasks){
        await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/delete-jobs/${task._id.toString()}`, {
            headers: {
                "x-auth-header": token
            }
        })
    }
}


export { generateReminders, fetchTasksForTeams, insertOrgTasks, addJobs, deleteJobs }