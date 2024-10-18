import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';

// Check if the role is admin
const isAdmin = (req: Request): boolean => {
  return (req as any).user?.groups?.includes('admin');
};

// CREATE a new task (users and admins can create)
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, status, projectId } = req.body;
    const userId = (req as any).user.userId;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      // Send a 404 response if the project does not exist
      res.status(404).json({ message: 'Project not found' });
      return; // Ensure to return after sending a response
    }

    // Create the task with the provided projectId and the userId of the current user
    const task = new Task({ title, description, status, projectId, userId });
    await task.save();
    res.status(201).json({ message: 'Task created successfully', data: task });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error creating task', error: errorMessage });
  }
};

// READ ALL tasks (users and admins can read)
export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.userId; // Get userId from the request
    const tasks = await Task.find({ userId }); // Fetch tasks associated with the user
    if (tasks.length === 0) {
      res.status(404).json({ message: 'No tasks found' });
    } else {
      res.status(200).json(tasks);
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error fetching tasks', error: errorMessage });
  }
};

// READ ONE task by ID (users and admins can read)
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.status(200).json(task);
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error fetching task', error: errorMessage });
  }
};

// UPDATE a task by ID (users and admins can update)
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validStatuses = ['todo', 'in-progress', 'done'];
    const userId = (req as any).user.userId;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!validStatuses.includes(req.body.status)) {
      res.status(400).json({
        message: "Status not valid. only: 'todo', 'in-progress', 'done'",
      });
      return;
    }

    res.status(200).json({ message: 'Task updated successfully', data: task });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error updating task', error: errorMessage });
  }
};

// DELETE a task by ID (only admins can delete)
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error deleting task', error: errorMessage });
  }
};
