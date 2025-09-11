import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loader = ({message, size}: {message?: string, size?: SizeProp}) => {
    return <div className="h-full flex flex-col flex-1 justify-center items-center gap-6">
        <div ><FontAwesomeIcon icon={faGear} spinPulse size={size ?? "8x"}/></div>
        <div>{message ?? 'Loading...'}</div>
    </div>
}

export default Loader;