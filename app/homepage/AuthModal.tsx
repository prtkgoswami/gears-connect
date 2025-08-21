"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk, faClose, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState, useRef, useEffect } from "react";
import { handleGoogleLogin } from "../services/firebase/authUtils";
import { useRouter } from "next/navigation";
import { ROUTES } from "../constants/path";
import { useLogin, useRegister } from "../hooks/authHooks";
import { CUSTOM_ERROR_CODES } from "../constants/errors";
import Loader from "../_components/Loader";

interface AuthModalProps {
    isVisible: boolean;
    onClose: () => void;
    defaultMode: 'signup' | 'login';
}

const AuthModal = ({ isVisible, onClose, defaultMode }: AuthModalProps) => {
    const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const { mutate: loginUser, isPending: isPendingLogin, isError: isLoginError } = useLogin();
    const { mutate: registerUser, isPending: isPendingRegister, isError: isRegisterError } = useRegister();

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

    const checkPasswordMatch = (e: React.FocusEvent<HTMLInputElement>) => {
        const confirmPassword = e.currentTarget.value;
        const password = formRef.current?.password.value;

        if (password !== confirmPassword) {
            setFormErrors(prev => ({ ...prev, "confirmPassword": "Passwords do not match" }))
        }
    }

    const clearError = (e: React.InputEvent<HTMLInputElement>) => {
        const name = e.currentTarget.name;
        setFormErrors(prev => {
            const { [name]: _, ...rest } = prev;
            return rest;
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);

        // Validation
        if (mode === 'signup') {
            if (!data.name) {
                setFormErrors(prev => ({ ...prev, 'name': "Name is required" }))
            }
            if (!data.email) {
                setFormErrors(prev => ({ ...prev, 'email': "Email is required" }))
            }
            if (!data.password) {
                setFormErrors(prev => ({ ...prev, 'password': "Password is required" }))
            }
            if (!data.confirmPassword) {
                setFormErrors(prev => ({ ...prev, 'confirmPassword': "Password is required" }))
            }

        } else {
            if (!data.email) {
                setFormErrors(prev => ({ ...prev, 'email': "Email is required" }))
            }
            if (!data.password) {
                setFormErrors(prev => ({ ...prev, 'password': "Password is required" }))
            }
        }

        // Submit
        if (Object.keys(formErrors).length === 0) {
            if (mode === "signup") {
                console.log('Sign up data:', data);
                registerUser(
                    {
                        name: data.name as string,
                        email: data.email as string,
                        password: data.password as string
                    },
                    {
                        onSuccess: () => {
                            console.log("User has successfully Registered");
                            router.push(ROUTES.onboarding)
                        },
                        onError: (e: any) => {
                            console.error(e, e.code, e.message)
                            if (Object.values(CUSTOM_ERROR_CODES).includes(e.code)) {
                                alert(e.message);
                                return;
                            }
                            alert("Failed to Register. Try Again!")
                        }
                    }
                )
            } else {
                console.log('Login data:', data);
                loginUser(
                    {
                        email: data.email as string,
                        password: data.password as string
                    },
                    {
                        onSuccess: () => {
                            console.log("User has successfully Logged In");
                            router.push(ROUTES.garage)
                        },
                        onError: (e: any) => {
                            console.error(e, e.code, e.message)
                            if (Object.values(CUSTOM_ERROR_CODES).includes(e.code)) {
                                alert(e.message);
                                return;
                            }
                            alert("Failed to Logged In. Try Again!")
                        }
                    }
                )
            }
        }
    };

    const onGoogleLogin = async () => {
        setIsLoading(true);
        const result = await handleGoogleLogin(goToGarage, goToOnboarding);
        if (result) {
            onClose(); // Close modal after successful login
        }
        setIsLoading(false);
    };

    // const onFacebookLogin = async () => {
    //     setIsLoading(true);
    //     const result = await handleFacebookLogin(goToGarage, goToOnboarding);
    //     if (result) {
    //         onClose(); // Close modal after successful login
    //     }
    //     setIsLoading(false);
    // };

    const toggleMode = () => {
        setMode(mode === 'signup' ? 'login' : 'signup');
        if (formRef.current) {
            formRef.current.reset();
        }
        setFormErrors({})
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-slate-100 rounded-lg w-full max-w-md p-6 shadow-2xl relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faClose} className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-2" noValidate>
                    {mode === 'signup' && (
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-700 flex gap-1 items-start">
                                Name
                                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                            </span>
                            <input
                                type="text"
                                name="name"
                                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-gray-800"
                                placeholder="John"
                                onInput={clearError}
                            />
                            {
                                formErrors.name &&
                                <p className="text-xs text-red-500 leading-relaxed italic">{formErrors.name}</p>
                            }
                        </label>
                    )}

                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700 flex gap-1 items-start">
                            Email
                            <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                        </span>
                        <input
                            type="email"
                            name="email"
                            required
                            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-gray-800"
                            placeholder="john@example.com"
                            onInput={clearError}
                        />
                        {
                            formErrors.email &&
                            <p className="text-xs text-red-500 leading-relaxed italic">{formErrors.email}</p>
                        }
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700 flex gap-1 items-start">
                            Password
                            <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                        </span>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-10 text-gray-800"
                                placeholder="••••••••"
                                onInput={clearError}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {
                            formErrors.password &&
                            <p className="text-xs text-red-500 leading-relaxed italic">{formErrors.password}</p>
                        }
                    </label>

                    {mode === 'signup' && (
                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-700 flex gap-1 items-start">
                                Confirm Password
                                <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                            </span>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-10 text-gray-800"
                                    onBlur={checkPasswordMatch}
                                    onInput={clearError}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {
                                formErrors.confirmPassword &&
                                <p className="text-xs text-red-500 leading-relaxed italic">{formErrors.confirmPassword}</p>
                            }
                        </label>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-amber-300 text-gray-900 py-3 px-4 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 cursor-pointer mt-2"
                    >
                        {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <p className="text-slate-600">
                        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={toggleMode}
                            className="ml-1 cursor-pointer text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-200"
                        >
                            {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>

                {/* Social Login Options */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-100 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={onGoogleLogin}
                            disabled={isLoading}
                            className="flex-1 items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-md hover:bg-slate-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-xl" />
                        </button>
                        {/* <button
                            onClick={onFacebookLogin}
                            disabled={isLoading}
                            className="flex-1 items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-md hover:bg-slate-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faFacebook} className="text-blue-600 text-xl" />
                        </button> */}
                    </div>
                </div>

                {
                    ((isPendingLogin && !isLoginError) || (isPendingRegister && !isRegisterError)) &&
                    <div className="fixed w-full h-full top-0 left-0 bg-black/80">
                        <Loader message={mode === "signup" ? 'Signing Up' : 'Logging In'} />
                    </div>
                }
            </div>
        </div>
    );
};

export default AuthModal; 