"use client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import GarageItem from "./GarageItem";
import VehicleForm from "./VehicleForm";
import VehicleDetail from "./VehicleDetail";
import { useAuth } from "../hooks/authHooks";
import { useRouter } from "next/navigation";
import Loader from "../_components/Loader";
import { ROUTES } from "../constants/path";
import { Vehicle } from "../types/models";
import { useFetchVehicles } from "../hooks/vehicleHooks";
import TitleText from "../_components/TitleText";

const Garage = () => {
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | undefined>(undefined);
  const [activeType, setActiveType] = useState('');
  const { isLoading: isAuthLoading, currentUser, isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isVehicleFetchError,
    error: vehicleFetchError
  } = useFetchVehicles(currentUser?.uid, {
    enabled: !!currentUser?.uid
  });

  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  const handleModalCloseClick = () => {
    setShowAddModal(false);
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setActiveVehicle(vehicle);
  }

  const handleDetailCloseClick = () => {
    setActiveVehicle(undefined);
  }

  const renderVehicleList = () => {
    if (isLoadingVehicles) {
      return <Loader message="Loading Vehicles..." />;
    } else if (!vehicles || vehicles.length === 0 || isVehicleFetchError) {
      return (
        <div className="text-gray-400 text-xl leading-relaxed text-center mb-20 flex-1 flex justify-center items-center">
          No vehicles in the Garage yet
          <>{isVehicleFetchError && alert('Failed to Fetch Vehicles. Please try again!')}</>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex justify-center xl:gap-6 flex-wrap">
            {vehicleTypes.map((type, typeIndex) => (
              <div
                key={`vehicle-type-${type}`}
                className="flex justify-center xl:gap-6">
                <div
                  className={`capitalize ${type === activeType ? 'text-amber-300 hover:text-amber-400' : 'text-gray-500 hover:text-gray-300'} text-xl xl:text-2xl leading-relaxed font-semibold transition-colors ease-in-out duration-300 select-none cursor-pointer text-center ${typeIndex < vehicleTypes.length - 1 ? 'border-r border-gray-600' : ''} px-2 xl:border-none`}
                  onClick={() => setActiveType(type)}>
                  {type}
                </div>
                {typeIndex < vehicleTypes.length - 1 && <div className="hidden xl:block h-full border border-gray-600"></div>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 p-8 xl:p-5">
            {vehicles.filter(({ type }) => type === activeType).map((vehicle, i) => (
              <GarageItem key={i} vehicle={vehicle} onItemClick={handleVehicleClick} />
            ))}
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push(ROUTES.root);
    }
  }, [isLoggedIn, currentUser, isAuthLoading])

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const vehicleTypeList = vehicles.map(({ type }) => type) as string[];
      const uniquevehicleTypes = [...(new Set(vehicleTypeList))];
      setVehicleTypes(uniquevehicleTypes);
      setActiveType(uniquevehicleTypes[0])
    }
  }, [vehicles])

  if (isAuthLoading) {
    return <Loader message="Checking Authorization..." />
  }

  return (
    <>
      <div className="w-full min-h-100 flex flex-col">
        <TitleText title="My Garage" options={{className: "mb-4 xl:mb-5"}} />
        {renderVehicleList()}
      </div>

      <div
        className="fixed bottom-10 right-10 bg-amber-300/80 text-gray-900 rounded-md p-2 text-3xl transition-all ease-in-out duration-150 hover:bg-amber-300/100 hover:scale-110 cursor-pointer"
        onClick={handleAddNewClick}
      >
        <FontAwesomeIcon icon={faPlus} />
      </div>

      <VehicleForm
        isVisible={showAddModal}
        onClose={handleModalCloseClick}
        currentUser={currentUser}
        operation="create"
      />

      {activeVehicle && <VehicleDetail
        vehicleId={activeVehicle?.id}
        onClose={handleDetailCloseClick}
        isVisible={activeVehicle !== undefined}
        currentUser={currentUser}
      />}
    </>
  );
};

export default Garage;
