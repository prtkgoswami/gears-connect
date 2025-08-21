"use client"
import { useEffect, useState } from "react";
import Loader from "../_components/Loader";
import { useUpdateUser } from "../hooks/userHooks";
import { UserProfile } from "../types/models";

type EditProfileFormProps = {
    isLoadingUserData: boolean;
    profileData?: UserProfile;
    userId?: string;
}

const EditProfileForm = ({ userId, profileData, isLoadingUserData }: EditProfileFormProps) => {
    const [inEditMode, setInEditMode] = useState(false)
    const [formData, setFormData] = useState<Partial<UserProfile>>()
    const { mutate: updateUser, isPending: isPendingUserUpdate } = useUpdateUser();

    const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId) {
            return;
        }

        // Update User Data
        const updatedData = { ...formData };
        updateUser(
            {
                userId,
                data: updatedData
            },
            {
                onSuccess: () => {
                    setInEditMode(false);
                    alert("User has been updated");
                },
                onError: () => {
                    alert("Failed to update user. Try again!")
                }
            }
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split(".");

        setFormData((prev: any) => {
            const updated = { ...prev };
            let curr: any = updated;

            // walk down object path except last key
            for (let i = 0; i < keys.length - 1; i++) {
                curr[keys[i]] = { ...curr[keys[i]] };
                curr = curr[keys[i]];
            }
            curr[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    useEffect(() => {
        if (profileData) {
            setFormData({
                ...profileData
            })
        }
    }, [profileData])

    if (!profileData || !userId) {
        return <></>
    }

    if (isLoadingUserData && !profileData) {
        return <Loader message="Loading User Profile" />
    }


    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(formData)

    return (
        <div className="flex flex-col gap-2 w-full xl:w-1/2 mb-10 px-5 xl:px-0">
            <p className="text-xl text-amber-300 p-2 border-b-2 border-amber-300 mb-4">Profile Information</p>
            <form className="flex flex-col gap-5" onSubmit={handleUpdateSubmit}>
                <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                    <p>User ID:</p>
                    <input
                        type="text"
                        name="uid"
                        value={userId ?? ""}
                        disabled
                        className="px-2 py-1 rounded-sm flex-1" />
                </label>
                <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                    <p>Name:</p>
                    <input
                        type="text"
                        name="name"
                        className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : 'border-b'}`}
                        onChange={handleChange}
                        value={formData?.name ?? ""}
                        disabled={!inEditMode} />
                </label>
                <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                    <p>Email:</p>
                    <input
                        type="text"
                        name="email"
                        className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : 'border-b'}`}
                        onChange={handleChange}
                        value={formData?.email ?? ""}
                        disabled={!inEditMode} />
                </label>
                <label className="flex flex-col gap-2 px-2">
                    <p>Description:</p>
                    <textarea
                        name="description"
                        maxLength={500}
                        rows={5}
                        style={{ resize: 'none' }}
                        className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : ''}`}
                        onChange={handleChange}
                        value={formData?.description ?? ""}
                        disabled={!inEditMode} />
                </label>

                <div className="text-xl text-amber-300 p-2 border-b-2 border-amber-300 mb-4">Socials</div>
                {
                    (!!formData?.socials?.facebook || inEditMode) &&
                    <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                        <p>Facebook:</p>
                        <input
                            type="text"
                            name="socials.facebook"
                            className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : 'border-b'}`}
                            onChange={handleChange}
                            value={formData?.socials?.facebook ?? ""}
                            disabled={!inEditMode} />
                    </label>
                }
                {
                    (!!formData?.socials?.instagram || inEditMode) &&
                    <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                        <p>Instagram:</p>
                        <input
                            type="text"
                            name="socials.instagram"
                            className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : 'border-b'}`}
                            onChange={handleChange}
                            value={formData?.socials?.instagram ?? ""}
                            disabled={!inEditMode} />
                    </label>
                }
                {
                    (!!formData?.socials?.youtube || inEditMode) &&
                    <label className="flex flex-col xl:flex-row gap-2 xl:gap-5 xl:items-center px-2">
                        <p>Youtube:</p>
                        <input
                            type="text"
                            name="socials.youtube"
                            className={`px-2 py-1 flex-1 border-slate-100/30 ${inEditMode ? 'border-1 rounded-sm' : 'border-b'}`}
                            onChange={handleChange}
                            value={formData?.socials?.youtube ?? ""}
                            disabled={!inEditMode} />
                    </label>
                }

                <div className="flex justify-end gap-2 items-center mt-5">
                    <button
                        className={`flex-1 cursor-pointer transition-colors duration-150 ease-in-out text-gray-900 ${inEditMode ? 'bg-gray-400 hover:bg-gray-300' : 'bg-amber-300 hover:bg-amber-400'} shadow-lg px-8 py-2 rounded-lg text-lg`}
                        onClick={(e) => {
                            e.preventDefault();
                            setInEditMode(prev => !prev);
                        }}>
                        {inEditMode ? "Cancel" : "Edit"}
                    </button>
                    <button
                        type="submit"
                        disabled={!hasChanges || !inEditMode}
                        className="flex-1 bg-amber-300 text-gray-900 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-amber-400 shadow-lg px-8 py-2 rounded-lg text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Update
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProfileForm;