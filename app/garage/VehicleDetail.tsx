"use client";
import { faBolt, faClose, faCogs, faPen, faTachometerAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { User } from "firebase/auth";
import { VEHICLE_ICON_MAP } from "../constants/variables";
import { useDeleteVehicle, useFetchVehicle } from "../hooks/vehicleHooks";
import Loader from "../_components/Loader";
import ConfirmDialog from "../_components/ConfirmDialog";
import NewVehicleModal from "./NewVehicleModal";

type VehicleDetailProps = {
  isVisible: boolean;
  currentUser: User | undefined | null;
  vehicleId: string;
  onClose: () => void;
  onVehicleDelete?: (vehicleId: string) => void;
};

const VehicleDetail = ({ vehicleId, isVisible, currentUser, onClose, onVehicleDelete }: VehicleDetailProps) => {
  const modalBGRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { data: vehicle, isLoading: isFetchingVehicleData, isError: isVehicleFetchingError } = useFetchVehicle(vehicleId);
  const { mutate: deleteVehicle, isPending: isPendingDelete } = useDeleteVehicle();

  const handleEditClick = () => {
    setShowUpdateModal(true)
  }

  const handleDeleteClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmDelete = () => {
    if (showConfirmModal) {
      setShowConfirmModal(false);
    }

    const vehicleId = vehicle?.id;
    if (!vehicleId) {
      return;
    }

    deleteVehicle(
      { vehicleId }, {
      onSuccess: () => onClose(),
      onError: (err) => {
        alert('Failed to Delete Vehicle. Try Again')
      }
    }
    );
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();

      if (isVisible && e.target === modalBGRef.current) {
        onClose();
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isVisible]);

  if (!vehicle) {
    return <></>;
  }

  const {
    make,
    model,
    trim,
    year,
    description,
    images,
    modDescription,
    power,
    torque,
    speed,
    isModified,
    ownerId,
    type
  } = vehicle;

  const isOwner = ownerId === currentUser?.uid;

  return (
    <div
      className="fixed xl:absolute top-0 left-0 h-full w-full xl:px-20 xl:py-5 z-50 bg-black/80"
      ref={modalBGRef}
    >
      <div className="relative bg-slate-100 rounded-lg flex flex-col px-4 py-3 xl:px-10 xl:py-5 w-full h-full gap-5 overflow-auto">
        <div className="flex justify-end gap-3">
          {isOwner &&
            <>
              <button
                className="w-8 xl:w-10 aspect-square rounded-full bg-amber-300/90 text-gray-900 flex justify-center items-center hover:scale-125 hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer"
                onClick={handleEditClick}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button
                className="w-8 xl:w-10 aspect-square rounded-full bg-amber-300/90 text-gray-900 flex justify-center items-center hover:scale-125 hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer"
                onClick={handleDeleteClick}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </>
          }
          <button
            className="w-8 xl:w-10 aspect-square rounded-full bg-slate-800/80 text-slate-100 flex justify-center items-center hover:scale-125 hover:bg-slate-800/100 transition-all duration-300 ease-in-out cursor-pointer"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-5 xl:gap-10 w-full border-1">
          {
            (images && images.length > 0) ?
              <div className="w-full xl:w-1/3 h-30 xl:h-72 relative">
                <Image
                  src={images[0]}
                  alt="car"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                />
              </div>
              :
              <div className="w-full xl:w-1/3 h-30 xl:h-72 text-gray-600 flex justify-center items-center z-20 relative text-9xl xl:text-[14rem]">
                <FontAwesomeIcon icon={VEHICLE_ICON_MAP[type]} />
              </div>
          }

          <div className="w-full xl:w-2/3 flex flex-col items-center xl:items-start gap-1 xl:gap-5">
            <div className="flex gap-1 xl:gap-2 justify-center xl:justify-start items-end">
              <div className="text-gray-800 font-bold text-xl xl:text-2xl">{make}</div>
              <div className="text-gray-800 font-bold text-xl xl:text-2xl">{model}</div>
              <div className="text-gray-800/80 font-bold text-base xl:text-lg">{trim}</div>
            </div>
            <div className="text-gray-800 font-bold text-xl mb-5 xl:mb-0 flex gap-1">
              <span className="hidden xl:inline-block">Year:</span>
              {year}
            </div>
            {
              !!power && !!torque && !!speed &&
              <div className="flex xl:flex-col gap-2 xl:gap-5 justify-between w-full">
                {
                  !!power &&
                  <div className="text-gray-800 font-bold text-xl flex flex-col xl:flex-row gap-1 flex-1 items-center border-r border-gray-900/50 xl:border-none">
                    <div className="hidden xl:block">Power:</div>
                    <div className="xl:hidden"><FontAwesomeIcon icon={faCogs} /></div>
                    <div>{power} Hp</div>
                  </div>
                }
                {
                  !!torque &&
                  <div className="text-gray-800 font-bold text-xl flex flex-col xl:flex-row gap-1 flex-1 items-center border-r border-gray-900/50 xl:border-none">
                    <div className="hidden xl:block">Torque:</div>
                    <div className="xl:hidden"><FontAwesomeIcon icon={faBolt} /></div>
                    <div>{torque} Nm</div>
                  </div>
                }
                {
                  !!speed &&
                  <div className="text-gray-800 font-bold text-xl flex flex-col xl:flex-row gap-1 flex-1 items-center">
                    <div className="hidden xl:block">0 - 100 kmph:</div>
                    <div className="xl:hidden"><FontAwesomeIcon icon={faTachometerAlt} /></div>
                    <div>{speed} s<span className="hidden xl:inline-block">econds</span></div>
                  </div>
                }
              </div>
            }
            <div className="text-gray-800 font-bold text-base xl:text-xl">Stock / Modified: {isModified ? 'Modified' : 'Stock'}</div>
          </div>
        </div>

        <div className="flex flex-col w-full gap-5 px-2 xl:px-10 py-2">
          <div className="flex flex-col gap-2">
            <div className="text-gray-800 font-bold text-lg">Description</div>
            <div className="text-gray-800 text-sm">{description}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-800 font-bold text-lg">Modifications</div>
            {modDescription ? (
              <div className="text-gray-800 text-sm">
                {modDescription.split("\n").map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">No Modifications</div>
            )}
          </div>
        </div>

        {isPendingDelete &&
          <div className="fixed top-0 left-0 w-full h-full bg-black/80">
            <Loader message="Removing Vehicle from Garage" />
          </div>
        }

        <ConfirmDialog
          message={"Are you sure you want to delete?"}
          isVisible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => handleConfirmDelete()}
          onDecline={() => setShowConfirmModal(false)}
        />
      </div>

      <NewVehicleModal
        isVisible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        currentUser={currentUser}
        operation="update"
        initialValues={vehicle}
      />
    </div>
  );
};

export default VehicleDetail;
