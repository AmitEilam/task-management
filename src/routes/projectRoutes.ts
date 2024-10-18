import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Import the authMiddleware

const router = express.Router();

// Routes for project operations with authentication
router.post('/', authMiddleware, createProject); // Authenticate before creating a project
router.get('/', authMiddleware, getAllProjects); // Authenticate before retrieving all projects
router.get('/:id', authMiddleware, getProjectById); // Authenticate before retrieving a project by ID
router.put('/:id', authMiddleware, updateProject); // Authenticate before updating a project
router.delete('/:id', authMiddleware, deleteProject); // Authenticate before deleting a project

export default router;
