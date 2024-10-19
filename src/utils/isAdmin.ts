import { Request } from 'express';

// Check if the role is admin
export const isAdmin = (req: Request): boolean => {
  return (req as any).user?.groups?.includes('admin');
};
