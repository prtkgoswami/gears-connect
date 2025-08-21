import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "../types/models";
import {
  fetchUser,
  updateUser,
} from "../services/firebase/userUtils";

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
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
    ...options,
  });
};