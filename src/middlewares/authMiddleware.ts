import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
// @ts-ignore
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authorization token is missing' });
      return;
    }

    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    const { data } = await axios.get(jwksUrl);
    const jwk = data.keys[0];
    const pem = jwkToPem(jwk);

    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token is invalid or expired' });
      }

      // ווידוא שה-decoded אינו מחרוזת
      if (
        typeof decoded !== 'string' &&
        decoded &&
        'cognito:groups' in decoded
      ) {
        // שימוש ב-any כדי להוסיף את השדה user ל-request
        (req as any).user = {
          groups: (decoded as JwtPayload)['cognito:groups'] || [],
        };
      }

      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Token is invalid or expired' });
  }
};
