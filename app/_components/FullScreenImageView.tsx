import { faCaretLeft, faCaretRight, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

type FullScreenImageViewProps = {
    isVisible: boolean;
    imageUrlList?: string[];
    defaultIndex?: number;
    onClose: () => void;
}

const FullScreenImageView = ({ isVisible, imageUrlList, defaultIndex, onClose }: FullScreenImageViewProps) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex ? defaultIndex - 1 :  0)

    if (!isVisible || !imageUrlList || !defaultIndex) {
        return <></>
    }

    const handleLeftClick = () => {
        setActiveIndex(prev => (prev + imageUrlList.length - 1) % imageUrlList.length)
    }

    const handleRightClick = () => {
        setActiveIndex(prev => (prev + 1) % imageUrlList.length)
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-black">
            <div className="relative h-full w-full">
                <button
                    className="absolute right-5 top-5 w-10 h-10 rounded-full text-gray-50 cursor-pointer flex justify-center items-center transition-colors duration-300 ease-in-out hover:bg-gray-800 z-50"
                    onClick={onClose}>
                    <FontAwesomeIcon icon={faClose} />
                </button>


                <div className="absolute right-0 w-30 h-full flex justify-center items-center">
                    <button className="w-15 h-15 cursor-pointer flex justify-center items-center transition-colors duration-300 ease-in-out text-gray-50/20 hover:text-gray-50 z-50 rounded-full text-4xl"
                        onClick={handleRightClick}>
                        <FontAwesomeIcon icon={faCaretRight} />
                    </button>
                </div>


                <div className="absolute left-0 w-20 h-full flex justify-center items-center">
                    <button className="w-15 h-15 cursor-pointer flex justify-center items-center transition-colors duration-300 ease-in-out text-gray-50/20 hover:text-gray-50 z-50 rounded-full text-4xl"
                        onClick={handleLeftClick}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </button>
                </div>

                <Image src={imageUrlList[activeIndex]} alt={`image-${activeIndex}`} layout="fill" objectFit="contain" />
            </div>
        </div>
    )
}

export default FullScreenImageView;