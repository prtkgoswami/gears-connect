
import { faBicycle, faCar, faCarSide, faMotorcycle, faPlane, faSailboat, faTruckPickup, IconDefinition } from "@fortawesome/free-solid-svg-icons";

export const APP_NAME = "GearsConnect"

export const VEHICLE_TYPES = ['car', 'bike', 'truck', 'bicycle', 'boat', 'plane']

export const VEHICLE_ICON_MAP: Record<string, IconDefinition> = {
    car: faCarSide,
    bike: faMotorcycle,
    bicycle: faBicycle,
    truck: faTruckPickup,
    boat: faSailboat,
    plane: faPlane
  }