import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Import the authMiddleware

const router = express.Router();

// Routes for task operations with authentication
router.post('/', authMiddleware, createTask); // Authenticate before creating a task
router.get('/', authMiddleware, getAllTasks); // Authenticate before retrieving all tasks
router.get('/:id', authMiddleware, getTaskById); // Authenticate before retrieving a task by ID
router.put('/:id', authMiddleware, updateTask); // Authenticate before updating a task
router.delete('/:id', authMiddleware, deleteTask); // Authenticate before deleting a task

export default router;
