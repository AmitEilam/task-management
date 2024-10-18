import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

// פונקציה לבדוק אם המשתמש הוא admin
const isAdmin = (req: Request): boolean => {
  return (req as any).user?.groups?.includes('admin');
};

// CREATE a new project (admin only)
export const createProject = (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  const { name, description } = req.body;
  const project = new Project({ name, description });

  project
    .save()
    .then(() => {
      res
        .status(201)
        .json({ message: 'Project created successfully', data: project });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error creating project', error: errorMessage });
    });
};

// READ ALL projects (admin only)
export const getAllProjects = (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  Project.find()
    .then((projects) => {
      if (projects.length === 0) {
        return res.status(404).json({ message: 'No projects found' });
      }
      res.status(200).json(projects);
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error fetching projects', error: errorMessage });
    });
};

// READ ONE project by ID (admin only)
export const getProjectById = (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  Project.findById(req.params.id)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error fetching project', error: errorMessage });
    });
};

// UPDATE a project by ID (admin only)
export const updateProject = (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res
        .status(200)
        .json({ message: 'Project updated successfully', data: project });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error updating project', error: errorMessage });
    });
};

// DELETE a project by ID (admin only)
export const deleteProject = (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  Project.findByIdAndDelete(req.params.id)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // מחיקת כל המשימות שקשורות לפרויקט
      Task.deleteMany({ projectId: req.params.id })
        .then(() => {
          res.status(200).json({
            message: 'Project and related tasks deleted successfully',
          });
        })
        .catch((error: unknown) => {
          const errorMessage =
            (error as Error).message || 'Error deleting related tasks';
          res.status(500).json({
            message: 'Error deleting related tasks',
            error: errorMessage,
          });
        });
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error deleting project', error: errorMessage });
    });
};
