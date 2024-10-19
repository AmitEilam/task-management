import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { isAdmin } from '../utils/isAdmin';

// CREATE a new task (users and admins can create)
export const create = async (req: Request, res: Response): Promise<void> => {
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

// READ ALL tasks with pagination (users and admins can read)
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    // pagination - check if page and limit are provided
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : null;

    // Start the query to fetch tasks
    let tasksQuery = Task.find({ userId });

    // Apply pagination only if both page and limit are provided
    if (page !== null && limit !== null) {
      const skip = (page - 1) * limit;
      tasksQuery = tasksQuery.skip(skip).limit(limit);
    }

    // Execute the query
    const tasks = await tasksQuery;

    // Count total tasks
    const totalTasks = await Task.countDocuments({ userId });

    if (tasks.length === 0) {
      res.status(404).json({ message: 'No tasks found' });
    } else {
      res.status(200).json({
        page: page || 'all', // Indicate that all tasks are returned if no pagination
        limit: limit || 'all', // Same for limit
        totalPages: limit ? Math.ceil(totalTasks / limit) : 1, // Calculate total pages if pagination applied
        totalTasks,
        tasks,
      });
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error fetching tasks', error: errorMessage });
  }
};

// READ ONE task by ID (users and admins can read)
export const getById = async (req: Request, res: Response): Promise<void> => {
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
export const update = async (req: Request, res: Response): Promise<void> => {
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
export const deleteById = async (
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
