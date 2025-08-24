"use client"
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faAsterisk, faCheck, faClose, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useRegister } from "../hooks/authHooks";
import Loader from "../_components/Loader";
import { CUSTOM_ERROR_CODES } from "../constants/errors";

type Requirement = {
    label: string;
    test: (password: string) => boolean;
    hasPassed: boolean;
};

type SignupViewProps = {
    mode: string;
    isLoadingGoogleSignup: boolean;
    onClose: () => void;
    onRegisterSuccess: () => void;
    onLoginClick: () => void;
    onGoogleSignup: () => void;
}

const SignupView = ({ mode, isLoadingGoogleSignup, onClose, onRegisterSuccess, onLoginClick, onGoogleSignup }: SignupViewProps) => {
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState<Requirement[]>([
        {
            label: "At least 12 characters long",
            test: (p) => p.length >= 12,
            hasPassed: false
        },
        {
            label: "At least one uppercase letter",
            test: (p) => /[A-Z]/.test(p),
            hasPassed: false
        },
        {
            label: "At least one lowercase letter",
            test: (p) => /[a-z]/.test(p),
            hasPassed: false
        },
        {
            label: "At least one number",
            test: (p) => /[0-9]/.test(p),
            hasPassed: false
        },
        {
            label: "At least one special character",
            test: (p) => /[!@#$%^&*()\-_=+\[\]{};:'\",.<>/?\\|`~]/.test(p),
            hasPassed: false
        },
    ])
    const formRef = useRef<HTMLFormElement>(null);
    const { mutate: registerUser, isPending: isPendingRegister, isError: isRegisterError } = useRegister();

    const clearError = (e: React.InputEvent<HTMLInputElement>) => {
        const name = e.currentTarget.name;
        setFormErrors(prev => {
            const { [name]: _, ...rest } = prev;
            return rest;
        })
    }

    const checkPasswordMatch = (e: React.FocusEvent<HTMLInputElement>) => {
        const confirmPassword = e.currentTarget.value;
        const password = formRef.current?.password.value;

        if (password !== confirmPassword) {
            setFormErrors(prev => ({ ...prev, "confirmPassword": "Passwords do not match" }))
        }
    }

    const testPassword = (e: React.ChangeEvent<HTMLInputElement>) => {

        const password = e.target.value;
        const updatedReq: Requirement[] = [];

        passwordRequirements.forEach((req) => {
            const passed = req.test(password);
            updatedReq.push({
                ...req,
                hasPassed: passed
            })
        })

        setPasswordRequirements(updatedReq)
    }

    const validateInput = (data: Record<string, any>) => {
        let isValid = true;
        if (!data.name) {
            setFormErrors(prev => ({ ...prev, 'name': "Name is required" }))
            isValid = false;
        }
        if (!data.email) {
            setFormErrors(prev => ({ ...prev, 'email': "Email is required" }))
            isValid = false;
        }
        if (!data.password) {
            setFormErrors(prev => ({ ...prev, 'password': "Password is required" }))
            isValid = false;
        }
        if (!data.confirmPassword) {
            setFormErrors(prev => ({ ...prev, 'confirmPassword': "Password is required" }))
            isValid = false;
        }
        return isValid;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData)

        const isValid = validateInput(data);
        if (!isValid) {
            return;
        }

        registerUser(
            {
                name: data.name as string,
                email: data.email as string,
                password: data.password as string
            },
            {
                onSuccess: () => {
                    console.log("User has successfully Registered");
                    onRegisterSuccess();
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
    }

    useEffect(() => {
        setPasswordRequirements(prev => {
            const updatedReq = [...prev];
            updatedReq.forEach(req => req.hasPassed = false);
            return updatedReq;
        })
        setFormErrors({})
        setShowPassword(false);
        setShowConfirmPassword(false)
    }, [mode])

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faClose} className="text-xl" />
                </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-2" noValidate>
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
                        <p className="text-xs text-red-500 leading-relaxed italic">ERROR: {formErrors.name}</p>
                    }
                </label>

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
                        <p className="text-xs text-red-500 leading-relaxed italic">ERROR: {formErrors.email}</p>
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
                            onChange={testPassword}
                            maxLength={64}
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
                        <p className="text-xs text-red-500 leading-relaxed italic">ERROR: {formErrors.password}</p>
                    }
                    {
                        mode === 'signup' &&
                        <div className="flex flex-col gap-1 my-2 pl-2">
                            {passwordRequirements.map(({ label, hasPassed }) =>
                                <p key={label} className={`text-sm italic ${hasPassed ? 'text-green-600' : 'text-gray-500'}`}>
                                    {label} {hasPassed && <FontAwesomeIcon icon={faCheck} />}
                                </p>
                            )}
                        </div>
                    }
                </label>

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
                        <p className="text-xs text-red-500 leading-relaxed italic">ERROR: {formErrors.confirmPassword}</p>
                    }
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-amber-300 text-gray-900 py-3 px-4 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 cursor-pointer mt-2"
                >
                    Create Account
                </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
                <p className="text-slate-600">
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={onLoginClick}
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
                        onClick={onGoogleSignup}
                        className="flex-1 items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-md hover:bg-slate-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-xl" />
                    </button>
                </div>
            </div>

            {
                (isPendingRegister && !isRegisterError && !isLoadingGoogleSignup) &&
                <div className="fixed w-full h-full top-0 left-0 bg-black/80">
                    <Loader message="Signing Up" />
                </div>
            }
        </>
    )
}

export default SignupView;