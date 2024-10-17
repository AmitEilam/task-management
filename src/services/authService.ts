import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'; // Importing necessary components from AWS SDK
import dotenv from 'dotenv'; // Importing dotenv to manage environment variables

dotenv.config(); // Loading environment variables from .env file

// Creating an instance of Cognito service
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION, // AWS region
});

// Function to log in a user
export const loginUser = async (
  username: string,
  password: string,
  newPassword?: string // Optional parameter for new password if required
) => {
  // Define the params with the correct type for AuthFlow
  const params: AdminInitiateAuthCommandInput = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH', // Specify the auth flow type
    ClientId: process.env.COGNITO_CLIENT_ID!, // Client ID of the Cognito user pool
    UserPoolId: process.env.COGNITO_USER_POOL_ID!, // User pool ID
    AuthParameters: {
      USERNAME: username, // Username for authentication
      PASSWORD: password, // Password for authentication
    },
  };

  try {
    const command = new AdminInitiateAuthCommand(params); // Preparing the command
    const response = await cognitoClient.send(command); // Initiating authentication

    // Check if a new password is required
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      // If a new password is required, check if it's provided
      if (!newPassword) {
        throw new Error(
          'New password must be provided for change password challenge.' // Error if new password is not provided
        );
      }

      // Changing the password to the new one
      const changePasswordParams: AdminSetUserPasswordCommandInput = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID!, // User pool ID
        Username: username, // Username for which to change the password
        Password: newPassword, // New password
        Permanent: true, // Make the new password permanent
      };
      const changePasswordCommand = new AdminSetUserPasswordCommand(
        changePasswordParams
      );
      await cognitoClient.send(changePasswordCommand); // Sending the command to change password

      // Try to authenticate again with the new password
      const finalCommand = new AdminInitiateAuthCommand({
        ...params,
        AuthParameters: {
          USERNAME: username, // Username
          PASSWORD: newPassword, // New password
        },
      });
      const finalResponse = await cognitoClient.send(finalCommand); // Sending the command to authenticate again

      return finalResponse.AuthenticationResult; // Return the authentication result
    }

    return response.AuthenticationResult; // Return the authentication result if no new password is required
  } catch (error) {
    throw new Error(`Error logging in user: ${error}`); // Handle errors during authentication
  }
};
