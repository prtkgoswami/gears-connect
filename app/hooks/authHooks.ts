import { useMutation } from "@tanstack/react-query";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  forgotPassword,
  loginUser,
  registerUser,
  updateUserPassword,
} from "../services/firebase/authUtils";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    currentUser,
    isLoading,
    isLoggedIn: !!currentUser,
  };
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      password: string;
      email: string;
    }) => {
      await registerUser(name, email, password);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      password: string;
      email: string;
    }) => {
      await loginUser(email, password);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      await updateUserPassword(password);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async({email}: {email: string}) => {
      await forgotPassword(email)
    }
  })
}
