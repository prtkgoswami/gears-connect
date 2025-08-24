"use client"
import { useEffect, useRef, useState } from "react";
import Loader from "../_components/Loader";
import { useUpdateUser } from "../hooks/userHooks";
import { UserProfile } from "../types/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPen, faSave } from "@fortawesome/free-solid-svg-icons";

type EditProfileFormProps = {
    isLoadingUserData: boolean;
    profileData?: UserProfile;
    userId?: string;
}

const EditProfileForm = ({ userId, profileData, isLoadingUserData }: EditProfileFormProps) => {
    const [inEditMode, setInEditMode] = useState(false)
    const [formData, setFormData] = useState<Partial<UserProfile>>()
    const { mutate: updateUser, isPending: isPendingUserUpdate } = useUpdateUser();
    const formRef = useRef<HTMLFormElement>(null);

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
        <div className="flex flex-col gap-2 w-full xl:w-1/2 px-5 lg:px-0">
            <div className="flex justify-between items-center p-2 border-b-2 border-amber-300">
                <div className="text-xl text-amber-300 uppercase select-none leading-relaxed">
                    Profile <span className="hidden lg:inline-block">Preferences</span>
                </div>
                {inEditMode ?
                    <div className="flex items-center gap-4 lg:gap-2">
                        <button
                            className="w-10 lg:w-8 aspect-square rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-800 bg-amber-300 hover:bg-amber-400"
                            onClick={() => {
                                if (formRef.current) {
                                    formRef.current.submit();
                                }
                            }}>
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                            className="w-10 lg:w-8 aspect-square rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-100 bg-gray-500 hover:bg-gray-600"
                            onClick={() => {
                                setInEditMode(false);
                            }}>
                            <FontAwesomeIcon icon={faClose} />
                        </button>
                    </div>
                    :
                    <button
                        className="w-10 lg:w-8 aspect-square rounded-full cursor-pointer transition-colors duration-200 ease-in-out text-gray-800 bg-amber-300 hover:bg-amber-400"
                        onClick={() => {
                            setInEditMode(true);
                        }}>
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                }
            </div>
            <div className="px-2">
                <div className="flex flex-col gap-2 lg:px-0">
                    <p className="text-xl text-amber-300 my-2">Profile Information</p>
                    <form onSubmit={handleUpdateSubmit} ref={formRef}>
                        <div className="flex flex-col gap-5 mb-5">
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
                                {
                                    inEditMode ?
                                        <textarea
                                            name="description"
                                            maxLength={500}
                                            rows={5}
                                            style={{ resize: 'none' }}
                                            className={`px-2 py-1 flex-1 border-slate-100/30 border-1 rounded-sm`}
                                            onChange={handleChange}
                                            value={formData?.description ?? ""}
                                        />
                                        :
                                        <div className="px-2 py-1 flex-1">{formData?.description}</div>
                                }
                            </label>
                        </div>

                        <p className="text-xl text-amber-300 my-2">Socials</p>
                        <div className="flex flex-col gap-5">
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
                        </div >
                    </form >
                </div >
            </div>
        </div>
    )
}

export default EditProfileForm;