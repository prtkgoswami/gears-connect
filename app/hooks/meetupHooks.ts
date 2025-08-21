import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Meetup } from "../types/models";
import {
  createMeetup,
  deleteMeetup,
  fetchMeetup,
  fetchMeetupList,
  fetchMeetups,
  updateMeetup,
} from "../services/firebase/meetupUtils";
import { updateUser } from "../services/firebase/userUtils";
import { arrayUnion, increment, UpdateData } from "firebase/firestore";

export const useFetchMeetups = () => {
  return useQuery<Meetup[]>({
    queryKey: ["meetups"],
    queryFn: async () => fetchMeetups(),
  });
};

export const useFetchMeetupList = (meetupIds: string[]) => {
  const queryClient = useQueryClient();

  return useQuery<Meetup[]>({
    queryKey: ["meetups", meetupIds],
    queryFn: async () => fetchMeetupList(meetupIds),
    initialData: () => {
      // Try to hydrate from full meetups cache
      const all = queryClient.getQueryData<Meetup[]>(["meetups"]);
      if (!all) return undefined;

      // Return only those meetups that match
      const subset = all.filter((m) => meetupIds.includes(m.id));
      return subset.length > 0 ? subset : undefined;
    },
  });
};

export const useFetchMeetup = (meetupId: string) => {
  const queryClient = useQueryClient();

  return useQuery<Meetup>({
    queryKey: ["meetups", meetupId],
    queryFn: () => fetchMeetup(meetupId),
    initialData: () => {
      return queryClient
        .getQueryData<Meetup[]>(["meetups"])
        ?.find((m) => m.id === meetupId);
    },
  });
};

type UpdateMeetupInput = {
  meetupId: string;
  data: UpdateData<Meetup>;
};

export const useUpdateMeetup = (
  customOnSuccess?: (updated: Meetup) => void
) => {
  const queryClient = useQueryClient();

  return useMutation<Meetup, Error, UpdateMeetupInput>({
    mutationFn: async ({ meetupId, data }) => {
      // assume your service returns the updated meetup
      return updateMeetup(meetupId, data);
    },
    onSuccess: (updatedMeetup) => {
      // Update in full list
      queryClient.setQueryData<Meetup[]>(["meetups"], (old = []) =>
        old.map((m) => (m.id === updatedMeetup.id ? updatedMeetup : m))
      );

      // Update single
      queryClient.setQueryData<Meetup>(
        ["meetups", updatedMeetup.id],
        updatedMeetup
      );

      // Invalidate any batch queries (["meetups", [ids]])
      queryClient.invalidateQueries({ queryKey: ["meetups"], exact: false });

      if (customOnSuccess) {
        customOnSuccess(updatedMeetup);
      }
    },
  });
};

export const useDeleteMeetup = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (meetupId) => deleteMeetup(meetupId), // Promise<void>
    onSuccess: (_, meetupId) => {
      // remove from the full list
      queryClient.setQueryData<Meetup[]>(["meetups"], (old = []) =>
        old.filter((m) => m.id !== meetupId)
      );
      // remove the single-meetup cache
      queryClient.removeQueries({
        queryKey: ["meetups", meetupId],
        exact: true,
      });
    },
  });
};

export const useCreateMeetup = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<Meetup, Error, Omit<Meetup, "id">>({
    mutationFn: createMeetup,
    onSuccess: (newMeetup) => {
      // Update full list
      queryClient.setQueryData<Meetup[]>(["meetups"], (old = []) => [
        ...old,
        newMeetup,
      ]);

      // Also seed single cache
      queryClient.setQueryData<Meetup>(["meetups", newMeetup.id], newMeetup);

      if(userId) {
        updateUser(userId, {
          "statistics.eventsHosted": increment(1),
          eventHostedIds: arrayUnion(newMeetup.id)
        })
        queryClient.invalidateQueries({ queryKey: ["users"] })
      }

    },
  });
};
