"use client"
import { useState } from "react";
import Loader from "../_components/Loader";
import { useAuth, useForgotPassword } from "../hooks/authHooks";
import { useFetchUser } from "../hooks/userHooks";
import EditProfileForm from "./EditProfileForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import TitleText from "../_components/TitleText";

const PreferencesPage = () => {
    const { isLoading: isAuthLoading, currentUser, isLoggedIn } = useAuth();
    const userId = currentUser?.uid
    const { data: profileData, isLoading: isLoadingUserData, isError: isUserFetchError } = useFetchUser(userId)
    const { mutate: resetPassword, isPending: isPendingEmailSend } = useForgotPassword();
    const [resetEmailSuccess, setResetEmailSuccess] = useState(false)

    const handleResetPasswordClick = () => {
        if (profileData && profileData.email) {
            resetPassword({
                email: profileData.email
            }, {
                onSuccess: () => {
                    setResetEmailSuccess(true);
                },
                onError: () => {
                    alert('Reset email could not be sent')
                }
            })
        }
    }

    const renderResetEmailButtonLabel = () => {
        if (isPendingEmailSend) {
            return <p className="flex gap-1 justify-center">Sending <FontAwesomeIcon icon={faSpinner} spinPulse /></p>
        }
        if (resetEmailSuccess) {
            return <>Email Sent</>
        }

        return <>Reset Password</>
    }

    if (isAuthLoading) {
        return <Loader message="Checking Authorization..." />
    }

    return (
        <div className="w-full min-h-100 flex flex-col gap-5 items-center mb-10">
            <TitleText title="Preferences" />

            <EditProfileForm userId={userId} profileData={profileData} isLoadingUserData={isLoadingUserData} />


            <div className="flex flex-col gap-2 w-full xl:w-1/2 px-5 lg:px-0">
                <div className="text-lg xl:text-xl text-amber-300 uppercase select-none leading-relaxed p-2 border-b-2 border-amber-300">
                    Authentication <span className="hidden lg:inline-block">Preferences</span>
                </div>
                <div className="px-2">
                    <div className="flex items-center gap-5">
                        <p>Change Password</p>
                        <button
                            className=" bg-amber-300 text-gray-900 py-1 px-4 rounded-md hover:bg-amber-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 cursor-pointer mt-2 flex-1"
                            onClick={handleResetPasswordClick}
                        >
                            {renderResetEmailButtonLabel()}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PreferencesPage;