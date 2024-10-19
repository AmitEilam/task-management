import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
// @ts-ignore
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extracting the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      // Responding with an error if the token is missing
      res.status(401).json({ message: 'Authorization token is missing' });
      return;
    }

    // Constructing the URL to fetch the JWKS
    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    const { data } = await axios.get(jwksUrl);
    const jwk = data.keys[0];
    const pem = jwkToPem(jwk);

    // Verifying the token using the PEM
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token is invalid or expired' });
      }

      // Ensuring that decoded is not a string and contains the expected property
      if (typeof decoded !== 'string' && decoded) {
        // Adding user groups to the request object
        (req as any).user = {
          groups: (decoded as JwtPayload)['cognito:groups'] || [],
          userId: (decoded as JwtPayload)['sub'],
        };
      }

      // Proceeding to the next middleware or route handler
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Token is invalid or expired' });
  }
};
