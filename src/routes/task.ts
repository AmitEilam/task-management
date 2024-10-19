import express from 'express';
import {
  create,
  getAll,
  getById,
  update,
  deleteById,
} from '../controllers/task';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Create a task
router.post('/', auth, create);

// Retrieve all tasks
router.get('/', auth, getAll);

// Retrieve a task by ID
router.get('/:id', auth, getById);

// Update a task
router.put('/:id', auth, update);

// Delete a task
router.delete('/:id', auth, deleteById);

export default router;
