"use client"
import { useEffect, useState } from "react";
import GarageItem from "../../garage/GarageItem";
import VehicleDetail from "../../garage/VehicleDetail";
import { useAuth } from "../../hooks/authHooks";
import Loader from "../../_components/Loader";
import { useRouter } from "next/navigation";
import { ROUTES } from "../../constants/path";
import { UserProfile, Vehicle } from "../../types/models";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { User } from "firebase/auth";
import { collection, doc, documentId, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import GarageSection from "./GarageSection";
import EventsSection from "./EventsSection";
import { useFetchUser } from "@/app/hooks/userHooks";

type ProfileProps = {
    uid?: string;
}

const Profile = ({ uid }: ProfileProps) => {
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [activeVehicle, setActiveVehicle] = useState<Vehicle | undefined>(undefined);
    const { isLoading: isAuthLoading, currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const userId = uid ?? currentUser?.uid
    const {
        data: profileData,
        isLoading: isLoadingProfile,
        isError: isProfileFetchError,
        error: profileFetchError
    } = useFetchUser(userId, {
        enabled: !!userId
    });

    const handleVehicleClick = (vehicle: Vehicle) => {
        setActiveVehicle(vehicle);
    }

    const handleDetailCloseClick = () => {
        setActiveVehicle(undefined);
    }

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.push(ROUTES.root);
        }
    }, [isLoggedIn, currentUser, isAuthLoading])

    if (isAuthLoading) {
        return <Loader message="Checking Authorization..." />
    }

    if (isLoadingProfile) {
        return <Loader message="Fetching User Profile..." />
    }

    return (
        <div className="w-full min-h-100 flex flex-col gap-5 px-2 xl:px-15">
            <div className="flex px-5 gap-5 flex-wrap mt-5 xl:mt-0">
                <div className="flex flex-col gap-2 xl:p-10 w-full xl:w-2/3">
                    <p className="text-4xl">{profileData?.name}</p>
                    <p className="py-4 xl:py-8">{profileData?.description}</p>
                    {profileData?.socials && Object.values(profileData?.socials).some(Boolean) &&
                        <>
                            <div className="w-full border border-slate-100/20"></div>
                            <div className="text-amber-300 font-semibold text-lg mb-5">Socials</div>
                            <div className="flex items-center gap-4 text-4xl">
                                {profileData?.socials.facebook && <Link className="text-slate-50 hover:text-amber-300 transition-colors duration-300 ease-in-out" href={profileData?.socials.facebook} target="_blank"><FontAwesomeIcon icon={faFacebook} /></Link>}
                                {profileData?.socials.instagram && <Link className="text-slate-50 hover:text-amber-300 transition-colors duration-300 ease-in-out" href={profileData?.socials.instagram} target="_blank"><FontAwesomeIcon icon={faInstagram} /></Link>}
                                {profileData?.socials.youtube && <Link className="text-slate-50 hover:text-amber-300 transition-colors duration-300 ease-in-out" href={profileData?.socials.youtube} target="_blank"><FontAwesomeIcon icon={faYoutube} /></Link>}
                            </div>
                        </>
                    }
                </div>
                <div className="flex flex-col justify-start gap-2 xl:gap-5 xl:px-5 xl:border-l border-slate-100/20 flex-1 xl:p-10">
                    <div className="w-full border border-slate-100/20 xl:hidden"></div>
                    <p className="leading-relaxed text-lg xl:text-2xl text-amber-300 font-semibold xl:font-normal">Statistics</p>
                    <div className="flex xl:flex-col xl:gap-2">
                        <div className="flex flex-col xl:flex-row gap-2 py-2 text-center px-5">
                            <p>Vehicles Owned: </p>
                            <p>{profileData?.statistics.vehiclesOwned}</p>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-2 py-2 text-center px-5">
                            <p>Events Attended: </p>
                            <p>{profileData?.statistics.eventsAttended}</p>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-2 py-2 text-center px-5">
                            <p>Events Hosted: </p>
                            <p>{profileData?.statistics.eventsHosted}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-2 xl:px-10">
                <div className="w-full border border-slate-100/20"></div>
            </div>
            {/* Accordian Sections */}
            <div className="flex flex-col gap-5 px-4 xl:px-10">
                <div>
                    <GarageSection userId={currentUser?.uid} onVehicleClick={handleVehicleClick} />
                </div>
                <div>
                    <EventsSection eventIds={profileData?.eventAttendedIds} sectionTitle="Events Attended" />
                </div>
                <div className="mb-10">
                    <EventsSection eventIds={profileData?.eventHostedIds} sectionTitle="Events Hosted" />
                </div>
            </div>

            {/* <VehicleDetail vehicle={activeVehicle} onClose={handleDetailCloseClick} isVisible={activeVehicle !== undefined} currentUser={currentUser} /> */}
        </div>
    )
}

export default Profile;