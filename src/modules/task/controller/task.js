import taskModel from "../../../../DB/model/Task.model.js";
import userModel from "../../../../DB/model/User.model.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import jwt from "jsonwebtoken";

//* 1-add task with status (toDo)(user must be logged in)
export const addTask = async (req, res, next) => {
  const { title, description, assignTo, deadline } = req.body;

  if (new Date(req.body.deadline) < new Date()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Enter valid date",
    });
  } else {
    const user = await userModel.findById(assignTo);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "This user you want to assign this task not exist",
        status: getReasonPhrase(StatusCodes.UNAUTHORIZED),
      });
    } else {
      const task = await taskModel.create({
        title,
        description,
        assignTo,
        deadline,
        userId: req.user._id,
      });

      return res.status(StatusCodes.CREATED).json({
        message: "Done",
        task,
        status: getReasonPhrase(StatusCodes.CREATED),
      });
    }
  }
};
export const attachment = async (req, res, next) => {
  const { taskID } = req.params;
  const { assignTo } = req.params;
  const attachment = [];

  if (req.files.image) {
    for (const image of req.files.image) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        { folder: `trello/user/${req.user._id}/attachment/image` }
      );
      attachment.push({ secure_url, public_id });
    }
  } 
  if (req.files.pdf) {
    for (const file of req.files.pdf) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `trello/user/${req.user._id}/attachment/pdf` }
      );
      attachment.push({ secure_url, public_id });
    }
  }
  const task = await taskModel.findOneAndUpdate(
    { _id: taskID, userId: req.user._id, assignTo: assignTo },
    { attachment },
    { new: true }
  );
  if (!task) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "In-valid data",
    });
  }
  return res.json({ message: "Done", task, file: req.files });
};

//* 2-update task (title , description , status) and assign task to other user(user must be logged in) (creator only can update task)
export const updateTask = async (req, res, next) => {
  const { title, description, assignTo, deadline, status } = req.body;
  const { taskId } = req.params;
  //check status
  if (status != undefined) {
    switch (status) {
      case "doing":
      case "done":
      case "toDo":
        break;
      default:
        res.status(StatusCodes.BAD_REQUEST).json({
          message: `ValidationError: status: ${status} is not a valid enum value for path status`,
        });
        break;
    }
  }
  //Check Date
  if (new Date(req.body.deadline) < new Date()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Enter valid date",
    });
  } else {
    //check user can allowed to update task
    const allowed = await taskModel.findOne({
      _id: taskId,
      userId: req.user._id,
    });

    if (!allowed) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "You are not allowed to update this task",
      });
    } else {
      //check user in assignTo exist
      const user = await userModel.findOne({ _id: assignTo });

      if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "This user you want to assign this task not exist",
        });
      } else {
        //update task
        const update = await taskModel.updateOne(
          { _id: taskId, userId: req.user._id },
          {
            title,
            description,
            assignTo,
            deadline,
            status,
          }
        );
        return update.modifiedCount
          ? res.status(StatusCodes.OK).json({
              message: "Done",
              update,
            })
          : res.status(400).json({
              message: "Not Updated",
            });
      }
    }
  }
};
//* 3-delete task(user must be logged in) (creator only can delete task)
export const deleteTask = async (req, res, next) => {
  const { taskId } = req.params;

  //check task is founded
  const task = await taskModel.findById({ _id: taskId });
  if (!task) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Task not found",
    });
  } else {
    //check user can allowed to delete task
    const allowed = await taskModel.findOneAndDelete({
      _id: taskId,
      userId: req.user._id,
    });

    if (!allowed) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "You are not allowed to delete this task",
      });
    } else {
      res.status(StatusCodes.OK).json({
        message: "Done",
      });
    }
  }
};

//* 4-get all tasks with user data
export const getTasks = async (req, res, next) => {
  const tasks = await taskModel.find().populate([
    {
      path: "userId",
      select: "userName email",
    },
    {
      path: "assignTo",
      select: "userName email",
    },
  ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};

//* 5-get tasks of oneUser with user data (user must be logged in)
//Get all created tasks
export const getCreatedTasks = async (req, res, next) => {
  const tasks = await taskModel.find({ userId: req.user._id }).populate([
    {
      path: "userId",
      select: "userName email",
    },
    {
      path: "assignTo",
      select: "userName email",
    },
  ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};

//* 6-get all tasks of oneUser with user data
// get all tasks assign to one user
export const getAllAssignTasks = async (req, res, next) => {
  const tasks = await taskModel.find({ assignTo: req.user._id }).populate([
    {
      path: "userId",
      select: "userName email",
    },
    {
      path: "assignTo",
      select: "userName email",
    },
  ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};
//* get all tasks assign to any user using id (params)
export const getTasksAssignToAnyUser = async (req, res, next) => {
  const { id } = req.params;
  const tasks = await taskModel.find({ assignTo: id }).populate([
    {
      path: "userId",
      select: "userName email",
    },
    {
      path: "assignTo",
      select: "userName email",
    },
  ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};

//* 7-get all tasks that not done after deadline
//*==Late tasks Assign To One User
export const getLateTasksAssignToOneUser = async (req, res, next) => {
  const tasks = await taskModel
    .find({
      status: { $ne: "done" },
      deadline: { $lt: new Date() },
      assignTo: req.user._id,
    })
    .populate([
      {
        path: "userId",
        select: "userName email",
      },
      {
        path: "assignTo",
        select: "userName email",
      },
    ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};
//*==Late tasks --In general
export const getLateTasks = async (req, res, next) => {
  const tasks = await taskModel
    .find({ status: { $ne: "done" }, deadline: { $lt: new Date() } })
    .populate([
      {
        path: "userId",
        select: "userName email",
      },
      {
        path: "assignTo",
        select: "userName email",
      },
    ]);
  return res.status(StatusCodes.OK).json({
    message: "Done",
    tasks,
    status: getReasonPhrase(StatusCodes.OK),
  });
};
