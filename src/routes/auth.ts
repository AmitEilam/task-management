import express, { Request, Response } from 'express';
import { loginUser } from '../services/authService';

const router = express.Router(); // Creating an Express router

// Handling POST requests to the /login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { username, password, newPassword } = req.body; // Extracting data from the request body

  try {
    // Calling the loginUser function with username, password, and newPassword
    const authResult = await loginUser(username, password, newPassword);

    if (authResult) {
      // If authentication is successful
      res.status(200).json({
        message: 'Login successful',
        token: authResult.IdToken,
      });
    } else {
      // If authentication fails
      res.status(400).json({
        message: 'Login failed',
        error: 'Authentication result not found',
      });
    }
  } catch (error) {
    // Handling errors during the login process
    res.status(400).json({
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
