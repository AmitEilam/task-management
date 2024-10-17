import express, { Request, Response } from 'express'; // Importing Express and its types for handling requests and responses
import Task from '../models/Task'; // Importing the Task model

const router = express.Router(); // Creating an Express router

// CREATE
// Handling POST requests to create a new task
router.post('/', (req: Request, res: Response) => {
  const { title, description, status, projectId } = req.body; // Extracting task details from the request body
  const task = new Task({ title, description, status, projectId }); // Creating a new task instance

  task
    .save() // Saving the task to the database
    .then(() => {
      res
        .status(201) // Responding with a 201 status code for successful creation
        .json({ message: 'Task created successfully', data: task }); // Returning success message and task data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error creating task', error: errorMessage }); // Returning error message
    });
});

// READ ALL
// Handling GET requests to retrieve all tasks
router.get('/', (req: Request, res: Response) => {
  Task.find() // Finding all tasks in the database
    .then((tasks) => {
      res.status(200).json(tasks); // Responding with a 200 status code and the tasks data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error fetching tasks', error: errorMessage }); // Returning error message
    });
});

// READ ONE
// Handling GET requests to retrieve a specific task by ID
router.get('/:id', (req: Request, res: Response) => {
  Task.findById(req.params.id) // Finding a task by its ID
    .then((task) => {
      if (!task) {
        // If the task is not found
        return res.status(404).json({ message: 'Task not found' }); // Responding with a 404 status code
      }
      res.status(200).json(task); // Responding with a 200 status code and the task data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error fetching task', error: errorMessage }); // Returning error message
    });
});

// UPDATE
// Handling PUT requests to update a specific task by ID
router.put('/:id', (req: Request, res: Response) => {
  const validStatuses = ['todo', 'in-progress', 'done']; // Defining valid task statuses
  Task.findByIdAndUpdate(req.params.id, req.body, { new: true }) // Updating the task with the new data
    .then((task) => {
      if (!task) {
        // If the task is not found
        return res.status(404).json({ message: 'Task not found' }); // Responding with a 404 status code
      }
      // Validate the status field before responding
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Status not valid. only: 'todo', 'in-progress', 'done'", // Responding with a 400 status if status is invalid
        });
      }
      res
        .status(200) // Responding with a 200 status code for successful update
        .json({ message: 'Task updated successfully', data: task }); // Returning success message and updated task data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error updating task', error: errorMessage }); // Returning error message
    });
});

// DELETE
// Handling DELETE requests to delete a specific task by ID
router.delete('/:id', (req: Request, res: Response) => {
  Task.findByIdAndDelete(req.params.id) // Deleting the task by its ID
    .then((task) => {
      if (!task) {
        // If the task is not found
        return res.status(404).json({ message: 'Task not found' }); // Responding with a 404 status code
      }
      res.status(200).json({ message: 'Task deleted successfully' }); // Responding with a success message
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error deleting task', error: errorMessage }); // Returning error message
    });
});

export default router; // Exporting the router for use in other parts of the application
