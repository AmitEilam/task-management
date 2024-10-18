import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

// Check if the role is admin
const isAdmin = (req: Request): boolean => {
  return (req as any).user?.groups?.includes('admin');
};

// CREATE a new project (admin only)
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const { name, description } = req.body;
    const project = new Project({ name, description });
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

// READ ALL projects (admin only)
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const projects = await Project.find();
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

// READ ONE project by ID (admin only)
export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const project = await Project.findById(req.params.id);
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
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      await Task.deleteMany({ projectId: req.params.id }); // מחיקת כל המשימות שקשורות לפרויקט
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
