import { Request, Response } from 'express';
import Task from '../models/Task';

// CREATE a new task
export const createTask = (req: Request, res: Response) => {
  const { title, description, status, projectId } = req.body;
  const task = new Task({ title, description, status, projectId });

  task
    .save()
    .then(() => {
      res
        .status(201)
        .json({ message: 'Task created successfully', data: task });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error creating task', error: errorMessage });
    });
};

// READ ALL tasks
export const getAllTasks = (req: Request, res: Response) => {
  Task.find()
    .then((tasks) => {
      res.status(200).json(tasks);
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error fetching tasks', error: errorMessage });
    });
};

// READ ONE task by ID
export const getTaskById = (req: Request, res: Response) => {
  Task.findById(req.params.id)
    .then((task) => {
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json(task);
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error fetching task', error: errorMessage });
    });
};

// UPDATE a task by ID
export const updateTask = (req: Request, res: Response) => {
  const validStatuses = ['todo', 'in-progress', 'done'];
  Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((task) => {
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Status not valid. only: 'todo', 'in-progress', 'done'",
        });
      }
      res
        .status(200)
        .json({ message: 'Task updated successfully', data: task });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error updating task', error: errorMessage });
    });
};

// DELETE a task by ID
export const deleteTask = (req: Request, res: Response) => {
  Task.findByIdAndDelete(req.params.id)
    .then((task) => {
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json({ message: 'Task deleted successfully' });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error deleting task', error: errorMessage });
    });
};
