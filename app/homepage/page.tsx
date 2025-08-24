"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faFlagCheckered, faUsers, faCalendarAlt, faMapMarkerAlt, faStar, faGears } from "@fortawesome/free-solid-svg-icons";
import { faUser, faHeart } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { APP_NAME } from "../constants/variables";
import { handleRedirectResult } from "../services/firebase/authUtils";
import { ROUTES } from "../constants/path";

const Homepage = () => {
    const router = useRouter();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

    const handleGetStarted = () => {
        setAuthMode('signup');
        setShowAuthModal(true);
    };

    const handleSignIn = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const handleCloseAuthModal = () => {
        setShowAuthModal(false);
    };


    useEffect(() => {
        handleRedirectResult(
            () => router.push(ROUTES.garage),
            () => router.push(ROUTES.onboarding)
        );
    }, [router]);

    return (
        <>
            <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`}>
                {/* Hero Section */}
                <section className="relative h-screen flex xl:items-center justify-center overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-300 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
                        <div className="xl:hidden flex justify-center mb-8 mt-15">
                            <div className="border-2 rounded-xl px-5 pt-18 pb-3 w-3/4">
                                <div className="flex justify-center text-slate-50/90 text-9xl mb-8"><FontAwesomeIcon icon={faGears} /></div>
                                <p className="text-2xl font-mono font-bold text-slate-50/90 tracking-wider select-none">
                                    {APP_NAME}
                                </p>
                            </div>
                        </div>
                        <h1 className="hidden xl:block text-8xl md:text-9xl font-mono font-bold text-slate-50/90 tracking-wider select-none mb-8">
                            {APP_NAME}
                        </h1>

                        <div className="text-center mb-12">
                            <h2 className="text-2xl xl:text-4xl md:text-5xl font-bold text-white mb-6">
                                Connect with Car Enthusiasts
                            </h2>
                            <p className="text-lg xl:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Join the ultimate platform for car lovers. Showcase your vehicles, discover amazing meetups,
                                and connect with fellow enthusiasts in your area.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 justify-center items-center mb-5 xl:mb-16">
                            <button
                                onClick={handleGetStarted}
                                className="bg-amber-300 text-gray-900 px-8 py-4 rounded-lg font-semibold text-2xl xl:text-lg hover:bg-amber-400 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg cursor-pointer"
                            >
                                Get Started
                            </button>
                            <div className="text-sm xl:text-base text-slate-300">
                                Or <span className="cursor-pointer underline font-semibold text-amber-300 hover:text-amber-400 transition-colors duration-200" onClick={handleSignIn}>Sign In</span> if you are already registered
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-8 bg-slate-800/50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-5xl font-bold text-white text-center mb-16">
                            Why Choose {APP_NAME}?
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-slate-700/50 p-8 rounded-lg border border-slate-600 hover:border-amber-300 transition-all duration-300 hover:scale-105">
                                <div className="text-amber-300 text-4xl mb-4">
                                    <FontAwesomeIcon icon={faCar} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Vehicle Showcase</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Create your digital garage and showcase your rides with detailed specifications,
                                    modifications, and stunning photos.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-slate-700/50 p-8 rounded-lg border border-slate-600 hover:border-amber-300 transition-all duration-300 hover:scale-105">
                                <div className="text-amber-300 text-4xl mb-4">
                                    <FontAwesomeIcon icon={faFlagCheckered} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Car Meetups</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Discover and join exciting meetups, track days, and events
                                    in your area or create your own.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-slate-700/50 p-8 rounded-lg border border-slate-600 hover:border-amber-300 transition-all duration-300 hover:scale-105">
                                <div className="text-amber-300 text-4xl mb-4">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Community</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Connect with fellow enthusiasts, share experiences, and build lasting
                                    friendships in the gearhead community.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-8 bg-gradient-to-r from-amber-300 to-amber-400">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Ready to Join the Community?
                        </h2>
                        <p className="text-xl text-gray-800 mb-8">
                            Start your journey with {APP_NAME} today and become part of the ultimate car enthusiast community.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg cursor-pointer"
                        >
                            Join Now - It's Free!
                        </button>
                    </div>
                </section>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isVisible={showAuthModal}
                onClose={handleCloseAuthModal}
                defaultMode={authMode}
            />
        </>
    );
};

export default Homepage;