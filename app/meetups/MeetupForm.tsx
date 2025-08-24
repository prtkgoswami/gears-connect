import { faAsterisk, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import countryList from 'react-select-country-list'
import { Meetup } from "../types/models";
import { User } from "firebase/auth";
import { VEHICLE_TYPES } from "../constants/variables";
import { useCreateMeetup, useUpdateMeetup } from "../hooks/meetupHooks";
import { formatDateTimeLocal } from "./utils";
import Loader from "../_components/Loader";

type MeetupFormProps = {
    isVisible: boolean;
    currentUser: User | null | undefined;
    initialValues?: Meetup;
    operation?: "create" | "update";
    onClose: () => void;
}

const MeetupForm = ({ isVisible, currentUser, initialValues, operation = "create", onClose }: MeetupFormProps) => {
    const [isPrivateCheck, setIsPrivateCheck] = useState(initialValues?.isPrivate ?? false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(initialValues?.vehicleTypes ?? [])
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const formRef = useRef<HTMLFormElement>(null);
    const modalBGRef = useRef(null)
    const options = useMemo(() => countryList().getData(), [])
    const { mutate: createMeetup, isPending: isPendingMeetupCreate } = useCreateMeetup(currentUser?.uid);
    const { mutate: updateMeetup, isPending: isPendingMeetupUpdate } = useUpdateMeetup()

    const validateInputData = (data: Record<string, any>) => {
        let isValid = true;
        if (!data.title) {
            setFormErrors(prev => ({ ...prev, title: "Title is Required" }))
            isValid = false;
        }
        if (!data.description) {
            setFormErrors(prev => ({ ...prev, description: "Description is Required" }))
            isValid = false;
        }
        if (!data.venueAddress) {
            setFormErrors(prev => ({ ...prev, venueAddress: "Address is Required" }))
            isValid = false;
        }
        if (!data.venueCountry) {
            setFormErrors(prev => ({ ...prev, venueCountry: "Country is Required" }))
            isValid = false;
        }
        if (!data.venuePincode) {
            setFormErrors(prev => ({ ...prev, venuePincode: "Pincode is Required" }))
            isValid = false;
        }
        if (!data.dateTime) {
            setFormErrors(prev => ({ ...prev, dateTime: "Date & Time is Required" }))
            isValid = false;
        }
        if (!data.duration) {
            setFormErrors(prev => ({ ...prev, duration: "Duration is Required" }))
            isValid = false;
        }

        return isValid;
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const vehicleTypesSelected = formData.getAll("vehicleTypes") as string[];
        const data = Object.fromEntries(formData.entries())
        console.log('New Meetup Details', data)

        const isValid = validateInputData(data);

        if (!currentUser || !isValid) {
            return;
        }

        const newMeetup: Omit<Meetup, "id"> = {
            title: data.title as string ?? '',
            description: data.description as string ?? '',
            date: Math.floor(new Date(data.dateTime as string ?? '').getTime() / 1000),
            duration: data.duration as string ?? '',
            venue: {
                googleMapLink: data.venueGoogleMapLink as string ?? '',
                address: data.venueAddress as string ?? '',
                country: data.venueCountry as string ?? '',
                pincode: data.venuePincode as string ?? ''
            },
            organizer: currentUser?.uid,
            rules: data.rules as string ?? '',
            cost: parseFloat(data.cost as string ?? '0'),
            participationLimit: parseInt(data.participationLimit as string ?? '0'),
            isPrivate: isPrivateCheck ?? false,
            tags: data.tags ? (data.tags as string).split(',').map((tag) => tag.trim()) : [],
            vehicleTypes: vehicleTypesSelected,
            participants: [],
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000)
        }
        console.log('New Meetup Details', newMeetup);

        if (operation === 'create') {
            createMeetup(
                newMeetup,
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (err) => {
                        alert("Failed to Create Meetup. Try again!")
                    }
                }
            );
        } else if (operation === "update") {
            updateMeetup({
                meetupId: initialValues?.id ?? '',
                data: newMeetup
            })
        }
    }

    // Reset form on close
    useEffect(() => {
        if (!isVisible && formRef.current) {
            formRef.current.reset();
        }
    }, [isVisible]);

    useEffect(() => {
        if (initialValues) {
            setIsPrivateCheck(initialValues.isPrivate)
            setSelectedTypes(initialValues.vehicleTypes)
        }
    }, [initialValues])

    // Get current datetime in yyyy-MM-ddTHH:mm format for min attribute
    const getMinDateTime = () => {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const mm = pad(now.getMinutes());
        return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
    };

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            e.stopPropagation();

            if (isVisible && e.target === modalBGRef.current) {
                onClose();
            }
        };

        window.addEventListener("click", handleClick);

        if (isVisible) {
            setFormErrors({});
        }

        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, [isVisible]);

    if (!isVisible) return <></>;

    return (<div className="fixed xl:absolute w-full h-screen top-0 left-0 flex justify-center items-center z-50 bg-black/80 py-5" ref={modalBGRef}>
        <div className="bg-slate-100 rounded-lg flex flex-col gap-5 p-5 w-full xl:w-3/5 h-full xl:max-h-180 overflow-y-auto">
            <div className="flex justify-between items-center text-slate-800">
                <p className="font-bold select-none">{operation === "create" && "Add New Meetup"}</p>
                <div
                    className="hover:scale-110 transition-transform duration-100 ease-out cursor-pointer"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faClose} />
                </div>
            </div>
            <form ref={formRef} onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-slate-800 px-2 xl:px-5" noValidate>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Title
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <input
                        type="text"
                        name="title"
                        placeholder="eg. Cars & Coffee, Track Day, etc."
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        required
                        defaultValue={initialValues?.title}
                    />
                    {
                        formErrors.title &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.title}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Description (600 chars)
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <textarea
                        name="description"
                        maxLength={600}
                        rows={5}
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
                        required
                        defaultValue={initialValues?.description}
                    />
                    {
                        formErrors.description &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.description}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Location Address
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <input
                        type="text"
                        name="venueAddress"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        required
                        defaultValue={initialValues?.venue.address}
                    />
                    {
                        formErrors.venueAddress &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.venueAddress}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Country
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <Select
                        options={options}
                        name="venueCountry"
                        placeholder="Select Country..."
                        required
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                background: 'transparent'
                            })
                        }}
                        defaultValue={options.find(
                            (opt: Record<string, string>) => opt.value === initialValues?.venue.country
                        )}
                    />
                    {
                        formErrors.venueCountry &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.venueCountry}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Pincode
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <input
                        type="text"
                        name="venuePincode"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        required
                        defaultValue={initialValues?.venue.pincode}
                    />
                    {
                        formErrors.venuePincode &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.venuePincode}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    Google Maps Link
                    <input
                        type="text"
                        name="venueGoogleMapLink"
                        placeholder="eg. https://maps.google.com/?q=Central+Park+Plaza"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        defaultValue={initialValues?.venue.googleMapLink}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Date & Time
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <input
                        type="datetime-local"
                        name="dateTime"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        required
                        min={getMinDateTime()}
                        defaultValue={initialValues?.date && formatDateTimeLocal(initialValues?.date)}
                    />
                    {
                        formErrors.dateTime &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.dateTime}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    <div className="flex gap-1 items-start">
                        Duration
                        <FontAwesomeIcon icon={faAsterisk} size="2xs" className="text-red-500 font-semibold" />
                    </div>
                    <input
                        type="text"
                        name="duration"
                        placeholder="eg. 2 hours"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm"
                        required
                        defaultValue={initialValues?.duration}
                    />
                    {
                        formErrors.duration &&
                        <p className="text-xs text-red-500 leading-relaxed italic text-right">ERROR: {formErrors.duration}</p>
                    }
                </label>
                <label className="flex flex-col gap-1">
                    Rules (300 chars)
                    <textarea
                        name="rules"
                        maxLength={300}
                        rows={3}
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
                        defaultValue={initialValues?.rules}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Allowed Vehicle Types
                    <div className="flex flex-wrap gap-4 w-full justify-center xl:justify-start">
                        {VEHICLE_TYPES.map(type => (
                            <label key={type} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="vehicleTypes"
                                    value={type}
                                    className="w-4 h-4"
                                    onChange={() => toggleType(type)}
                                    checked={(selectedTypes).includes(type)}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                        ))}
                    </div>
                </label>
                <div className="flex gap-2 w-full">
                    <label className="flex flex-col gap-1 flex-1 min-w-0">
                        Cost
                        <input
                            type="number"
                            name="cost"
                            placeholder="eg. 100"
                            className="border-1 border-slate-800/30 px-2 py-1 rounded-sm w-full"
                            min={0}
                            defaultValue={initialValues?.cost}
                        />
                    </label>
                    <label className="flex flex-col gap-1 flex-1 min-w-0">
                        Participation Limit
                        <input
                            type="number"
                            name="participationLimit"
                            placeholder="eg. 50"
                            className="border-1 border-slate-800/30 px-2 py-1 rounded-sm w-full"
                            min={1}
                            defaultValue={initialValues?.participationLimit}
                        />
                    </label>
                </div>
                <label className="flex flex-col gap-1">
                    Tags (Comma Seperated, Max 5)
                    <input
                        name="tags"
                        placeholder="eg. SUV, Luxury, Vintage, EVs, Mountain"
                        className="border-1 border-slate-800/30 px-2 py-1 rounded-sm resize-none"
                        defaultValue={initialValues?.tags.join(',')}
                    />
                </label>
                <label className="flex flex-row gap-2 items-center flex-1 min-w-0">
                    Is it a Private Event?
                    <input
                        type="checkbox"
                        name="isPrivate"
                        className="border-1 border-slate-800/30"
                        checked={isPrivateCheck}
                        onChange={(e) => setIsPrivateCheck(e.target.checked)}
                    />
                </label>
                <input
                    type="submit"
                    value={operation === "update" ? "Update Meetup" : "Add Meetup"}
                    className="p-2 rounded-sm bg-amber-300 text-slate-800 mt-5 cursor-pointer hover:bg-amber-400 transition-colors duration-150 ease-in-out"
                />
            </form>



            {isPendingMeetupCreate &&
                <div className="fixed top-0 left-0 w-full h-full bg-black/80">
                    <Loader message="Creating Meetup" />
                </div>
            }
            {isPendingMeetupUpdate &&
                <div className="fixed top-0 left-0 w-full h-full bg-black/80">
                    <Loader message="Updating Meetup" />
                </div>
            }
        </div>
    </div>)

}

export default MeetupForm;