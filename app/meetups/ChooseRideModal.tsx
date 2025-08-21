"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCheck, faCar } from "@fortawesome/free-solid-svg-icons";
import { Meetup, Participant, UserProfile, Vehicle } from "../types/models";
import { arrayUnion, collection, doc, documentId, getDoc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User } from "firebase/auth";
import { VEHICLE_ICON_MAP } from "../constants/variables";
import { useFetchVehicles } from "../hooks/vehicleHooks";
import { useUpdateMeetup } from "../hooks/meetupHooks";
import { updateUser } from "../services/firebase/userUtils";
import Loader from "../_components/Loader";

type ChooseRideModalProps = {
    isVisible: boolean;
    meetup: Meetup;
    currentUser: User | null | undefined;
    onClose: () => void;
}

const ChooseRideModal = ({ isVisible, meetup, currentUser, onClose }: ChooseRideModalProps) => {
    const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
    const { data: vehicleList, isLoading, isError } = useFetchVehicles(currentUser?.uid)
    const { mutate: updateMeetup, isPending } = useUpdateMeetup(() => {
        updateUser(currentUser?.uid ?? '', {
            "statistics.eventsAttended": increment(1),
            eventAttendedIds: arrayUnion(meetup.id)
        })
        onClose();
    },

    )

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicles(prev => {
            const isSelected = prev.some(v => v.make === vehicle.make && v.model === vehicle.model && v.trim === vehicle.trim);
            if (isSelected) {
                // Remove vehicle if already selected
                return prev.filter(v => !(v.make === vehicle.make && v.model === vehicle.model && v.trim === vehicle.trim));
            } else {
                // Add vehicle if not selected
                return [...prev, vehicle];
            }
        });
    };

    const handleConfirmSelection = async () => {
        if (!currentUser) {
            return;
        }
        const newParticipantData: Participant = {
            userId: currentUser.uid,
            username: currentUser.displayName ?? '',
            status: "confirmed",
            vehicles: selectedVehicles.map((
                { id, make, model, trim }) => ({ id, name: `${make} ${model} ${trim}` })),
            joinedAt: Math.floor(Date.now() / 1000)
        }
        updateMeetup({
            meetupId: meetup.id,
            data: {
                participants: arrayUnion(newParticipantData)
            }
        });
    };

    const isVehicleSelected = (vehicle: Vehicle) => {
        return selectedVehicles.some(v => v.make === vehicle.make && v.model === vehicle.model && v.trim === vehicle.trim);
    };

    if (!isVisible) {
        return <></>
    }

    return (
        <div className="z-50 absolute top-0 left-0 h-full w-full flex justify-center items-center p-10">
            <div className="bg-gray-800 p-5 rounded-lg w-2/3">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-2xl text-white">Select Vehicles for the Meetup</p>
                    <div className="rounded-full text-white bg-transparent border border-white w-8 aspect-square flex justify-center items-center cursor-pointer transition-transform duration-150 ease-in-out hover:scale-110" onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} />
                    </div>
                </div>
                {(vehicleList && vehicleList.length > 0) ?
                    <div className="grid grid-cols-4 gap-4">
                        {vehicleList.map((vehicle, i) => {
                            const isSelected = isVehicleSelected(vehicle);
                            return (
                                <div
                                    key={i}
                                    className={`flex flex-col gap-y-2 w-full p-5 rounded-md transition-all duration-150 ease-in-out cursor-pointer group border-2 ${isSelected
                                        ? 'bg-amber-300/20 border-amber-300 shadow-lg'
                                        : 'bg-slate-100/0 border-transparent hover:bg-slate-100/10 hover:border-amber-300'
                                        }`}
                                    onClick={() => handleVehicleClick(vehicle)}
                                >
                                    <div className="relative w-full h-50 transition-transform duration-150 ease-out group-hover:scale-105">
                                        {vehicle.images && vehicle.images.length > 0 ?
                                            <Image
                                                src={vehicle.images[0]}
                                                alt={`${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
                                                layout="fill"
                                                objectFit="contain"
                                                objectPosition="center"
                                                style={{ zIndex: 20 }}
                                            /> :
                                            <div className="h-full w-full text-gray-300 flex justify-center items-center z-20 relative" style={{ fontSize: '8rem' }}>
                                                <FontAwesomeIcon icon={VEHICLE_ICON_MAP[vehicle.type]} />
                                            </div>
                                        }
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 z-30 bg-amber-300 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                                <FontAwesomeIcon icon={faCheck} className="text-sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-end gap-x-2 gap-y-1 flex-wrap justify-center">
                                            <p className={`font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>{vehicle.make}</p>
                                            <p className={`font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>{vehicle.model}</p>
                                            <p className={`opacity-80 ${isSelected ? 'text-amber-300/80' : 'text-white/80'}`}>{vehicle.trim}</p>
                                        </div>
                                        <p className={`font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>{vehicle.year}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div> :
                    <div className="flex flex-1 justify-center items-center text-gray-400 leading-relaxed font-semibold py-10">You don&apos;t have any Vehicles yet</div>
                }

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleConfirmSelection}
                        className={`px-4 py-2 text-gray-800 rounded-md ${selectedVehicles.length > 0 ? 'bg-amber-300 hover:bg-amber-400' : `bg-gray-400`} transition-colors duration-150 ease-in-out font-semibold`}
                        disabled={selectedVehicles.length === 0}
                    >
                        Confirm Selection ({selectedVehicles.length} vehicles)
                    </button>
                </div>

                {isPending &&
                    <div className="fixed top-0 left-0 h-full w-full bg-black/80 z-50">
                        <Loader message="Adding your Participation" />
                    </div>
                }
            </div>
        </div>
    )
}

export default ChooseRideModal;