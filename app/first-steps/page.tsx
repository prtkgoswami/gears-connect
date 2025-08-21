"use client"
import { faCar, faFlagCheckered, faPlus, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { ROUTES } from "../constants/path";
import { useAuth } from "../hooks/authHooks";
import Loader from "../_components/Loader";
import { useEffect, useRef, useState } from "react";
import { UserProfile } from "../types/models";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { User } from "firebase/auth";
import { APP_NAME } from "../constants/variables";
import { useUpdateUser } from "../hooks/userHooks";

const FirstSteps = () => {
    const { isLoading: isAuthLoading, currentUser, isLoggedIn } = useAuth();
    const [userData, setUserData] = useState<UserProfile>();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const { mutate: updateUser, isPending, isError, error } = useUpdateUser();

    const handleGetStarted = () => {
        if (formRef.current) {
            formRef.current.requestSubmit()
        }
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries());

        if (!currentUser) {
            throw new Error("Failed to fetch user");
        }

        const updatedData: Partial<UserProfile> = {
            name: data.name as string,
            email: data.email as string,
            description: data.desc as string,
            socials: {
                facebook: data.socialsFacebook as string,
                instagram: data.socialsInstagram as string,
                youtube: data.socialsYoutube as string
            },
        }
        updateUser({
            userId: currentUser?.uid,
            data: updatedData
        }, {
            onSuccess: () => router.push(ROUTES.garage),
            onError: (err) => () => alert("Failed to update User Profile. Try Again")
        })
    }

    const fetchUserData = async (currentUser: User) => {
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            const data = userSnap.data() as UserProfile;
            setUserData(data)
        } catch (err) {
            console.log("Failed to fetch User Data")
        }
    }

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.push(ROUTES.root);
        }

        if (currentUser) {
            void fetchUserData(currentUser);
        }
    }, [isLoggedIn, currentUser, isAuthLoading])

    if (isAuthLoading) {
        return <Loader message="Checking Authorization..." />
    }

    return (
        <div className="min-h-screen flex flex-col items-center relative">
            <div className="flex flex-col gap-10 mb-10 px-5 py-10 xl:p-15 pb-0">
                {/* Welcome */}
                <div className="text-5xl text-center xl:text-left xl:text-6xl text-slate-50/80 xl:font-semibold leading-relaxed">Welcome to {APP_NAME}!</div>
                <div className="xl:text-xl leading-relaxed">
                    You&apos;e now part of a passionate community of gearheads. Whether you are into cars,bikes, boats, planes or even bicyles, this platform is for you. Share your rides, find local meetups, and connect with fellow enthusiasts who share your passion for the drives, rides and adventure. Let&apos;s hit the roads and make some memories!
                </div>
            </div>
            <div className="flex justify-center items-center mb-10">
                <div className="flex flex-col gap-3 w-full xl:w-3/4 px-5 py-10 xl:p-10 bg-gradient-to-br from-amber-300 to-amber-400 shadow-lg xl:rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 italic text-center xl:text-left">
                        A Note from the Developer
                    </div>
                    <div className=" text-gray-900 italic leading-relaxed">
                        Hey there!<br /><br />
                        Thanks for checking out {APP_NAME}. This platform is fairly new, and I&apos;m constantly working to make it better for all car enthusiasts.<br /><br />
                        I&apos;d love to hear your feedback, ideas, or suggestions to help shape the future of this community. If you spot any issues or have thoughts on improvements, please share them — I&apos;ll do my best to address them as quickly as possible. That said, since I&apos;m still building things out, I hope you&apos;ll be patient with any bumps along the way.<br /><br />
                        You can reach me at prtkgoswami8@gmail.com<br /><br />
                        Thanks for being part of the journey and community and if you like this platform please do share it with other enthusiasts.<br />
                    </div>
                    <div className="flex justify-end text-gray-900 italic leading-relaxed">
                        — Pratik Goswami
                    </div>
                </div>
            </div>

            {/* Tutorial */}
            <div className="hidden xl:flex flex-col gap-10 mb-10">
                <div className="flex gap-10 flex-wrap">
                    <div className="flex border border-solid border-white/80 rounded-lg relative p-10">
                        <div className="absolute -top-4 left-10 px-3 bg-black">Pages</div>
                        <div className="flex flex-wrap gap-10">
                            <div>Garage</div>
                            <div>Meetup</div>
                            <div>Profile</div>
                        </div>
                    </div>


                    <div className="flex border border-solid border-white/80 rounded-lg relative p-10">
                        <div className="absolute -top-4 left-10 px-3 bg-black">Header</div>
                        <div className="flex flex-wrap gap-10">
                            <div><FontAwesomeIcon icon={faCar} /> - Garage</div>
                            <div><FontAwesomeIcon icon={faFlagCheckered} /> - Meetups</div>
                            <div><FontAwesomeIcon icon={faUser} /> - Profile</div>
                            <div><FontAwesomeIcon icon={faRightFromBracket} /> - Signout</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-5">
                    <div
                        className=" bg-amber-300/80 text-gray-900 rounded-md p-2 text-3xl"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                    <div>- This button on both Garage &amp; Meetups can be used to create a new Vehicle / Event respectively</div>
                </div>
            </div>

            {/* Form for image and verification */}
            <div className="w-full flex flex-col gap-10 mb-10 bg-gradient-to-br from-amber-300 to-amber-400 px-5 py-10 xl:p-10 items-center text-gray-900">
                <div className="w-full xl:w-2/3 flex flex-col gap-4">
                    <p className="text-xl xl:text-2xl font-semibold leading-relaxed">Lets get some more details about you</p>
                    <form onSubmit={handleFormSubmit} className="w-full xl:w-2/3 self-center flex flex-col gap-2 xl:gap-4" ref={formRef}>
                        <label className="flex flex-col gap-2">
                            Name (Confirm)
                            <input type="text" name="name" defaultValue={userData?.name ?? ''}
                                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                        </label>
                        <label className="flex flex-col gap-2">
                            Email (Confirm)
                            <input type="text" name="email" defaultValue={userData?.email ?? ''}
                                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                        </label>
                        <label className="flex flex-col gap-2 mb-4 xl:mb-5">
                            Short Description (500 characters)
                            <textarea name="desc" maxLength={500} rows={5} style={{ resize: 'none' }}
                                className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                        </label>
                        <div className="flex flex-col gap-2">
                            <p className="font-semibold">Social Media Links</p>
                            <label className="flex flex-col gap-2">
                                Facebook
                                <input type="text" name="socialsFacebook"
                                    className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                            </label>
                            <label className="flex flex-col gap-2">
                                Instagram
                                <input type="text" name="socialsInstagram"
                                    className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                            </label>
                            <label className="flex flex-col gap-2">
                                Youtube
                                <input type="text" name="socialsYoutube"
                                    className="border-1 border-slate-800/30 px-2 py-1 rounded-sm" />
                            </label>
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <button type="submit" className="bg-amber-300 text-gray-900 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-amber-400 shadow-lg px-8 py-4 rounded-lg font-semibold text-lg" onClick={handleGetStarted}>Let&apos;s get Started</button>
            </div>

            {
                isPending &&
                <div className="fixed top-0 left-0 w-full h-full bg-black/80">
                    <Loader message="Saving Details to User Profile" />
                </div>
            }
        </div>
    )
}

export default FirstSteps;