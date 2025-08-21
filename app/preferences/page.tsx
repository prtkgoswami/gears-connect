"use client"
import Loader from "../_components/Loader";
import { useAuth } from "../hooks/authHooks";
import { useFetchUser } from "../hooks/userHooks";
import EditProfileForm from "./EditProfileForm";

const PreferencesPage = () => {
    const { isLoading: isAuthLoading, currentUser, isLoggedIn } = useAuth();
    const userId = currentUser?.uid
    const { data: profileData, isLoading: isLoadingUserData, isError: isUserFetchError } = useFetchUser(userId)

    if(isAuthLoading) {
        return <Loader message="Checking Authorization..." />
    }

    return (
        <div className="w-full min-h-100 flex flex-col gap-5 items-center">
            <h1 className="text-xl xl:text-3xl text-amber-300 uppercase select-none text-center leading-relaxed mb-4 xl:mb-5">
                Preferences
            </h1>

            <EditProfileForm userId={userId} profileData={profileData} isLoadingUserData={isLoadingUserData} />
        </div>
    )
}

export default PreferencesPage;