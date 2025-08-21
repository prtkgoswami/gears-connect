"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCar, faFlagCheckered, faGear, faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ROUTES } from "../constants/path";
import { APP_NAME } from "../constants/variables";
import { useAuth } from "../hooks/authHooks";
import { useState } from "react";
import Link from "next/link";

const ICON_CLASSES = "text-xl hover:text-amber-300 hover:scale-110 transition-all ease-in-out duration-300"

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const shouldNotShowHeader = ['/', '/homepage', '/first-steps'].includes(pathname);

    const handleSignOut = async (): Promise<void> => {
        console.log('signout clicked')
        try {
            await signOut(auth);
            router.push(ROUTES.home)
        } catch (error) {
            console.log("Signout error:", error)
        }
    }

    const handleGarageClick = () => {
        router.push(ROUTES.garage);
        if (isMenuOpen) {
            handleClose();
        }
    }
    const handleMeetupClick = () => {
        router.push(ROUTES.meetups);
        if (isMenuOpen) {
            handleClose();
        }
    }
    const handleProfileClick = () => {
        router.push(`${ROUTES.profile}/${currentUser?.uid}`);
        if (isMenuOpen) {
            handleClose();
        }
    }
    const handlePreferencesClick = () => {
        router.push(ROUTES.preferences);
        if (isMenuOpen) {
            handleClose();
        }
    }

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsAnimating(false);
        }, 500); // matches animation duration
    };

    if (shouldNotShowHeader) {
        return <></>
    }

    return (
        <header className="w-full flex justify-between items-center xl:items-end px-4 xl:px-8 py-5">
            <p className="text-xl xl:text-2xl text-gray-50 select-none cursor-pointer transition-colors duration-200 ease-in-out hover:text-amber-300" onClick={() => router.push(ROUTES.root)}>{APP_NAME}</p>
            <div className="relative min-w-10">
                {/* Hamburger Menu */}
                <button className="xl:hidden text-xl text-amber-300 cursor-pointer border rounded-lg w-8 aspect-square flex justify-center items-center" onClick={() => setIsMenuOpen(true)}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                {/* Menu */}
                <div className="hidden xl:flex items-center gap-x-8 cursor-pointer">
                    <div className={`${ICON_CLASSES} ${pathname === ROUTES.garage ? 'text-amber-300' : 'text-gray-50/50'}`} onClick={handleGarageClick}>
                        <FontAwesomeIcon icon={faCar} />
                    </div>
                    <div className={`${ICON_CLASSES} ${pathname === ROUTES.meetups ? 'text-amber-300' : 'text-gray-50/50'}`} onClick={handleMeetupClick}>
                        <FontAwesomeIcon icon={faFlagCheckered} />
                    </div>
                    <div className={`${ICON_CLASSES} ${pathname.includes(ROUTES.profile) ? 'text-amber-300' : 'text-gray-50/50'}`} onClick={handleProfileClick}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className={`${ICON_CLASSES} ${pathname === (ROUTES.preferences) ? 'text-amber-300' : 'text-gray-50/50'}`} onClick={handlePreferencesClick}>
                        <FontAwesomeIcon icon={faGear} />
                    </div>
                    <div className={ICON_CLASSES} onClick={handleSignOut}>
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </div>
                </div>
            </div>
            {(isMenuOpen || isAnimating) &&
                <div className={`fixed inset-0 bg-amber-300 z-[999] flex flex-col items-center justify-start text-gray-900 origin-top ${isMenuOpen && !isAnimating ? "animate-slideDown" : "animate-slideUp"}`}>
                    <div className="flex w-full px-6 py-5 justify-end">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="w-8 aspect-square border flex justify-center items-center rounded-lg text-2xl cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    {/* Menu items */}
                    <nav className="flex flex-col w-full items-start gap-10 text-2xl py-5 px-10">
                        <p onClick={handleGarageClick}>Garage</p>
                        <p onClick={handleMeetupClick}>Meetups / Events</p>
                        <p onClick={handleProfileClick}>Profile</p>
                        <p onClick={handlePreferencesClick}>Preferences</p>
                        <p onClick={handleSignOut}>SignOut</p>
                    </nav>
                </div>
            }
        </header >
    )
}

export default Header;