import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// @ts-ignore
import jwkToPem from 'jwk-to-pem'; // ממיר את ה-JWK ל-PEM
import axios from 'axios'; // משיכת ה-public key מ-AWS Cognito

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // קבלת ה-token מהכותרת Authorization
    if (!token) {
      res.status(401).json({ message: 'Authorization token is missing' });
      return;
    }

    // משיכת ה-public key מ-AWS Cognito
    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    const { data } = await axios.get(jwksUrl); // משיכת ה-JWKs
    const jwk = data.keys[0]; // לקיחת המפתח הראשון
    const pem = jwkToPem(jwk); // המרת JWK ל-PEM

    // אימות ה-JWT token
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token is invalid or expired' });
      }
      next(); // אם הכל תקין, ממשיכים לפעולה הבאה
    });
  } catch (error) {
    res.status(403).json({ message: 'Token is invalid or expired' });
  }
};
