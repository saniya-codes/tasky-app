import express from "express";
import { organisationTokenAuthMiddleware } from "../middlewares/authMiddleware.js";
import { getTasksController, getTeamTasksController, getTeamsController, insertTeamController, 
    editTeamController, deleteTeamController, insertMemberController, verifyMemberController, 
    insertTasksController, editTaskController, deleteTaskController, editMemberController, 
    deleteMemberController, getMemberByIdController, getTeamByIdController, getMemberTasksController } from "../controllers/organisationControllers.js";
import { teamMemberValidation, taskDataValidation, taskIdValidation, taskstatusValidation,
        teamIdValidation, memberIdValidation, insertMembersValidation, teamNameValidation } from "../middlewares/validationMiddleware.js";
const router = express.Router();

//public route
router.get("/verify/member/:verificationcode/:teamId/:userId",
    verifyMemberController);

router.use(organisationTokenAuthMiddleware);

//screen1 (shown if member is not verified) 
router.get("/teams",
    getTeamsController);

//screen2 team-wise tasks -> member-tasks (not shown, if unverified) -> team-member-task details (add task form)
router.get("/tasks",
    getTasksController);

router.get("/tasks/:teamId/:memberId",
    teamIdValidation(),
    memberIdValidation(),
    getMemberTasksController)

router.get("/tasks/:teamId",
    teamIdValidation(),
    getTeamTasksController);

router.get("/team/:teamId",
    teamIdValidation(),
    getTeamByIdController);

router.get("/member/:teamId/:memberId",
    teamIdValidation(),
    memberIdValidation(),
    getMemberByIdController);

router.post("/insert/team",
    teamNameValidation(),
    insertTeamController);

router.put("/edit/team/:teamId",
    teamIdValidation(),
    teamNameValidation(),
    editTeamController
)

router.delete("/delete/team/:teamId",
    teamIdValidation(),
    deleteTeamController
)

router.post("/insert/member/:teamId",
    teamIdValidation(),
    teamMemberValidation(),
    insertMemberController);

router.post("/insert/task/:teamId",
    taskDataValidation(),
    teamIdValidation(),
    insertMembersValidation(),
    insertTasksController);

router.put("/edit/task/:taskId",
    taskstatusValidation(),
    taskIdValidation(),
    taskDataValidation(),
    editTaskController);

router.delete("/delete/task/:taskId",
    taskIdValidation(),
    deleteTaskController);    

router.put("/edit/member/:teamId/:memberId",
    teamIdValidation(),
    memberIdValidation(),
    teamMemberValidation(),
    editMemberController);

router.delete("/delete/member/:teamId/:memberId",
    teamIdValidation(),
    memberIdValidation(),
    deleteMemberController);

export default router