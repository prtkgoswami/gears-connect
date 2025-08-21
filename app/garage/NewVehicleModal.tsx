"use client";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Vehicle } from "../types/models";
import { User } from "firebase/auth";
import { VEHICLE_TYPES } from "../constants/variables";
import { useCreateVehicle, useUpdateVehicle } from "../hooks/vehicleHooks";
import Loader from "../_components/Loader";

type NewVehicleModalProps = {
  isVisible: boolean;
  currentUser: User | null | undefined;
  operation?: "create" | "update";
  onClose: () => void;
  initialValues?: Vehicle;
};

const NewVehicleModal = ({ isVisible, currentUser, onClose, initialValues, operation = "create" }: NewVehicleModalProps) => {
  const [showPowerStats, setShowPowerStats] = useState(initialValues?.type !== 'bicycle');
  const [isModifiedCheck, setIsModifiedCheck] = useState(initialValues?.isModified ?? false);
  const { mutate: addVehicle, isPending } = useCreateVehicle();
  const { mutate: updateVehicle, isPending: isPendingUpdate } = useUpdateVehicle();

  const handleNewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const { vehicleType, make, model, trim, year, power, speed, torque, isModified, description, modDescription } =
      data;

    if (!currentUser) {
      return;
    }

    console.log(power, speed, torque)

    const vehicleData: Omit<Vehicle, "id" | "createdAt" | "updatedAt"> = {
      ownerId: currentUser.uid ?? '',
      ownerName: currentUser.displayName ?? '',
      type: vehicleType as string ?? '',
      make: make as string ?? '',
      model: model as string ?? '',
      trim: trim as string ?? '',
      year: parseInt(year as string),
      isModified: isModifiedCheck,
      description: description as string ?? '',
      modDescription: modDescription as string ?? '',
      power: parseFloat((power ?? '0') as string),
      speed: parseFloat((speed ?? '0') as string),
      torque: parseFloat((torque ?? '0') as string),
    };

    console.log("New Vehicle Info", vehicleData)
    console.log("New Vehicle Modal", operation, initialValues)

    if (operation === "create") {
      addVehicle(
        { vehicleData },
        {
          onSuccess: () => onClose(),
          onError: () => {
            alert("Failed to Add Vehicle. Try Again")
          }
        }
      );
    } else if (operation === "update" && initialValues?.id) {
      console.log('update vehicle call', initialValues?.id, data)
      updateVehicle(
        {
          vehicleId: initialValues?.id,
          updatedData: vehicleData
        },
        {
          onSuccess: () => onClose(),
          onError: () => {
            alert("Failed to Update Vehicle. Try Again")
          }
        }
      )
    }
  };

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;
    setShowPowerStats(!(value === 'bicycle'))
  }

  useEffect(() => {
    if (!initialValues) {
      setIsModifiedCheck(false);
    }
  }, [isVisible]);

  useEffect(() => {
    setIsModifiedCheck(initialValues?.isModified ?? false);
  }, [initialValues]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="fixed xl:absolute w-full h-screen top-0 left-0 flex justify-center items-center z-50 py-5">
      <div className="bg-slate-100 rounded-lg flex flex-col gap-5 p-5 w-full h-full xl:w-3/5 xl:max-h-180 overflow-y-auto relative shadow-2xl border-2 border-gray-900">
        <div className="flex justify-between items-center text-slate-800">
          <p className="font-bold select-none">{operation === "create" && "Add New Vehicle"}</p>
          <div
            className="hover:scale-110 transition-transform duration-100 ease-out cursor-pointer"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faClose} />
          </div>
        </div>
        <form
          onSubmit={handleNewSubmit}
          className="flex flex-col gap-5 xl:gap-2 text-slate-800"
        >
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Vehicle Type</div>
            <select name="vehicleType" required
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              onChange={handleTypeSelect}
              defaultValue={initialValues?.type}>
              <option value="" disabled selected hidden>Select a type</option>
              {VEHICLE_TYPES.map((type) =>
                <option key={`vehicle-type-${type}`} value={type} className="capitalize">{type}</option>
              )}
            </select>
          </label>
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Make</div>
            <input type="string" name="make"
              placeholder="eg. BMW / Mercedes / Honda"
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              defaultValue={initialValues?.make} />
          </label>
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Model</div>
            <input
              type="text"
              placeholder="eg. Mustang / Golf / Civic"
              name="model"
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              defaultValue={initialValues?.model}
            />
          </label>
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Trim</div>
            <input
              type="text"
              placeholder="eg. GT / GTI / Type R"
              name="trim"
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              defaultValue={initialValues?.trim}
            />
          </label>
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Year</div>
            <input
              type="text"
              placeholder="eg. 2018 / 2025"
              name="year"
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              defaultValue={initialValues?.year}
            />
          </label>
          <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
            <div className="text-sm xl:text-base">Images</div>
            <input
              type="file"
              accept="image/*"
              name="images[]"
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
              multiple
            />
          </label>
          {showPowerStats && <div className="flex flex-col xl:flex-row gap-2 w-full">
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-sm xl:text-base">Power (Hp)</div>
              <input
                type="text"
                name="power"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm w-full"
                defaultValue={initialValues?.power ?? '0'}
              />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-sm xl:text-base">Torque (Nm)</div>
              <input
                type="text"
                name="torque"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm w-full"
                defaultValue={initialValues?.torque ?? '0'}
              />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-sm xl:text-base">0 - 100 kmph (s)</div>
              <input
                type="text"
                name="speed"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm w-full"
                placeholder=""
                defaultValue={initialValues?.speed ?? '0'}
              />
            </label>
          </div>}
          <label className="flex flex-col gap-1 xl:gap-2">
            <div className="text-sm xl:text-base">Description (600 chars)</div>
            <textarea
              maxLength={600}
              cols={5}
              rows={8}
              className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
              name="description"
              defaultValue={initialValues?.description}
            />
          </label>
          <label className="flex gap-2 items-center">
            Is the Vehicle Modified?
            <input
              type="checkbox"
              name="isModified"
              onChange={(e) => {
                setIsModifiedCheck(e.currentTarget.checked);
              }}
              checked={isModifiedCheck}
              defaultChecked={isModifiedCheck}
            />
          </label>
          {isModifiedCheck && (
            <label className="flex flex-col gap-1 xl:gap-2">
              <div className="text-sm xl:text-base">Modifications (500 chars)</div>
              <textarea
                maxLength={500}
                cols={5}
                rows={8}
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
                name="modDescription"
                placeholder={`eg.\nItem1\nItem2\nItem3\n...`}
                defaultValue={initialValues?.modDescription}
              />
            </label>
          )}
          <input
            type="submit"
            value={operation === "update" ? "Update Vehicle Info" : "Add to Garage"}
            className="p-2 rounded-sm bg-amber-300 text-slate-800 mt-5 cursor-pointer hover:bg-amber-400 transition-colors duration-150 ease-in-out"
          />
        </form>


        {isPending &&
          <div className="fixed top-0 left-0 w-full h-full bg-black/80">
            <Loader message="Adding Vehicle from Garage" />
          </div>
        }
        {isPendingUpdate &&
          <div className="fixed top-0 left-0 w-full h-full bg-black/80">
            <Loader message="Updating Vehicle from Garage" />
          </div>
        }
      </div>
    </div>
  );
};

export default NewVehicleModal;
