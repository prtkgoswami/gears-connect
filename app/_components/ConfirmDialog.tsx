"use client"
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
    message: string;
    isVisible: boolean;
    onConfirm: () => void;
    onDecline: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({ message, isVisible, onConfirm, onDecline, onCancel }: ConfirmDialogProps) => {
    const modalBGRef = useRef(null);


    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            e.stopPropagation();

            if (isVisible && e.target === modalBGRef.current) {
                onCancel();
            }
        };

        window.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, [isVisible]);

    if (!isVisible) {
        return <></>
    }

    return (
        <div className="fixed top-0 left-0 h-full w-full flex justify-center items-center px-5 xl:px-0" ref={modalBGRef}>
            <div className="relative bg-slate-100 flex-col gap-10 p-4 shadow-2xl rounded-lg border-2 border-gray-900">
                <div className="flex justify-end">
                    <button onClick={onCancel} className="cursor-pointer text-gray-800">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="px-8 py-5 flex flex-col gap-5">
                    <div className="text-base xl:text-xl text-gray-800 leading-relaxed text-center xl:text-left">{message}</div>

                    <div className="flex justify-between">
                        <button onClick={onConfirm} className="cursor-pointer text-gray-800 bg-green-500/60 px-10 py-2 rounded-lg transition-colors duration-300 ease-out hover:bg-green-500/80">Yes</button>
                        <button onClick={onDecline} className="cursor-pointer text-gray-800 bg-red-500/60 px-10 py-2 rounded-lg transition-colors duration-300 ease-out hover:bg-red-500/80">No</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;