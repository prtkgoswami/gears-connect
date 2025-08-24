import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Vehicle } from "../types/models";
import {
  addVehicle,
  deleteVehicle,
  fetchVehicle,
  fetchVehicles,
  updateVehicle,
} from "../services/firebase/vehicleUtils";
import { deleteImages } from "../services/cloudinary/uploadUtil";

export const useFetchVehicles = (
  userId: string | undefined,
  options?: object
) => {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles", userId],
    queryFn: () => fetchVehicles(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useFetchVehicle = (vehicleId: string) => {
  const queryClient = useQueryClient();
  return useQuery<Vehicle>({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    initialData: () => {
      return queryClient
        .getQueryData<Vehicle[]>(["vehicles"])
        ?.find((v) => v.id === vehicleId);
    },
    enabled: !!vehicleId
  });
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      updatedData,
      imageFilesToDelete
    }: {
      vehicleId: string;
      updatedData: Partial<Vehicle>;
      imageFilesToDelete: string[];
    }) => {
      if (imageFilesToDelete.length > 0) {
        await deleteImages(imageFilesToDelete)
      }
      await updateVehicle(vehicleId, updatedData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      vehicleData,
    }: {
      vehicleData: Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
    }) => addVehicle(vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId }: { vehicleId: string }) =>
      deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};
