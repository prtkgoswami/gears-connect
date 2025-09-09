import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "../types/models";
import {
  updateUser,
} from "../services/firebase/userUtils";
import { fetchUser } from "../lib/api";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<UserProfile>;
    }) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useFetchUser = (userId: string | undefined, options?: object) => {
  return useQuery<UserProfile>({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId!), // safe because enabled only when userId exists
    enabled: !!userId,
    ...options,
  });
};