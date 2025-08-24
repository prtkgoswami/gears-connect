"use client";
import { faAsterisk, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Vehicle } from "../types/models";
import { User } from "firebase/auth";
import { VEHICLE_TYPES } from "../constants/variables";
import { useCreateVehicle, useUpdateVehicle } from "../hooks/vehicleHooks";
import Loader from "../_components/Loader";
import { uploadImage } from "../services/cloudinary/uploadUtil";
import Image from "next/image";

const MAX_IMAGE_FILES = 5;

type VehicleFormProps = {
  isVisible: boolean;
  currentUser: User | null | undefined;
  operation?: "create" | "update";
  onClose: () => void;
  initialValues?: Vehicle;
};

const VehicleForm = ({ isVisible, currentUser, onClose, initialValues, operation = "create" }: VehicleFormProps) => {
  const [showPowerStats, setShowPowerStats] = useState(initialValues?.type !== 'bicycle');
  const [isModifiedCheck, setIsModifiedCheck] = useState(initialValues?.isModified ?? false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [imageFiles, setImageFiles] = useState<(string | File)[]>([...(initialValues?.images ?? [])]);
  const { mutate: addVehicle, isPending } = useCreateVehicle();
  const { mutate: updateVehicle, isPending: isPendingUpdate } = useUpdateVehicle();

  const validateInputData = (data: Record<string, any>) => {
    let isValid = true;
    if (!data.vehicleType) {
      setFormErrors(prev => ({ ...prev, type: "Vehicle Type is Required" }))
      isValid = false;
    }
    if (!data.make) {
      setFormErrors(prev => ({ ...prev, make: "Vehicle Make is Required" }))
      isValid = false;
    }
    if (!data.model) {
      setFormErrors(prev => ({ ...prev, model: "Vehicle Model is Required" }))
      isValid = false;
    }
    if (!data.year) {
      setFormErrors(prev => ({ ...prev, year: "Vehicle Year is Required" }))
      isValid = false;
    }

    // Validate Year
    const yearPattern = /^\d{4}$/;
    if (!yearPattern.test(data.year)) {
      setFormErrors(prev => ({ ...prev, year: "Vehicle Year must be a valid year" }))
      isValid = false;
    }
    const year = Number(data.year);
    if (year < 1885 || year > new Date().getFullYear()) {
      setFormErrors(prev => ({ ...prev, year: "Vehicle Year must be a valid year" }))
      isValid = false;
    }

    if (!data.description) {
      setFormErrors(prev => ({ ...prev, description: "Description is Required" }))
      isValid = false;
    }

    return isValid;
  }

  const handleNewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const {
      vehicleType,
      make,
      model,
      trim,
      year,
      power,
      speed,
      torque,
      description,
      modDescription } = data;

    if (!currentUser) {
      return;
    }

    const isValid = validateInputData(data);

    if (!isValid) {
      return;
    }

    const files = imageFiles.filter(file => typeof file === "object");
    const uploadedFiles = imageFiles.filter(file => typeof file === "string");
    let imageUrls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      imageUrls.push(url);
    }
    imageUrls = [...uploadedFiles, ...imageUrls]

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
      images: imageUrls
    };

    console.log("New Vehicle Info", vehicleData)

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
      let filesToDelete: string[] = [];
      if (initialValues.images) {
        filesToDelete = initialValues.images.filter(img => !uploadedFiles.includes(img));
      }
      updateVehicle(
        {
          vehicleId: initialValues?.id,
          updatedData: vehicleData,
          imageFilesToDelete: filesToDelete
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

  const handleRemoveImage = (image: File | string, index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;
    setShowPowerStats(!(value === 'bicycle'))
    setFormErrors(prev => {
      const { type, ...rest } = prev;
      return rest;
    })
  }

  const clearError = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.currentTarget.name;
    setFormErrors(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files)
      return;

    const newFiles = Array.from(e.target.files);
    const totalFiles = [...imageFiles, ...newFiles].slice(0, MAX_IMAGE_FILES);

    setImageFiles(totalFiles)
  }

  useEffect(() => {
    if (!initialValues) {
      setIsModifiedCheck(false);
      setIsModifiedCheck(false);
    }
    setImageFiles([]);
    setFormErrors({});
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
          <p className="font-bold select-none">{operation === "create" ? "Add New Vehicle" : `Update ${initialValues?.make} ${initialValues?.model}`}</p>
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
          noValidate
        >
          <div>
            <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
              <div className="text-sm xl:text-base flex items-start">
                Vehicle Type
                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
              </div>
              <select name="vehicleType" required
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
                onChange={handleTypeSelect}
                defaultValue={initialValues?.type ?? ""}>
                <option value="" disabled hidden>Select a type</option>
                {VEHICLE_TYPES.map((type) =>
                  <option key={`vehicle-type-${type}`} value={type} className="capitalize">{type}</option>
                )}
              </select>
            </label>
            {
              formErrors.type &&
              <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.type}</p>
            }
          </div>
          <div>
            <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
              <div className="text-sm xl:text-base flex items-start">
                Make
                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
              </div>
              <input type="string" name="make"
                placeholder="eg. BMW / Mercedes / Honda"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
                defaultValue={initialValues?.make}
                onChange={clearError}
              />
            </label>
            {
              formErrors.make &&
              <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.make}</p>
            }
          </div>
          <div>
            <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
              <div className="text-sm xl:text-base flex items-start">
                Model
                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
              </div>
              <input
                type="text"
                placeholder="eg. Mustang / Golf / Civic"
                name="model"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
                defaultValue={initialValues?.model}
                onChange={clearError}
              />
            </label>
            {
              formErrors.model &&
              <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.model}</p>
            }
          </div>
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
          <div>
            <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
              <div className="text-sm xl:text-base flex items-start">
                Year
                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
              </div>
              <input
                type="text"
                placeholder="eg. 2018 / 2025"
                name="year"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1"
                defaultValue={initialValues?.year}
                onChange={clearError}
              />
            </label>
            {
              formErrors.year &&
              <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.year}</p>
            }
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col xl:flex-row gap-1 xl:gap-2 xl:items-center">
              <div className="text-sm xl:text-base">Images</div>
              <p className={`text-sm ${imageFiles.length === MAX_IMAGE_FILES ? 'text-red-500' : 'text-gray-500'}`}>({imageFiles.length} / {MAX_IMAGE_FILES})</p>
              <input
                type="file"
                accept="image/*"
                name="images[]"
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm flex-1 cursor-pointer disabled:cursor-not-allowed"
                multiple
                onChange={handleFileInput}
                disabled={imageFiles.length >= MAX_IMAGE_FILES}
              />
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-gray-300 px-5 py-2 min-h-20 relative">
              {imageFiles.length === 0 && <p className="text-center text-sm text-gray-400 select-none">No Images Uploaded Yet.</p>}
              {imageFiles.map((image, i) => {
                let src = "";
                if (typeof image === 'object') {
                  src = URL.createObjectURL(image);
                } else {
                  src = image;
                }

                return (
                  <div key={`car-${i}`} className="relative">
                    <Image
                      src={src}
                      alt={`image-${i}`}
                      height={50}
                      width={100}
                    />
                    <button
                      className="rounded-full bg-gray-700 text-gray-100 absolute -top-1 right-0 w-5 h-5 flex justify-center items-center z-50 hover:bg-gray-800 cursor-pointer"
                      onClick={(e) => handleRemoveImage(image, i)}>
                      <FontAwesomeIcon icon={faClose} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
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
          <div>
            <label className="flex flex-col gap-1 xl:gap-2">
              <div className="text-sm xl:text-base flex items-start">
                Description (600 chars)
                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
              </div>
              <textarea
                maxLength={600}
                cols={5}
                rows={8}
                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
                name="description"
                defaultValue={initialValues?.description}
                onChange={clearError}
              />
            </label>
            {
              formErrors.description &&
              <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.description}</p>
            }
          </div>
          <label className="flex gap-2 items-center">
            Is the Vehicle Modified?
            <input
              type="checkbox"
              name="isModified"
              onChange={(e) => {
                setIsModifiedCheck(e.currentTarget.checked);
              }}
              checked={isModifiedCheck}
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

export default VehicleForm;
