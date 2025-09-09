"use client"

import { faAsterisk, faChevronLeft, faClose, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useForgotPassword } from "../hooks/authHooks";

type ForgotPasswordViewProps = {
    mode: string;
    onBack: () => void;
    onClose: () => void;
}

const ForgotPasswordView = ({ mode, onBack, onClose }: ForgotPasswordViewProps) => {
    const [inputError, setInputError] = useState("")
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
    const [showFailureMessage, setShowFailureMessage] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const { mutate: resetPassword, isPending: isPendingResetEmail } = useForgotPassword();

    const clearError = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputError("");
    }

    const validateInput = (email: string | undefined): boolean => {
        if (!email) {
            setInputError("Email is Required")
            return false;
        }

        const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!strictEmailRegex.test(email.trim())) {
            setInputError("Email is Invalid");
            return false
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        const email = data.email as string;

        const isValid = validateInput(email);
        if (!isValid) {
            return;
        }

        resetPassword({
            email
        }, {
            onSuccess: () => {
                setShowSuccessMessage(true);
            },
            onError: () => {
                setShowFailureMessage(true);
            }
        })
    }

    useEffect(() => {
        if (formRef.current) {
            formRef.current.reset();
        }
        setInputError("")
    }, [mode])

    return (
        <>
            <div className="flex justify-between">
                <button
                    className="text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer"
                    onClick={onBack}
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                </button>
                <button
                    className="text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faClose} className="text-xl" />
                </button>
            </div>

            <p className="text-2xl text-gray-800 text-center py-4">
                Reset Password
            </p>

            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col items-center gap-5">

                <label className="flex flex-col justify-start items-center gap-2 w-full">
                    <p className="text-gray-900 flex items-start w-full">
                        Email
                        <FontAwesomeIcon icon={faAsterisk} className="text-xs text-red-500" />
                    </p>

                    <input type="text" name="email" className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-gray-800 w-full flex-1" onChange={clearError} />

                    {
                        inputError &&
                        <p className="text-xs text-red-500 leading-relaxed italic">ERROR: {inputError}</p>
                    }
                </label>

                <button type="submit" className="w-full bg-amber-300 text-gray-900 py-3 px-4 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 cursor-pointer mt-2">Send Email</button>
            </form>

            <div className="mt-5">
                {
                    isPendingResetEmail &&
                    <div className="flex gap-2 text-gray-500 items-center justify-center">
                        Sending Email <FontAwesomeIcon icon={faSpinner} spinPulse />
                    </div>
                }
                {
                    showSuccessMessage &&
                    <p className="text-center text-green-600 font-light">Reset Email was sent to your Email Inbox</p>
                }
                {
                    showFailureMessage &&
                    <p className="text-center text-red-600 font-light">Reset Email could not be sent to your Email Inbox</p>
                }
            </div>
        </>
    )
}

export default ForgotPasswordView;