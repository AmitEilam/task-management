import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Create a project
router.post('/', authMiddleware, createProject);

// Retrieve all projects
router.get('/', authMiddleware, getAllProjects);

// Retrieve a project by ID
router.get('/:id', authMiddleware, getProjectById);

// Update a project
router.put('/:id', authMiddleware, updateProject);

// Delete a project
router.delete('/:id', authMiddleware, deleteProject);

export default router;
