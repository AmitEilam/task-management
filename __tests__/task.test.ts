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
    it('should return paginated tasks associated with the user', async () => {
      const req = {
        query: { page: '1', limit: '2' },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return paginated tasks for the user
      const tasks = [
        { title: 'Task 1', userId: 'user123' },
        { title: 'Task 2', userId: 'user123' },
      ];

      // Mock the Task model's find, skip, limit, and countDocuments functions
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(tasks);
      mockTask.find = jest.fn().mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });

      mockTask.countDocuments = jest.fn().mockResolvedValue(4);

      await getAll(req, res);

      // Validate the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        limit: 2,
        totalPages: 2,
        totalTasks: 4,
        tasks,
      });

      // Validate that the mocks were called correctly
      expect(mockTask.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(2);
      expect(mockTask.countDocuments).toHaveBeenCalledWith({
        userId: 'user123',
      });
    });

    it('should return 404 if no tasks are found', async () => {
      const req = {
        query: { page: '1', limit: '2' },
        user: { userId: 'user123' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return an empty list of tasks
      mockTask.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // No tasks
      });

      mockTask.countDocuments = jest.fn().mockResolvedValue(0); // No tasks in total

      await getAll(req, res);

      // Validate that the response status and message are correct for no tasks
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No tasks found' });
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
