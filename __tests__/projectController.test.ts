import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../src/controllers/projectController';
import Project from '../src/models/Project';
import Task from '../src/models/Task';

// Mocking the Project model
jest.mock('../src/models/Project');

describe('Project Controller', () => {
  let mockProject: any;

  // Initialize mockProject before each test
  beforeEach(() => {
    mockProject = Project;
  });

  // Clear mocks after each test to ensure a clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a new project and return 201 status for admin', async () => {
      const req = {
        body: {
          name: 'Test Project',
          description: 'Test Description',
        },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the save function to simulate saving a project
      const savedProject = {
        ...req.body,
        _id: 'project123',
        userId: req.user.userId,
      };
      mockProject.prototype.save = jest.fn().mockResolvedValue(savedProject);

      await createProject(req, res);

      // Verify that the response status and message are correct
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Project created successfully',
        data: expect.any(Object),
      });
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        body: {
          name: 'Test Project',
          description: 'Test Description',
        },
        user: { groups: ['user'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await createProject(req, res);

      // Verify that the response status and message are correct for non-admin
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });

    it('should return 500 if project creation fails', async () => {
      const req = {
        body: {
          name: 'Test Project',
          description: 'Test Description',
        },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate an error during project creation
      mockProject.prototype.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'));

      await createProject(req, res);

      // Verify that the response status and error message are correct
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating project',
        error: 'Error',
      });
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects associated with the user', async () => {
      const req = {
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return a list of projects for the user
      const projects = [
        { name: 'Project 1', userId: 'user123' },
        { name: 'Project 2', userId: 'user123' },
      ];
      mockProject.find = jest
        .fn()
        .mockResolvedValue(
          projects.filter((p) => p.userId === req.user.userId)
        );

      await getAllProjects(req, res);

      // Verify that the response status and projects are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(projects);
    });

    it('should return 500 if fetching projects fails', async () => {
      const req = { user: { groups: ['admin'], userId: 'user123' } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate an error when fetching projects
      mockProject.find = jest.fn().mockRejectedValueOnce(new Error('Error'));

      await getAllProjects(req, res);

      // Verify that the response status and error message are correct
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching projects',
        error: 'Error',
      });
    });
  });

  describe('getProjectById', () => {
    it('should return a project associated with the user', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const project = { name: 'Test Project', userId: 'user123' };
      mockProject.findOne = jest.fn().mockResolvedValue(project);

      await getProjectById(req, res);

      // Verify that the response status and project data are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(project);
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['user'], userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getProjectById(req, res);

      // Verify that the response status and message are correct for non-admin
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });

    it('should return 404 if project not found', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockProject.findOne = jest.fn().mockResolvedValue(null);

      await getProjectById(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('updateProject', () => {
    it('should update a project and return 200 status for admin', async () => {
      const req = {
        params: { id: 'project123' },
        body: { name: 'Updated Project' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const updatedProject = { name: 'Updated Project', userId: 'user123' };
      mockProject.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(updatedProject);

      await updateProject(req, res);

      // Verify that the response status and updated project data are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Project updated successfully',
        data: updatedProject,
      });
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'project123' },
        body: { name: 'Updated Project' },
        user: { groups: ['user'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await updateProject(req, res);

      // Verify that the response status and message are correct for non-admin
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });

    it('should return 404 if project not found', async () => {
      const req = {
        params: { id: 'project123' },
        body: { name: 'Updated Project' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockProject.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await updateProject(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project and return 200 status for admin', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the delete function to simulate the project being found and deleted
      mockProject.findOneAndDelete = jest
        .fn()
        .mockResolvedValue({ _id: 'project123', userId: 'user123' });

      // Mock the deleteMany function to simulate successful deletion of related tasks
      Task.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });

      await deleteProject(req, res);

      // Verify that the response status and deletion message are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Project and related tasks deleted successfully',
      });
    }, 10000); // 10 seconds timeout

    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['user'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await deleteProject(req, res);

      // Verify that the response status and message are correct for non-admin
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });

    it('should return 404 if project not found', async () => {
      const req = {
        params: { id: 'project123' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate a scenario where the project is not found
      mockProject.findOneAndDelete = jest.fn().mockResolvedValue(null);

      await deleteProject(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });
});
