"use client";
import { useState, useRef, useEffect } from "react";
import { handleGoogleLogin } from "../services/firebase/authUtils";
import { useRouter } from "next/navigation";
import { ROUTES } from "../constants/path";
import SignupView from "./SignupView";
import LoginView from "./LoginView";
import ForgotPasswordView from "./ForgotPasswordView";

type AuthModalProps = {
    isVisible: boolean;
    onClose: () => void;
    defaultMode: 'signup' | 'login';
}

const AuthModal = ({ isVisible, onClose, defaultMode }: AuthModalProps) => {
    const [mode, setMode] = useState<'signup' | 'login' | 'forgotPassword'>(defaultMode);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            setMode(defaultMode);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose]);

    const goToGarage = () => {
        router.push(ROUTES.garage);
    }

    const goToOnboarding = () => {
        router.push(ROUTES.onboarding);
    }

    const onGoogleLogin = async () => {
        setIsLoading(true);
        const result = await handleGoogleLogin(goToGarage, goToOnboarding);
        if (result) {
            onClose(); // Close modal after successful login
        }
        setIsLoading(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
            <div
                ref={modalRef}
                className="bg-slate-100 rounded-lg w-full max-w-md p-6 shadow-2xl relative overflow-auto max-h-full"
            >
                {
                    mode === "signup" &&
                    <SignupView
                        mode={mode}
                        isLoadingGoogleSignup={isLoading}
                        onClose={onClose}
                        onRegisterSuccess={goToOnboarding}
                        onLoginClick={() => setMode("login")}
                        onGoogleSignup={onGoogleLogin}
                    />
                }
                {
                    mode === "login" &&
                    <LoginView
                        mode={mode}
                        isLoadingGoogleLogin={isLoading}
                        onClose={onClose}
                        onLoginSuccess={goToOnboarding}
                        onSignupClick={() => setMode("signup")}
                        onGoogleLogin={onGoogleLogin}
                        onForgotPassword={() => setMode("forgotPassword")}
                    />
                }
                {
                    mode === "forgotPassword" &&
                    <ForgotPasswordView mode={mode} onBack={() => setMode("login")} onClose={onClose} />
                }
            </div>
        </div>
    );
};

export default AuthModal; 