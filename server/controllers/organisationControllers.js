import OrganisationTaskyModel from "../models/Organisation.js";
import OrganisationTasksModel from "../models/Tasks.js";
import sendEmail from "../utils/sendEmail.js";
import sendSms from "../utils/sendSms.js";
import { validationResult } from "express-validator";
import { generateReminders, fetchTasksForTeams, insertOrgTasks, addJobs, deleteJobs } from "../utils/helpers.js";
import MemberEmailVerification from "../utils/verifyMember.js";
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from "axios"


//Screen1
async function getTeamsController(req, res) {
    try {
        let userId = req.user.userId;
        let orgData = await OrganisationTaskyModel.findById(userId);
        let teams = orgData.teams;
        //display only member's who are verified for add task (as checkbox options)
        return res.status(200).json({ success: { msg: `welcome, ${orgData.firstname}!`, teams }, errors: [] });
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


//screen2 (All tasks)
async function getTasksController(req, res) {
    try {
        let userId = req.user.userId;
        let org = await OrganisationTaskyModel.findById(userId, "teams");
        let teams = org.teams;
        let taskData = await fetchTasksForTeams(teams)
        res.status(200).json({ success: { tasks: taskData, msg: "tasks fetched successfully" }, errors: [] })
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


//screen2 (team tasks)
async function getTeamTasksController(req, res) {
    try {
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let orgData = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { '_id': teamId } } });
        if (!orgData.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "team not found!", path: "userStatus" }] });
        let teams = orgData.teams;
        let taskData = await fetchTasksForTeams(teams)
        res.status(200).json({ success: { tasks: taskData, msg: "team tasks fetched successfully" }, errors: [] })
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function insertTeamController(req, res) {
    try {
        const result = validationResult(req);
        let userId = req.user.userId;
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let teamname = req.body.teamname;
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { 'teamname': teamname } } });
        //team-exists
        if (org.teams.length) {
            return res.status(400).json({ errors: "teamnames cannot be duplicated!", success: "" })
        }
        let orgData = await OrganisationTaskyModel.findByIdAndUpdate(userId, { $push: { 'teams': { teamname, members: [] } } }, { new: true })
        return res.status(200).json({ success: { msg: `${teamname} inserted!` }, errors: [] });
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function insertMemberController(req, res) {
    try {
        const result = validationResult(req);
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        let { firstname, email, mobile } = req.body;
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        } else {
             //team doesn't exist
            let org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { '_id': teamId } } });
            if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "team not found!", path: "userStatus" }] });
            let emailVerificationCode = [...Array(12)].map(() => Math.random().toString(36)[2]).join('');
            let mobileVerificationCode = [...Array(12)].map(() => Math.random().toString(36)[2]).join('');
            let member = await OrganisationTaskyModel.findOne({ '_id': userId }, {
                'teams': {
                    $elemMatch: {
                        '_id': teamId, 'members': {
                            $elemMatch: {
                                $or: [
                                    { 'email': email },
                                    { 'mobile': mobile }
                                ]
                            }
                        }
                    }
                }
            });
            //member exists
            if (member.teams.length) {
                return res.status(400).json({ errors: "member already exists!", success: "" })
            }
            const orgData = await OrganisationTaskyModel.findByIdAndUpdate(
                userId,
                { $push: { 'teams.$[team].members': { firstname, mobile, email, verificationcode: { email: emailVerificationCode, mobile: mobileVerificationCode } } } },
                { new: true, arrayFilters: [{ 'team._id': teamId }] }
            );
            let teamName = orgData.teams[0].teamname;
            const emailDataHtml = ReactDOMServer.renderToString( React.createElement(MemberEmailVerification, {fname : firstname, link : `${process.env.HOST_NAME}/api/organisation/verify/member/${emailVerificationCode}/${teamId}/${userId}`, team : teamName}));
            // email verification
            sendEmail({
                to: `${email}`,
                subject: `you've been added to ${teamName} team!!`,
                html: emailDataHtml
            });
            // sms verification
            sendSms({
                message: `\nHello ${firstname},\nclick link to verify number : ${process.env.HOST_NAME}/api/organisation/verify/member/${mobileVerificationCode}/${teamId}/${userId}`,
                mobile: `${mobile}`
            })
            //verification sent prompt "members can be assigned tasks only after verification!"
            return res.status(200).json({ success: { msg: `member added successfull to ${teamName}, prompt ${firstname} to verify details!` }, errors: [] });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function verifyMemberController(req, res) {
    try {
        let verificationCode = req.params.verificationcode;
        let teamId = req.params.teamId;
        let userId = req.params.userId;
        //must check inidividually
        let emailVerified = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: { 'verificationcode.email': verificationCode }
                    }
                }
            }
        });
        let mobileVerified = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: { 'verificationcode.mobile': verificationCode }
                    }
                }
            }
        });
        if (emailVerified.teams.length) {
            await OrganisationTaskyModel.updateOne(
                { '_id': userId, 'teams._id': teamId, 'teams.members.verificationcode.email': verificationCode },
                { $set: { 'teams.$[outer].members.$[inner].isverified.email': true } },
                { arrayFilters: [{ 'outer._id': teamId }, { 'inner.verificationcode.email': verificationCode }] }
            );
            return res.status(200).json({ success: { msg: `your email is verified!` } })
        } else if (mobileVerified.teams.length) {
            await OrganisationTaskyModel.updateOne(
                { '_id': userId, 'teams._id': teamId, 'teams.members.verificationcode.mobile': verificationCode },
                { $set: { 'teams.$[outer].members.$[inner].isverified.mobile': true } },
                { arrayFilters: [{ 'outer._id': teamId }, { 'inner.verificationcode.mobile': verificationCode }] }
            );
            return res.status(200).json({ success: { msg: `your mobile is verified!` } })
        }
        return res.status(200).json({ errors: [{ msg: "not verified, try again!!", path: "userStatus" }], success: "" });
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function insertTasksController(req, res) {
    try {
        const result = validationResult(req);
        let teamId = req.params.teamId;
        let userId = req.user.userId;
        let { members, taskname, deadline } = req.body;
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        } else {
            //member Ids verification (array)
            let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
                'teams': {
                    $elemMatch: {
                        '_id': teamId, 'members': {
                            $in: members,
                        }
                    }
                }
            });
            if (org.teams[0].members.length != members.length) return res.status(400).json({ success: "", errors: [{ msg: "member not found!", path: "userStatus" }] });
            //generate task for each member
            let reminders = generateReminders(deadline);
            let tasksToInsert = await insertOrgTasks(reminders, members, taskname, deadline, userId, teamId, org);
            res.status(200).json({ success: { msg: `task assigned to members!` } })
            let token = req.headers["x-auth-header"];
            await addJobs(tasksToInsert, org, token)
        }
    } catch (error) {
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


async function editTaskController(req, res) {
    try {
        const result = validationResult(req);
        const userId = req.user.userId;
        let taskId = req.params.taskId;
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        } else {
            //reminders re-generated if task is being re-scheduled by user
            if (req.body.taskstatus == false) {
                req.body.reminders = generateReminders(req.body.deadline);
            }
            let task = await OrganisationTasksModel.findByIdAndUpdate(
                taskId,
                { $set: { 'taskname': req.body.taskname, 'taskstatus': req.body.taskstatus, 'deadline': req.body.deadline, 'reminders': req.body.reminders } },
                { new: true }
            );
            if (!task) return res.status(400).json({ success: "", errors: [{ msg: "task not found!", path: "userStatus" }] });
            res.status(200).json({ errors: [], success: { msg: "task edited!" } });
            let token = req.headers["x-auth-header"]
            if (task.taskstatus == false) {
                let teamId = task.team, memberId = task.member;
                let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
                    'teams': {
                        $elemMatch: {
                            '_id': teamId, 'members': {
                                $elemMatch: {
                                    '_id': memberId
                                }
                            }
                        }
                    }
                });
                let firstname = org.teams[0].members[0].firstname;
                let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/delete-jobs/${taskId}`, {
                    headers: {
                        "x-auth-header": token
                    }
                })
                //console.log(`delete jobs : `, delJobApiRes.data.success.msg);
                let addJobsApiRes = await axios.post(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/add-jobs`, { task, firstname }, {
                    headers: {
                        "x-auth-header": token
                    }
                })
                //console.log(`add jobs : `, addJobsApiRes.data.success.msg);
            } else {
                let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/delete-jobs/${taskId}`, {
                    headers: {
                        "x-auth-header": token
                    }
                })
                //console.log(`delete jobs : `, delJobApiRes.data.success.msg);
            }
        }
    } catch (error) {
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


async function deleteTaskController(req, res) {
    try {
        const userId = req.user.userId;
        let taskId = req.params.taskId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        } else {
            //delete task
            const deletedTask = await OrganisationTasksModel.findOneAndDelete({ _id: taskId });
            if (!deletedTask) return res.status(400).json({ success: "", errors: [{ msg: "task not found!", path: "userStatus" }] });
            let memberId = deletedTask.member, teamId = deletedTask.team;
            //delete ref
            await OrganisationTaskyModel.updateOne(
                { '_id': userId, 'teams._id': teamId, 'teams.members._id': deletedTask.member },
                { $pull: { 'teams.$[outer].members.$[inner].tasks': taskId } },
                { arrayFilters: [{ 'outer._id': teamId }, { 'inner._id': memberId }] }
            );
            res.status(200).json({ success: { msg: "task deleted successfully" }, errors : []});
            let token = req.headers["x-auth-header"]
            //delete jobs
            let delJobApiRes = await axios.delete(`${process.env.HOST_NAME_MICROSERVICE}/api/organisation/delete-jobs/${taskId}`, {
                headers: {
                    "x-auth-header": token
                }
            })
            let apiMsg = delJobApiRes.data.success.msg;
        }
    } catch (error) {
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


async function editTeamController(req, res) {
    try {
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        let teamname = req.body.teamname;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { '_id': teamId } } });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "team not found!", path: "userStatus" }] });
        org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { 'teamname': teamname } } });
        //team-exists
        if (org.teams.length) {
            return res.status(400).json({ errors: "teamnames cannot be duplicated!", success: "" })
        }
        await OrganisationTaskyModel.updateOne(
            { _id: userId, 'teams._id': teamId },
            { $set: { 'teams.$[outer].teamname': teamname } },
            { new: true, arrayFilters: [{ 'outer._id': teamId }] }
        );
        res.status(200).json({ success: { msg: "teamname successfully updated" }, errors: [] });
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}

//member.teams[0].members[0].
async function deleteTeamController(req, res) {
    try {
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { '_id': teamId } } });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "team not found!", path: "userStatus" }] });
        await OrganisationTaskyModel.updateOne(
            { "_id": userId },
            { $pull: { 'teams': { _id: teamId } } }
        );
        let deletedTasks = await OrganisationTasksModel.find({ team: teamId }, "_id");
        await OrganisationTasksModel.deleteMany({ team: teamId });
        res.status(200).json({ success: { msg: "team successfully deleted" }, errors: [] });
        //delete team tasks
        let token = req.headers["x-auth-header"];
        await deleteJobs(deletedTasks, token);
    } catch (error) {
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


async function deleteMemberController(req, res) {
    try {
        let teamId = req.params.teamId;
        let memberId = req.params.memberId;
        let userId = req.user.userId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: {
                            '_id': memberId
                        }
                    }
                }
            }
        });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "member not found!", path: "userStatus" }] });
        await OrganisationTaskyModel.updateOne(
            { '_id': userId, 'teams._id': teamId, 'teams.members._id': memberId },
            { $pull: { 'teams.$[outer].members': { _id: memberId } } },
            { arrayFilters: [{ 'outer._id': teamId }] }
        );
        let deletedTasks = await OrganisationTasksModel.find({ member: memberId }, "_id");
        await OrganisationTasksModel.deleteMany({ member: memberId });
        res.status(200).json({ success: { msg: "member successfully deleted" }, errors: [] });
        //delete member tasks
        let token = req.headers["x-auth-header"]
        await deleteJobs(deletedTasks, token);
    } catch (error) {
        if(error.code){
            console.log(error);
        }else{
            res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
        }
    }
}


async function editMemberController(req, res) {
    try {
        let teamId = req.params.teamId;
        let memberId = req.params.memberId;
        let userId = req.user.userId;
        let { firstname, email, mobile } = req.body;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: {
                            '_id': memberId
                        }
                    }
                }
            }
        });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "member not found!", path: "userStatus" }] });
        let prevEmail = org.teams[0].members[0].email, prevMobile = org.teams[0].members[0].mobile, teamName = org.teams[0].teamname, prevFirstName = org.teams[0].members[0].firstname;
        if (firstname != prevFirstName) {
            await OrganisationTaskyModel.updateOne(
                { _id: userId, 'teams._id': teamId, 'teams.members._id': memberId },
                { $set: { 'teams.$[outer].members.$[inner].firstname': firstname } },
                { new: true, arrayFilters: [{ 'outer._id': teamId }, { 'inner._id': memberId }] }
            );
        }
        if (prevEmail != email) {
            let emailVerificationCode = org.teams[0].members[0].verificationcode.email;
            //email cannot be duplicate
            let member = await OrganisationTaskyModel.findOne({ '_id': userId }, {
                'teams': {
                    $elemMatch: {
                        '_id': teamId, 'members': {
                            $elemMatch: { 'email': email },
                        }
                    }
                }
            });
            //member exists
            if (member.teams.length) return res.status(400).json({ errors: "member with that email already exists!", success: "" })
            await OrganisationTaskyModel.updateOne(
                { _id: userId, 'teams._id': teamId, 'teams.members._id': memberId },
                {
                    $set: {
                        'teams.$[outer].members.$[inner].email': email,
                        'teams.$[outer].members.$[inner].isverified.email': false
                    }
                },
                { new: true, arrayFilters: [{ 'outer._id': teamId }, { 'inner._id': memberId }] }
            );
            //email verification
            const emailDataHtml = ReactDOMServer.renderToString( React.createElement(MemberEmailVerification, {fname : firstname, link : `${process.env.HOST_NAME}/api/organisation/verify/member/${emailVerificationCode}/${teamId}/${userId}`, team : teamName}));
            sendEmail({
                to: `${email}`,
                subject: `you've been added to ${teamName} team!!`,
                html: emailDataHtml
            })
        }
        if (prevMobile != mobile) {
            let mobileVerificationCode = org.teams[0].members[0].verificationcode.mobile;
            //mobile cannot be duplicate
            let member = await OrganisationTaskyModel.findOne({ '_id': userId }, {
                'teams': {
                    $elemMatch: {
                        '_id': teamId, 'members': {
                            $elemMatch: { 'mobile': mobile },
                        }
                    }
                }
            });
            //member exists
            if (member.teams.length) return res.status(400).json({ errors: "member with that mobile already exists!", success: "" })
            await OrganisationTaskyModel.updateOne(
                { _id: userId, 'teams._id': teamId, 'teams.members._id': memberId },
                {
                    $set: {
                        'teams.$[outer].members.$[inner].mobile': mobile,
                        'teams.$[outer].members.$[inner].isverified.mobile': false
                    }
                },
                { new: true, arrayFilters: [{ 'outer._id': teamId }, { 'inner._id': memberId }] }
            );
            // sms verification
            sendSms({
                message: `\nHello ${firstname},\nclick link to verify number : ${process.env.HOST_NAME}/api/organisation/verify/member/${mobileVerificationCode}/${teamId}/${userId}`,
                mobile: `${mobile}`
            })
        }
        res.status(200).json({ success: { msg: `member successfully edited. Prompt ${firstname} to verify new details if needed!` }, errors: [] });
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function getTeamByIdController(req, res) {
    try {
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, { 'teams': { $elemMatch: { '_id': teamId } } });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "team not found!", path: "userStatus" }] });
        return res.status(200).json({ success: { team: org.teams[0] } })
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}



async function getMemberByIdController(req, res) {
    try {
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        let memberId = req.params.memberId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: {
                            '_id': memberId
                        }
                    }
                }
            }
        });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "member not found!", path: "userStatus" }] });
        return res.status(200).json({ success: { member: org.teams[0].members[0] } })
    } catch (error) {
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


async function getMemberTasksController(req, res){
    try{
        let memberId = req.params.memberId;
        let userId = req.user.userId;
        let teamId = req.params.teamId;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array(), success: "" })
        }
        let org = await OrganisationTaskyModel.findOne({ '_id': userId }, {
            'teams': {
                $elemMatch: {
                    '_id': teamId, 'members': {
                        $elemMatch: {
                            '_id': memberId
                        }
                    }
                }
            }
        });
        if (!org.teams.length) return res.status(400).json({ success: "", errors: [{ msg: "member not found!", path: "userStatus" }] });
        let member = org.teams[0].members[0];
        let tasks = member.tasks;
        let taskData = {};
        if (member.isverified.email && member.isverified.mobile){
            //if tasks are assigned
            if (member.tasks.length) {
                //perform async io
                taskData[member.firstname] = await OrganisationTasksModel.find({ _id : { $in: tasks} });
            }else{
                taskData[member.firstname] = member._id;
            }
        }
        res.status(200).json({ success: { tasks: taskData, msg: "member tasks fetched successfully" }, errors: [] })
    }catch(error){
        console.log(error);
        res.status(500).json({errors : [{msg : "server is currently experiencing difficulties, please try again later!", path : "internalerror"}]})
    }
}


export {
    getTeamsController, getTasksController, getTeamTasksController, insertTeamController,
    insertMemberController, deleteMemberController, editMemberController, verifyMemberController,
    insertTasksController, editTaskController, deleteTaskController, editTeamController,
    deleteTeamController, getMemberByIdController, getTeamByIdController, getMemberTasksController
}


