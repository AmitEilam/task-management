import {
  create,
  getAll,
  getById,
  update,
  deleteById,
} from '../src/controllers/task';
import Task from '../src/models/Task';
import Project from '../src/models/Project';

// Mocking the Task and Project models
jest.mock('../src/models/Task');
jest.mock('../src/models/Project');

describe('Task Controller', () => {
  let mockTask: any;
  let mockProject: any;

  // Initialize mocks before each test
  beforeEach(() => {
    mockTask = Task;
    mockProject = Project;
  });

  // Clear mocks after each test to ensure a clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task and return 201 status', async () => {
      const req = {
        body: {
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          projectId: 'project123',
        },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(), // Mock status function
        json: jest.fn(), // Mock json function
      } as any;

      // Mock the findById function to check for the existing project
      mockProject.findById = jest.fn().mockResolvedValue({ _id: 'project123' });

      // Mock the save function to simulate saving a task
      const savedTask = { ...req.body, _id: 'task123', userId: 'user123' };
      mockTask.prototype.save = jest.fn().mockResolvedValue(savedTask);

      await create(req, res);

      // Ensure correct response status and message
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task created successfully',
        data: expect.any(Object), // Check for any object as the task data
      });
    });

    it('should return 404 if project does not exist', async () => {
      const req = {
        body: {
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          projectId: 'project123',
        },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the findById function to simulate a non-existing project
      mockProject.findById = jest.fn().mockResolvedValue(null);

      await create(req, res);

      // Ensure correct response for non-existing project
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 500 if task creation fails', async () => {
      const req = {
        body: {
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          projectId: 'project123',
        },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the findById function to simulate an existing project
      mockProject.findById = jest.fn().mockResolvedValue({ _id: 'project123' });

      // Simulate an error during task creation
      mockTask.prototype.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'));

      await create(req, res);

      // Check that the response status is 500 for task creation failure
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating task',
        error: 'Error',
      });
    });
  });

  describe('getAll', () => {
    it('should return all tasks associated with the user', async () => {
      const req = {
        user: { userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return a list of tasks for the user
      const tasks = [
        { title: 'Task 1', userId: 'user123' },
        { title: 'Task 2', userId: 'user123' },
      ];
      mockTask.find = jest.fn().mockResolvedValue(tasks);

      await getAll(req, res);

      // Verify that the response status and tasks are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it('should return 500 if fetching tasks fails', async () => {
      const req = {
        user: { userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate an error when fetching tasks
      mockTask.find = jest.fn().mockRejectedValueOnce(new Error('Error'));

      await getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching tasks',
        error: 'Error',
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task associated with the user', async () => {
      const req = {
        params: { id: 'task123' },
        user: { userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock a specific task being returned
      const task = { title: 'Test Task', userId: 'user123' };
      mockTask.findOne = jest.fn().mockResolvedValue(task);

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it('should return 404 if task not found', async () => {
      const req = {
        params: { id: 'task123' },
        user: { userId: 'user123' },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate a scenario where the task is not found
      mockTask.findOne = jest.fn().mockResolvedValue(null);

      await getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });
  });

  describe('update', () => {
    it('should update a task and return 200 status', async () => {
      const req = {
        params: { id: 'task123' },
        body: { status: 'in-progress' },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the update function to return an updated task
      const updatedTask = {
        title: 'Test Task',
        status: 'in-progress',
        userId: 'user123',
      };
      mockTask.findOneAndUpdate = jest.fn().mockResolvedValue(updatedTask);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task updated successfully',
        data: updatedTask,
      });
    });

    it('should return 404 if task not found', async () => {
      const req = {
        params: { id: 'task123' },
        body: { status: 'in-progress' },
        user: { userId: 'user123' }, // Simulate user ID
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate a scenario where the task is not found during update
      mockTask.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });
  });

  describe('deleteById', () => {
    it('should delete a task and return 200 status for admin', async () => {
      const req = {
        params: { id: 'task123' },
        user: { groups: ['admin'] }, // Simulate admin user
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the delete function to simulate successful deletion
      mockTask.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      await deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task deleted successfully',
      });
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'task123' },
        user: { groups: ['user'] },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });
  });
});
