import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../src/controllers/taskController';
import Task from '../src/models/Task';

// Mocking the Task model
jest.mock('../src/models/Task');

describe('Task Controller', () => {
  let mockTask: any;

  // Initialize mockTask before each test
  beforeEach(() => {
    mockTask = Task;
  });

  // Clear mocks after each test to ensure a clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task and return 201 status', async () => {
      const req = {
        body: {
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          projectId: 'project123',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(), // Mock status function
        json: jest.fn(), // Mock json function
      } as any;

      // Mock the save function to simulate saving a task
      const savedTask = { ...req.body, _id: 'task123' };
      mockTask.prototype.save = jest.fn().mockResolvedValue(savedTask);

      await createTask(req, res);

      // Ensure correct response status and message
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task created successfully',
        data: expect.any(Object), // Check for any object as the task data
      });
    });

    it('should return 500 if task creation fails', async () => {
      const req = { body: {} } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate an error during task creation
      mockTask.prototype.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'));

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating task',
        error: 'Error',
      });
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks with 200 status', async () => {
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the response to return a list of tasks
      const tasks = [{ title: 'Task 1' }, { title: 'Task 2' }];
      mockTask.find = jest.fn().mockResolvedValue(tasks);

      await getAllTasks(req, res);

      // Check if response is correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it('should return 500 if fetching tasks fails', async () => {
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate an error when fetching tasks
      mockTask.find = jest.fn().mockRejectedValueOnce(new Error('Error'));

      await getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching tasks',
        error: 'Error',
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task with 200 status', async () => {
      const req = { params: { id: 'task123' } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock a specific task being returned
      const task = { title: 'Test Task' };
      mockTask.findById = jest.fn().mockResolvedValue(task);

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it('should return 404 if task not found', async () => {
      const req = { params: { id: 'task123' } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate a scenario where the task is not found
      mockTask.findById = jest.fn().mockResolvedValue(null);

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });
  });

  describe('updateTask', () => {
    it('should update a task and return 200 status', async () => {
      const req = {
        params: { id: 'task123' },
        body: { status: 'in-progress' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Mock the update function to return an updated task
      const updatedTask = { title: 'Test Task', status: 'in-progress' };
      mockTask.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedTask);

      await updateTask(req, res);

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
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate a scenario where the task is not found during update
      mockTask.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });
  });

  describe('deleteTask', () => {
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

      await deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task deleted successfully',
      });
    });

    it('should return 403 if user is not admin', async () => {
      const req = {
        params: { id: 'task123' },
        user: { groups: ['user'] }, // Simulate regular user
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied: Admins only',
      });
    });
  });
});
