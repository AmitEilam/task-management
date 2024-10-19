import express from 'express';
import {
  create,
  getAll,
  getById,
  update,
  deleteById,
} from '../controllers/project';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Create a project
router.post('/', auth, create);

// Retrieve all projects
router.get('/', auth, getAll);

// Retrieve a project by ID
router.get('/:id', auth, getById);

// Update a project
router.put('/:id', auth, update);

// Delete a project
router.delete('/:id', auth, deleteById);

export default router;
