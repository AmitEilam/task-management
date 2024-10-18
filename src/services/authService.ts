import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Creating an instance of Cognito service
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

// Function to log in a user
export const loginUser = async (
  username: string,
  password: string,
  newPassword?: string // Optional parameter for new password
) => {
  const params: AdminInitiateAuthCommandInput = {
    // Admin authentication flow
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: process.env.COGNITO_CLIENT_ID!,
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const command = new AdminInitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    // Handle new password challenge
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      if (!newPassword) {
        throw new Error('New password must be provided.');
      }

      // Change password to new one
      const changePasswordParams: AdminSetUserPasswordCommandInput = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: username,
        Password: newPassword,
        Permanent: true,
      };
      const changePasswordCommand = new AdminSetUserPasswordCommand(
        changePasswordParams
      );
      await cognitoClient.send(changePasswordCommand);

      // Authenticate again with the new password
      const finalCommand = new AdminInitiateAuthCommand({
        ...params,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: newPassword,
        },
      });
      const finalResponse = await cognitoClient.send(finalCommand);

      return finalResponse.AuthenticationResult;
    }

    // Return authentication result
    return response.AuthenticationResult;
  } catch (error) {
    throw new Error(`Error logging in user: ${error}`);
  }
};
