import * as taskController from "./controller/task.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
import * as validators from "./validation.js";
import { validation } from "../../middleware/validation.js";
import { auth, userLoggedIn } from "../../middleware/auth.js";
import { fileValidation, uploadFile } from "../../utils/multer.cloudinary.js";
const router = Router();

// 1-add task with status (toDo)(user must be logged in)
router.post(
  "/addTask",
  validation(validators.addTask),
  auth,
  userLoggedIn, 
  asyncHandler(taskController.addTask)
);
router.patch(
  "/addTask/:taskID/:assignTo",
  auth,
  userLoggedIn,
  uploadFile("task/attachment", [
    ...fileValidation.image,
    ...fileValidation.file,
  ]).fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  asyncHandler(taskController.attachment)
);
// 2-update task (title , description , status) and assign task to other user(user must be logged in) (creator only can update task)
router.put(
  "/update/:taskId",
  validation(validators.updateTask),
  auth,
  userLoggedIn,
  asyncHandler(taskController.updateTask)
);

// 3-delete task(user must be logged in) (creator only can delete task)
router.delete(
  "/delete/:taskId",
  validation(validators.deleteTask),
  auth,
  userLoggedIn,
  asyncHandler(taskController.deleteTask)
);

// 4-get all tasks with user data
router.get("/getTask", asyncHandler(taskController.getTasks));

// 5-get tasks of oneUser with user data (user must be logged in)
router.get(
  "/getAllCreatedTasks",
  auth,
  userLoggedIn,
  asyncHandler(taskController.getCreatedTasks)
);

// 6-get all tasks of oneUser with user data
//get all tasks assign to one user
router.get(
  "/getAllAssignTasks",
  auth,
  userLoggedIn,
  asyncHandler(taskController.getAllAssignTasks)
);
//get all tasks assign to any user
router.get(
  "/getTasksAssignToAnyUser/:id",
  validation(validators.id),
  auth,
  userLoggedIn,
  asyncHandler(taskController.getTasksAssignToAnyUser)
);

// 7-get all tasks that not done after deadline
//*assign to one use
router.get(
  "/getLateTasksAssignToOne",
  auth,
  userLoggedIn,
  asyncHandler(taskController.getLateTasksAssignToOneUser)
);
//*in general
router.get(
  "/getLateTasks",
  auth,
  userLoggedIn,
  asyncHandler(taskController.getLateTasks)
);

export default router;
