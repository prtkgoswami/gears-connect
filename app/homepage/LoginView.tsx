"use client"
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faAsterisk, faClose, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useLogin } from "../hooks/authHooks";
import Loader from "../_components/Loader";
import { CUSTOM_ERROR_CODES } from "../constants/errors";

type LoginViewProps = {
    mode: string;
    isLoadingGoogleLogin: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
    onForgotPassword: () => void;
    onSignupClick: () => void;
    onGoogleLogin: () => void;

}

const LoginView = ({ mode, isLoadingGoogleLogin, onClose, onLoginSuccess, onForgotPassword, onSignupClick, onGoogleLogin }: LoginViewProps) => {
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { mutate: loginUser, isPending: isPendingLogin, isError: isLoginError } = useLogin();

    const clearError = (e: React.InputEvent<HTMLInputElement>) => {
        const name = e.currentTarget.name;
        setFormErrors(prev => {
            const { [name]: _, ...rest } = prev;
            return rest;
        })
    }

    const validateInput = (data: Record<string, any>) => {
        let isValid = true;
        if (!data.email) {
            setFormErrors(prev => ({ ...prev, 'email': "Email is required" }))
            isValid = false;
        }
        if (!data.password) {
            setFormErrors(prev => ({ ...prev, 'password': "Password is required" }))
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

        loginUser(
            {
                email: data.email as string,
                password: data.password as string
            },
            {
                onSuccess: () => {
                    console.log("User has successfully Logged In");
                    onLoginSuccess();
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



    useEffect(() => {
        if (formRef.current) {
            formRef.current.reset();
        }
        setFormErrors({})
        setShowPassword(false)
    }, [mode])

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
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
                    <p
                        className="text-sm italic text-amber-600 hover:text-amber-700 transition-colors duration-200 cursor-pointer"
                        onClick={onForgotPassword}
                    >
                        Forgot Password?
                    </p>
                </label>



                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-amber-300 text-gray-900 py-3 px-4 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 cursor-pointer mt-2"
                >
                    Sign In
                </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
                <p className="text-slate-600">
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={onSignupClick}
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
                        className="flex-1 items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-md hover:bg-slate-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-xl" />
                    </button>
                </div>
            </div>

            {
                (isPendingLogin && !isLoginError && !isLoadingGoogleLogin) &&
                <div className="fixed w-full h-full top-0 left-0 bg-black/80">
                    <Loader message="Logging In" />
                </div>
            }
        </>
    )
}

export default LoginView;