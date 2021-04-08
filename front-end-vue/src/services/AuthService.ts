import { Auth } from "aws-amplify";
import { User } from "@/models/User";

export default {
  async register(userToRegister: User) {
    try {
      await Auth.signUp({
        username: userToRegister.username,
        password: userToRegister.password,
        attributes: {
          email: userToRegister.email,
          "custom:forename": userToRegister.firstName,
          "custom:surname": userToRegister.lastName
        }
      });
      return { status: 201, message: "User registered successfully" };
    } catch (err) {
      console.log(err);
      if (err.code === "UsernameExistsException") {
        return { status: 409, error: err, message: "Username already exists" };
      } else {
        return { status: 400, error: err, message: "User registration failed" };
      }
    }
  },

  async confirmRegister(username: string, code: string) {
    try {
      await Auth.confirmSignUp(username, code);
      return { status: 200, message: "register confirmation successful" };
    } catch (err) {
      console.log(err);
      return {
        status: 403,
        error: err,
        message: "failed register confirmation"
      };
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
        ""
      );
      signedInUser.setId(user.attributes.sub);
      return { status: 200, user: signedInUser, message: "signIn successful" };
    } catch (err) {
      console.log(err);
      if (err.code === "UserNotConfirmedException") {
        return { status: 401, error: err, message: err.message }; //message: "User is not confirmed."
      }
      return {
        status: 403,
        error: err,
        message: "Login failed. Check username and password are correct"
      };
    }
  },

  async resendConfirmationCode(username: string) {
    try {
      await Auth.resendSignUp(username);
      return { status: 200, message: "code resent successfully" };
    } catch (err) {
      console.log(err);
      return { status: 400, error: err, message: "error resending code" };
    }
  },

  async signOut() {
    try {
      await Auth.signOut({ global: true });
      return { status: 200, message: "Logged out successfully" };
    } catch (err) {
      return {
        status: 400,
        error: err,
        message: "Error logging out from auth server"
      };
    }
  },

  async updateUser(userToUpdate: User) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user.attributes.sub === userToUpdate.id) {
        const atts: object = {
          email: userToUpdate.email,
          "custom:forename": userToUpdate.firstName,
          "custom:surname": userToUpdate.lastName
        };
        await Auth.updateUserAttributes(user, atts);
        const updateResults = await Auth.currentAuthenticatedUser();
        const updatedUser = new User(
          updateResults.username,
          updateResults.attributes["custom:forename"],
          updateResults.attributes["custom:surname"],
          updateResults.attributes.email,
          ""
        );
        return {
          status: 200,
          user: updatedUser,
          message: "User updated successfully"
        };
      } else {
        return { status: 403, message: "Authentication error with server" };
      }
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        error: err,
        message: "Error authenticating current user"
      };
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      return { status: 200, message: "Password successfully changed" };
    } catch (err) {
      console.log(err);
      return {
        status: 400,
        error: err,
        message: "Error updating password with server"
      };
    }
  },

  async forgotPassword(username: string) {
    try {
      await Auth.forgotPassword(username);
      return { status: 200, message: "Password reset request sent to server" };
    } catch (err) {
      console.log(err);
      return {
        status: 400,
        error: err,
        message: "Error resetting password from server"
      };
    }
  },

  async forgotPasswordSubmit(
    username: string,
    code: string,
    newPassword: string
  ) {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return { status: 200, message: "Password reset successfully" };
    } catch (err) {
      console.log(err);
      if (err.code === "ExpiredCodeException") {
        return { status: 403, error: err, message: "Code has expired" };
      }
      return {
        status: 400,
        error: err,
        message: "Error submitting password-reset credentials"
      };
    }
  },

  async forgotUsername(email: string) {
    try {
      await Auth.verifyCurrentUserAttribute(email);
      return { status: 200, message: "Account recovery code sent" };
    } catch (err) {
      console.log(err);
      return { status: 400, error: err, message: "Error submitting email" };
    }
  },

  async getCurrentAuthenticatedUser() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const user = new User(
        cognitoUser.username,
        cognitoUser.attributes["custom:forename"],
        cognitoUser.attributes["custom:surname"],
        cognitoUser.attributes.email,
        ""
      );
      user.setId(cognitoUser.attributes.sub);
      return {
        status: 200,
        user: user,
        message: "User authenticated successfully"
      };
    } catch (err) {
      console.log(err);
      return {
        status: 403,
        error: err,
        message: "Error authenticating current user"
      };
    }
  }

  // currently not a feature with AWS Auth
  // async forgotUsernameSubmit(email: string, code: string){
  //   try {
  //     await Auth.(email, code); // finish this if ever becomes a feature
  //     return {status:200, message: "Account recovered successfully"};
  //   } catch (err) {
  //     console.log(err);
  //     if (err.code === "ExpiredCodeException"){
  //       return {status: 403, error: err, message: "Code has expired"}
  //     }
  //     return {status: 400, error: err, message: "Error submitting account recovery credentials"}
  //   }
  // },
};
