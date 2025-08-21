import Image from "next/image";
import { Vehicle } from "../types/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VEHICLE_ICON_MAP } from "../constants/variables";

type GarageItemProp = {
  vehicle: Vehicle;
  onItemClick: (vehicle: Vehicle) => void;
};

const GarageItem = ({ vehicle, onItemClick }: GarageItemProp) => {
  const { images, make, model, trim, year, isModified, type } = vehicle;

  const handleItemClick = () => {
    onItemClick(vehicle)
  }

  return (
    <div role="button" tabIndex={0} className="flex flex-col gap-y-2 w-1/2 xl:w-1/5 xl:p-5 bg-slate-100/0 rounded-md transition-color duration-150 ease-in-out border border-amber-300 xl:border-transparent hover:border-amber-300 hover:bg-slate-100/0 cursor-pointer group pb-3 xl:pb-0" onClick={handleItemClick}>
      <div className="relative w-full aspect-square xl:h-50 transition-transition duration-300 ease-in-out group-hover:scale-125 ">
        {
          (images && images.length > 0) ?
            <Image
              src={images[0]}
              alt={`${make} ${model} ${trim}`}
              layout="fill"
              objectFit="contain"
              objectPosition="center"
              style={{ zIndex: 20 }}
            /> :
            <div className="h-full w-full text-gray-400 flex justify-center items-center z-20 relative text-8xl xl:text-9xl">
              <FontAwesomeIcon icon={VEHICLE_ICON_MAP[type]} />
            </div>
        }
      </div>
      <div className="flex flex-col items-center gap-2 px-2">
        <div className="flex items-end gap-2 flex-wrap justify-center">
          <p className="text-sm xl:text-base font-bold">{make}</p>
          <p className="text-sm xl:text-base font-bold">{model}</p>
          <p className="text-sm xl:text-base opacity-80">{trim}</p>
        </div>
        <p className="font-bold">{year}</p>
      </div>
    </div>
  );
};

export default GarageItem;
