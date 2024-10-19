import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { isAdmin } from '../utils/isAdmin';

// CREATE a new project (admin only)
export const create = async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const { name, description } = req.body;
    const userId = (req as any).user.userId;
    const project = new Project({ name, description, userId });
    await project.save();
    res
      .status(201)
      .json({ message: 'Project created successfully', data: project });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error creating project', error: errorMessage });
  }
};

// READ ALL projects
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const projects = await Project.find({ userId });
    if (projects.length === 0) {
      res.status(404).json({ message: 'No projects found' });
    } else {
      res.status(200).json(projects);
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error fetching projects', error: errorMessage });
  }
};

// READ ONE project by ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const project = await Project.findOne({ _id: req.params.id, userId });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      res.status(200).json(project);
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error fetching project', error: errorMessage });
  }
};

// UPDATE a project by ID (admin only)
export const update = async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const userId = (req as any).user.userId;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      res
        .status(200)
        .json({ message: 'Project updated successfully', data: project });
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error updating project', error: errorMessage });
  }
};

// DELETE a project by ID (admin only)
export const deleteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const userId = (req as any).user.userId;
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId,
    }); // Find and delete the project by ID and userId
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      await Task.deleteMany({ projectId: req.params.id });
      res
        .status(200)
        .json({ message: 'Project and related tasks deleted successfully' });
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    res
      .status(500)
      .json({ message: 'Error deleting project', error: errorMessage });
  }
};
