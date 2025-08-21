import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  UserCredential,
  AuthProvider,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../../types/models";
import { createUser } from "./userUtils";
import { CUSTOM_ERROR_CODES } from "@/app/constants/errors";

const checkIfUserRegistered = async (email: string) => {
  try {
    const providers = await fetchSignInMethodsForEmail(auth, email);

    if (providers.length > 0) {
      if (providers.includes("google.com")) {
        const err = new Error("User is already Registered with Google. Please Login using Google.") as Error & {code: string};
        err.code = CUSTOM_ERROR_CODES.USER_REGISTERRED_W_GOOGLE;
        throw err;
      } else if (providers.includes("password")) {
        const err = new Error("User is already Registered with Google. Please Login using Email & Password.") as Error & {code: string};
        err.code = CUSTOM_ERROR_CODES.USER_REGISTERRED_W_PASSWORD_EMAIL;
        throw err;
      }
      const err = new Error("User is already Registered. Please Login.") as Error & {code: string};
      err.code = CUSTOM_ERROR_CODES.USER_REGISTERRED;
      throw err;
    }
  } catch (err) {
    throw err;
  }
}

const handleLoginWithProvider = async (
  provider: AuthProvider,
  onSuccessLogin: () => void,
  onSuccessRegister: () => void
): Promise<UserCredential | null> => {
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let result: UserCredential | null = null;

    if (isMobile) {
      // On mobile, sign in with redirect
      await signInWithRedirect(auth, provider);
      // After redirect, you need to call this somewhere (e.g., in useEffect)
      return null;
    } else {
      // Desktop - sign in with popup
      result = await signInWithPopup(auth, provider);
    }

    if (result?.user) {
      await handleUserAfterLogin(
        result.user,
        onSuccessLogin,
        onSuccessRegister
      );
    }

    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const handleUserAfterLogin = async (
  user: any,
  onSuccessLogin: () => void,
  onSuccessRegister: () => void
) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log("User does not exist, creating...");
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? "",
      createdAt: Math.floor(Date.now() / 1000),
      lastActive: Math.floor(Date.now() / 1000),
      statistics: {
        vehiclesOwned: 0,
        eventsAttended: 0,
        eventsHosted: 0,
      },
      socials: {},
      vehicleIds: [],
      eventHostedIds: [],
      eventAttendedIds: [],
    };
    await setDoc(userRef, newUser);
    onSuccessRegister();
  } else {
    console.log("User exists, logging in");
    onSuccessLogin();
  }
};

export const handleRedirectResult = async (
  onSuccessLogin: () => void,
  onSuccessRegister: () => void
) => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await handleUserAfterLogin(
        result.user,
        onSuccessLogin,
        onSuccessRegister
      );
    }
  } catch (err) {
    console.log("Login Error", err);
  }
};

export const handleGoogleLogin = async (
  onSuccessLogin: () => void,
  onSuccessRegister: () => void
): Promise<UserCredential | null> => {
  try {
    const provider = new GoogleAuthProvider();
    return handleLoginWithProvider(provider, onSuccessLogin, onSuccessRegister);
  } catch (error: any) {
    console.error("Google login error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      console.log("User closed the popup");
    } else {
      alert(`Login failed: ${error.message}`);
    }
    return null;
  }
};

// export const handleFacebookLogin = async (
//   onSuccessLogin: () => void,
//   onSuccessRegister: () => void
// ): Promise<UserCredential | null> => {
//   try {
//     const provider = new FacebookAuthProvider();
//     return handleLoginWithProvider(provider, onSuccessLogin, onSuccessRegister);
//   } catch (error: any) {
//     console.error("Facebook login error:", error);
//     if (error.code === "auth/popup-closed-by-user") {
//       console.log("User closed the popup");
//     } else {
//       alert(`Login failed: ${error.message}`);
//     }
//     return null;
//   }
// };

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  try {
    await checkIfUserRegistered(email);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      await sendEmailVerification(auth.currentUser)
    }

    const userData: UserProfile = {
      uid: user.uid,
      name,
      email,
      createdAt: Math.floor(Date.now() / 1000),
      lastActive: Math.floor(Date.now() / 1000),
      statistics: {
        vehiclesOwned: 0,
        eventsAttended: 0,
        eventsHosted: 0,
      },
      socials: {},
      vehicleIds: [],
      eventHostedIds: [],
      eventAttendedIds: [],
    };

    await createUser(user.uid, userData);
  } catch (err: any) {
    if (err.code === CUSTOM_ERROR_CODES.EMAIL_IN_USE) {
      err.message = "Email is already Registerred. Try to Login"
    }
    console.error("Failed to create User", ("code" in err ? err.code : err.message));
    throw err;
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    if (err.code === CUSTOM_ERROR_CODES.INVALID_CREDENTIALS) {
      err.message = "Invalid Credentials"
    }
    console.error("Failed to login user",  ("code" in err ? err.code : err.message));
    throw err;
  }
};

export const updateUserPassword = async (
  newPassword: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Could not find user");
    }

    await updatePassword(currentUser, newPassword);
  } catch (err) {
    console.error("Failed to update Password", err);
    throw err;
  }
};