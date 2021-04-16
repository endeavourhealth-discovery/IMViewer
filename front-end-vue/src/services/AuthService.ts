import { Auth } from "aws-amplify";
import { User } from "@/models/user/User";
import { CustomAlert } from "@/models/user/CustomAlert";

export default {
  async register(userToRegister: User) {
    try {
      await Auth.signUp({
        username: userToRegister.username,
        password: userToRegister.password,
        attributes: {
          email: userToRegister.email,
          "custom:forename": userToRegister.firstName,
          "custom:surname": userToRegister.lastName,
          "custom:avatar": userToRegister.avatar.value
        }
      });
      return new CustomAlert(201, "User registered successfully");
    } catch (err) {
      console.error(err);
      if (err.code === "UsernameExistsException") {
        return new CustomAlert(409, "Username already exists", err);
      } else {
        return new CustomAlert(400, "User registration failed", err);
      }
    }
  },

  async confirmRegister(username: string, code: string) {
    try {
      await Auth.confirmSignUp(username, code);
      return new CustomAlert(200, "Register confirmation successful");
    } catch (err) {
      console.error(err);
      return new CustomAlert(403, "Failed  register confirmation", err);
    }
  },

  async signIn(username: string, password: string) {
    try {
      const user = await Auth.signIn(username, password);
      const signedInUser = new User(
        user.username,
        user.attributes["custom:forename"],
        user.attributes["custom:surname"],
        user.attributes.email,
        "",
        { value: user.attributes["custom:avatar"] }
      );
      signedInUser.setId(user.attributes.sub);
      return new CustomAlert(200, "Login successful", undefined, signedInUser);
    } catch (err) {
      console.error(err);
      if (err.code === "UserNotConfirmedException") {
        return new CustomAlert(401, err.message, err); //message: "User is not confirmed."
      }
      return new CustomAlert(
        403,
        "Login failed. Check username and password are correct",
        err
      );
    }
  },

  async resendConfirmationCode(username: string) {
    try {
      await Auth.resendSignUp(username);
      return new CustomAlert(200, "Code resent successfully");
    } catch (err) {
      console.error(err);
      return new CustomAlert(400, "Error resending code", err);
    }
  },

  async signOut() {
    try {
      await Auth.signOut({ global: true });
      return new CustomAlert(200, "Logged out successfully");
    } catch (err) {
      return new CustomAlert(400, "Error logging out from auth server", err);
    }
  },

  async updateUser(userToUpdate: User) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user.attributes.sub === userToUpdate.id) {
        const atts: object = {
          email: userToUpdate.email,
          "custom:forename": userToUpdate.firstName,
          "custom:surname": userToUpdate.lastName,
          "custom:avatar": userToUpdate.avatar.value
        };
        await Auth.updateUserAttributes(user, atts);
        const updateResults = await Auth.currentAuthenticatedUser();
        const updatedUser = new User(
          updateResults.username,
          updateResults.attributes["custom:forename"],
          updateResults.attributes["custom:surname"],
          updateResults.attributes.email,
          "",
          { value: updateResults.attributes["custom:avatar"] }
        );
        return new CustomAlert(
          200,
          "User updated successfully",
          undefined,
          updatedUser
        );
      } else {
        return new CustomAlert(403, "Authentication error with server");
      }
    } catch (err) {
      console.error(err);
      return new CustomAlert(500, "Error authenticating current user", err);
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      return new CustomAlert(200, "Password successfully changed");
    } catch (err) {
      console.error(err);
      return new CustomAlert(400, "Error updating password with server", err);
    }
  },

  async forgotPassword(username: string) {
    try {
      await Auth.forgotPassword(username);
      return new CustomAlert(200, "Password reset request sent to server");
    } catch (err) {
      console.error(err);
      return new CustomAlert(400, "Error resetting password from server", err);
    }
  },

  async forgotPasswordSubmit(
    username: string,
    code: string,
    newPassword: string
  ) {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return new CustomAlert(200, "Password reset successfully");
    } catch (err) {
      console.error(err);
      if (err.code === "ExpiredCodeException") {
        return new CustomAlert(403, "Code has expired", err);
      }
      return new CustomAlert(
        400,
        "Error submitting password-reset credentials",
        err
      );
    }
  },

  async forgotUsername(email: string) {
    try {
      await Auth.verifyCurrentUserAttribute(email);
      return new CustomAlert(200, "Account recovery code sent");
    } catch (err) {
      console.error(err);
      return new CustomAlert(400, "Error submitting email", err);
    }
  },

  async getCurrentAuthenticatedUser() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const authenticatedUser = new User(
        cognitoUser.username,
        cognitoUser.attributes["custom:forename"],
        cognitoUser.attributes["custom:surname"],
        cognitoUser.attributes.email,
        "",
        { value: cognitoUser.attributes["custom:avatar"] }
      );
      authenticatedUser.setId(cognitoUser.attributes.sub);
      return new CustomAlert(
        200,
        "User authenticated successfully",
        undefined,
        authenticatedUser
      );
    } catch (err) {
      console.error(err);
      return new CustomAlert(403, "Error authenticating current user", err);
    }
  }

  // currently not a feature with AWS Auth
  // async forgotUsernameSubmit(email: string, code: string){
  //   try {
  //     await Auth.(email, code); // finish this if ever becomes a feature
  //     return new CustomAlert(200, "Account recovered successfully");
  //   } catch (err) {
  //     console.error(err);
  //     if (err.code === "ExpiredCodeException"){
  //       return new CustomAlert(403, "Code has expired", err);
  //     }
  //     return new CustomAlert(400, "Error submitting account recovery credentials", err);
  //   }
  // },
};
