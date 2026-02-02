import { User } from "../models/user.models.js";
import { Project } from "../models/project.js";
import { Task } from "../models/task.js";
import { Subtask } from "../models/subTask.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
        assignedBy: {
          $arrayElemAt: ["$assignedBy", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (description !== undefined) updateFields.description = description;
  if (assignedTo !== undefined) {
    updateFields.assignedTo = assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : null;
  }
  if (status !== undefined) updateFields.status = status;

  const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, {
    new: true,
  }).populate("assignedTo assignedBy", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Delete all subtasks associated with this task
  await Subtask.deleteMany({ task: taskId });

  // Delete the task
  await Task.findByIdAndDelete(taskId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Task and associated subtasks deleted successfully",
      ),
    );
});

const createSubTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Subtask title is required");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (isCompleted !== undefined) updateFields.isCompleted = isCompleted;

  const updatedSubtask = await Subtask.findByIdAndUpdate(
    subTaskId,
    updateFields,
    { new: true },
  ).populate("createdBy", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubtask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  await Subtask.findByIdAndDelete(subTaskId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Subtask deleted successfully"));
});

export {
  createTask,
  createSubTask,
  deleteSubTask,
  updateSubTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
