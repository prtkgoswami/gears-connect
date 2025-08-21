import { faGear, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loader = ({message}: {message?: string}) => {
    return <div className="h-full flex flex-col flex-1 justify-center items-center gap-8">
        <div className="text-9xl"><FontAwesomeIcon icon={faGear} spinPulse/></div>
        <div>{message ?? 'Loading...'}</div>
    </div>
}

export default Loader;