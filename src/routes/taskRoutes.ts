import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Create a task
router.post('/', authMiddleware, createTask);

// Retrieve all tasks
router.get('/', authMiddleware, getAllTasks);

// Retrieve a task by ID
router.get('/:id', authMiddleware, getTaskById);

// Update a task
router.put('/:id', authMiddleware, updateTask);

// Delete a task
router.delete('/:id', authMiddleware, deleteTask);

export default router;
