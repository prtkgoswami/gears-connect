import { useEffect, useState } from "react";
import GarageItem from "../../garage/GarageItem";
import { Vehicle } from "@/app/types/models";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { useFetchVehicles } from "@/app/hooks/vehicleHooks";
import Loader from "@/app/_components/Loader";

type GarageSectionProps = {
    userId?: string;
    onVehicleClick: (vehicle: Vehicle) => void;
}
const GarageSection = ({ userId, onVehicleClick }: GarageSectionProps) => {
    const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeType, setActiveType] = useState('');
    const {
        data: vehicleData,
        isLoading: isLoadingVehicles,
        isError: isVehicleFetchError,
        error: vehicleFetchError
    } = useFetchVehicles(userId, {
        enabled: !!userId
    });

    const onSectionClick = () => {
        setIsExpanded(prev => !prev)
    }

    const renderVehicles = () => {
        if (isLoadingVehicles) {
            return <Loader message="Loading Garage" />
        } else if (!vehicleData || vehicleData.length === 0) {
            return (
                <div className="text-gray-400 lg:text-xl leading-relaxed text-center py-4 lg:py-10 select-none">
                    No vehicles in the Garage yet
                </div>
            )
        } else {
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-center xl:gap-6 flex-wrap mt-5 xl:mt-0">
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
                    <div className="flex items-center justify-center gap-3 xl:p-5 mt-3 xl:mt-0">
                        {vehicleData.filter(({ type }) => type === activeType).map((vehicle, i) =>
                            <GarageItem key={i} vehicle={vehicle} onItemClick={onVehicleClick} />
                        )}
                    </div>
                </div>
            )
        }
    }


    useEffect(() => {
        console.log(vehicleData)
        if (vehicleData && vehicleData.length > 0) {
            const vehicleTypeList = vehicleData.map(({ type }) => type) as string[];
            const uniquevehicleTypes = [...(new Set(vehicleTypeList))];
            setVehicleTypes(uniquevehicleTypes);
            setActiveType(uniquevehicleTypes[0])
        }
    }, [vehicleData])

    return (
        <>
            <div className="flex items-center gap-2 border-b py-3 cursor-pointer xl:mb-8" onClick={onSectionClick}>
                {isExpanded ?
                    <FontAwesomeIcon icon={faCaretDown} /> :
                    <FontAwesomeIcon icon={faCaretRight} />
                }
                <div className="text-amber-300 text-xl xl:text-2xl leading-relaxed uppercase">Garage</div>
            </div>
            <div className={`transition-all origin-top duration-300 ease-out ${isExpanded ? 'scale-y-100 xl:max-h-[600px] overflow-y-auto' : 'scale-y-0 max-h-0 overflow-y-hidden'}`}>
                {renderVehicles()}
            </div>
        </>
    )
}
export default GarageSection;