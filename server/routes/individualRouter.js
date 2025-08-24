import express from "express";
import { taskDataValidation, taskIdValidation, taskstatusValidation } from "../middlewares/validationMiddleware.js";
import { getTaskByIdController, getTasksController, addTaskController,  editTaskController, deleteTaskController} from "../controllers/individualControllers.js";
import { individualTokenAuthMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(individualTokenAuthMiddleware)

router.get("/tasks", 
    getTasksController);

router.get("/tasks/:taskId", 
    taskIdValidation(),
    getTaskByIdController);

router.post("/tasks/add", 
    taskDataValidation(),
    addTaskController);

router.put("/tasks/edit/:taskId", 
    taskstatusValidation(),
    taskDataValidation(),
    taskIdValidation(),
    editTaskController);

router.delete("/tasks/delete/:taskId", 
    taskIdValidation(),
    deleteTaskController);

export default router