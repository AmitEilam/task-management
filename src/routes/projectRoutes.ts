import express, { Request, Response } from 'express'; // Importing Express and its types for handling requests and responses
import Project from '../models/Project'; // Importing the Project model

const router = express.Router(); // Creating an Express router

// CREATE
// Handling POST requests to create a new project
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body; // Extracting name and description from the request body
  const project = new Project({ name, description }); // Creating a new project instance

  project
    .save() // Saving the project to the database
    .then(() => {
      res
        .status(201) // Responding with a 201 status code for successful creation
        .json({ message: 'Project created successfully', data: project }); // Returning success message and project data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error creating project', error: errorMessage }); // Returning error message
    });
});

// READ ALL
// Handling GET requests to retrieve all projects
router.get('/', (req: Request, res: Response) => {
  Project.find() // Finding all projects in the database
    .then((projects) => {
      if (projects.length === 0) {
        // If no projects are found
        return res.status(404).json({ message: 'No projects found' }); // Responding with a 404 status code
      }
      res.status(200).json(projects); // Responding with a 200 status code and the projects data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error fetching projects', error: errorMessage }); // Returning error message
    });
});

// READ ONE
// Handling GET requests to retrieve a specific project by ID
router.get('/:id', (req: Request, res: Response) => {
  Project.findById(req.params.id) // Finding a project by its ID
    .then((project) => {
      if (!project) {
        // If the project is not found
        return res.status(404).json({ message: 'Project not found' }); // Responding with a 404 status code
      }
      res.status(200).json(project); // Responding with a 200 status code and the project data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error fetching project', error: errorMessage }); // Returning error message
    });
});

// UPDATE
// Handling PUT requests to update a specific project by ID
router.put('/:id', (req: Request, res: Response) => {
  Project.findByIdAndUpdate(req.params.id, req.body, { new: true }) // Updating the project with the new data
    .then((project) => {
      if (!project) {
        // If the project is not found
        return res.status(404).json({ message: 'Project not found' }); // Responding with a 404 status code
      }
      res
        .status(200) // Responding with a 200 status code for successful update
        .json({ message: 'Project updated successfully', data: project }); // Returning success message and updated project data
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error updating project', error: errorMessage }); // Returning error message
    });
});

// DELETE
// Handling DELETE requests to delete a specific project by ID
router.delete('/:id', (req: Request, res: Response) => {
  Project.findByIdAndDelete(req.params.id) // Deleting the project by its ID
    .then((project) => {
      if (!project) {
        // If the project is not found
        return res.status(404).json({ message: 'Project not found' }); // Responding with a 404 status code
      }
      res.status(200).json({ message: 'Project deleted successfully' }); // Responding with a success message
    })
    .catch((error: unknown) => {
      const errorMessage = (error as Error).message || 'Unknown error'; // Extracting error message
      res
        .status(500) // Responding with a 500 status code for server error
        .json({ message: 'Error deleting project', error: errorMessage }); // Returning error message
    });
});

export default router; // Exporting the router for use in other parts of the application
