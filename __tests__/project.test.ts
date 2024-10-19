import {
  create,
  getAll,
  getById,
  update,
  deleteById,
} from '../src/controllers/project';
import Project from '../src/models/Project';
import Task from '../src/models/Task';

// Mocking the Project model
jest.mock('../src/models/Project');

describe('Project', () => {
  let mockProject: any;

  // Initialize mockProject before each test
  beforeEach(() => {
    mockProject = Project;
  });

  // Clear mocks after each test to ensure a clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
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

      await create(req, res);

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

      await create(req, res);

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

      await create(req, res);

      // Verify that the response status and error message are correct
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating project',
        error: 'Error',
      });
    });
  });

  describe('getAll', () => {
    it('should return paginated projects associated with the user', async () => {
      const req = {
        query: { page: '1', limit: '2' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return paginated projects for the user
      const projects = [
        { name: 'Project 1', userId: 'user123' },
        { name: 'Project 2', userId: 'user123' },
      ];

      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(projects);
      mockProject.find = jest.fn().mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });

      mockProject.countDocuments = jest.fn().mockResolvedValue(4);

      await getAll(req, res);

      // Validate the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        limit: 2,
        totalPages: 2,
        totalProjects: 4,
        projects,
      });

      // Validate that the mocks were called correctly
      expect(mockProject.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(skipMock).toHaveBeenCalledWith(0); // skip = (page - 1) * limit
      expect(limitMock).toHaveBeenCalledWith(2); // limit = 2
      expect(mockProject.countDocuments).toHaveBeenCalledWith({
        userId: 'user123',
      });
    });

    it('should return 404 if no projects are found', async () => {
      const req = {
        query: { page: '1', limit: '2' },
        user: { groups: ['admin'], userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return an empty list of projects
      mockProject.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      mockProject.countDocuments = jest.fn().mockResolvedValue(0);

      await getAll(req, res);

      // Validate that the response status and message are correct for no projects
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No projects found' });
    });
  });

  describe('getById', () => {
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

      await getById(req, res);

      // Verify that the response status and project data are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(project);
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

      await getById(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('update', () => {
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

      await update(req, res);

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

      await update(req, res);

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

      await update(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('deleteById', () => {
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

      await deleteById(req, res);

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

      await deleteById(req, res);

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

      await deleteById(req, res);

      // Verify that the response status and message are correct for not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });
});
