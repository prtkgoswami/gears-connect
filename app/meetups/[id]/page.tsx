"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faCalendarPlus, faDownload, faUserGroup, faTrash, faPen, faLock } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { downloadICSFile, formatDisplayDate, generateGoogleCalendarLink, generateOutlookCalendarLink, generateYahooCalendarLink } from "../utils";
import ChooseRideModal from "../ChooseRideModal";
import Link from "next/link";
import { ROUTES } from "../../constants/path";
import { useDeleteMeetup, useFetchMeetup } from "../../hooks/meetupHooks";
import Loader from "../../_components/Loader";
import ConfirmDialog from "../../_components/ConfirmDialog";
import MeetupForm from "../MeetupForm";
import { useAuth } from "@/app/hooks/authHooks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type MeetupDetailPageProps = {
    params: Promise<{
        id: string;
    }>
}

const MeetupDetailPage = ({ params }: MeetupDetailPageProps) => {
    const unwrappedParams = React.use(params);
    const meetupId = unwrappedParams.id;
    const [showChooseVehicleModal, setShowChooseVehicleModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const { data: meetup, isLoading, isError } = useFetchMeetup(meetupId)
    const { mutate: deleteMeetup, isPending: isPendingDelete } = useDeleteMeetup()
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();

    const handleAttendClick = () => {
        setShowChooseVehicleModal(true);
    }

    const handleCloseChooseModalClick = () => {
        setShowChooseVehicleModal(false);
    }

    const handleEditClick = () => {
        setShowUpdateModal(true)
    }

    const handleDeleteClick = () => {
        setShowConfirmModal(true)
    }

    const confirmDeleteClick = () => {
        if (showConfirmModal) {
            setShowConfirmModal(false)
        }

        deleteMeetup(
            meetupId,
            {
                onSuccess: () => {
                    toast.success("Meetup Deleted Successfully");
                    setTimeout(() => router.push(ROUTES.meetups), 1000);
                },
                onError: () => {
                    toast.error("Failed to delete Meetup. Try Again!")
                }
            }
        )
    }

    const renderAttendButton = (isAttending: boolean, isFull: boolean, isLoggedIn: boolean, classes?: string) => {
        if (!isLoggedIn) {
            return <div role="button" className={`bg-gray-200/80 text-gray-800 rounded-lg py-2 px-5 cursor-not-allowed transition-colors duration-150 ease-in-out hover:bg-gray-300/100 ${classes}`}>Register to Attend</div>
        } else if (isAttending) {
            return <div role="button" className={`bg-gray-200/80 text-gray-800 rounded-lg py-2 px-5 cursor-not-allowed transition-colors duration-150 ease-in-out hover:bg-gray-300/100 w-fit ${classes}`}>In Attending</div>
        } else if (isFull) {
            return <div role="button" className={`bg-gray-200/80 text-gray-800 rounded-lg py-2 px-5 cursor-not-allowed transition-colors duration-150 ease-in-out hover:bg-gray-300/100 ${classes}`}>Event is Full</div>
        }
        return <div role="button" className={`bg-amber-400 text-gray-800 rounded-lg py-2 px-5 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-amber-500 ${classes}`} onClick={handleAttendClick}>Attend</div>
    }

    if (isLoading) {
        return <Loader message="Loading Meetup Details" />
    }

    if (!meetup) {
        return <></>;
    }

    const {
        id,
        title,
        date,
        duration,
        venue,
        description,
        cost,
        isPrivate,
        participationLimit,
        rules,
        vehicleTypes,
        tags,
        participants,
        organizer,
        participantCount
    } = meetup;

    const isAttending = participants && participants.filter(({ userId }) => userId === currentUser?.uid).length > 0 || false;
    const isFull = participants && participantCount && participantCount === participationLimit || false;
    const isOwner = organizer === currentUser?.uid;

    return (
        <div>
            <div className="relative flex flex-col items-center w-full h-full gap-5 overflow-y-auto overflow-x-hidden">
                {!isLoading && meetup &&
                    <div className="px-4 xl:px-18 py-4 xl:py-5 flex gap-4 h-full w-full flex-wrap">
                        <div className="flex flex-col gap-5 xl:w-2/3">
                            <div className="flex flex-col">
                                <div className="flex flex-col xl:flex-row xl:gap-5 xl:items-center min-w-0">
                                    <div className="text-2xl font-semibold xl:font-normal xl:text-4xl text-gray-200 max-w-full truncate">
                                        {title}
                                    </div>
                                    <div className="hidden xl:flex flex-row gap-5 items-center">
                                        {renderAttendButton(isAttending, isFull, isLoggedIn)}
                                        {isOwner &&
                                            <>
                                                <button
                                                    className="w-8 xl:w-auto aspect-square xl:aspect-auto rounded-full xl:rounded-lg bg-amber-300/80 text-gray-900 flex justify-center items-center hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer xl:px-5 xl:py-2 font-medium gap-2"
                                                    onClick={handleEditClick}
                                                >
                                                    <span>Edit</span>
                                                    <span className="xl:hidden"><FontAwesomeIcon icon={faPen} /></span>
                                                </button>
                                                <button
                                                    className="w-8 xl:w-auto aspect-square xl:aspect-auto rounded-full xl:rounded-lg bg-amber-300/80 text-gray-900 flex justify-center items-center hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer xl:px-5 xl:py-2 font-medium gap-2"
                                                    onClick={handleDeleteClick}
                                                >
                                                    <span>Delete</span>
                                                    <span className="xl:hidden"><FontAwesomeIcon icon={faTrash} /></span>
                                                </button>
                                            </>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between xl:justify-start xl:gap-5 text-sm xl:text-xl text-gray-400">
                                <div className="flex gap-1 xl:gap-2">
                                    <div><FontAwesomeIcon icon={faClock} /></div>
                                    <div>{duration}</div>
                                </div>
                                <div className="h-full border border-gray-200/20"></div>
                                <div>{isPrivate ? "Private" : "Public"} Event</div>
                                <div className="h-full border border-gray-200/20"></div>
                                <div className="flex gap-1 xl:gap-2">
                                    <div><FontAwesomeIcon icon={faCoins} /></div>
                                    <div>{cost ? <>&#8377;{cost}</> : "Free"}</div>
                                </div>
                                <div className="h-full border border-gray-200/20"></div>
                                <div className="flex gap-1 xl:gap-2">
                                    <div><FontAwesomeIcon icon={faUserGroup} /></div>
                                    <div>{participationLimit}</div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs xl:text-sm text-gray-400 italic max-w-fit">Event ID: {id}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {tags && tags.length > 0 && tags.map((tag, tagIdx) =>
                                    <div className="text-xs bg-amber-200 text-gray-800 py-1 px-3 rounded-full uppercase font-semibold cursor-pointer transition-colors duration-300 ease-in-out hover:bg-amber-300" key={tagIdx}>{tag}</div>
                                )}
                            </div>
                            <div className="flex w-full h-full grow flex-wrap">
                                <div className="text-gray-200 w-full xl:w-2/3 flex flex-col gap-5 py-2 grow pr-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Description</div>
                                        <div >{description}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Eligible Vehicles</div>
                                        {/* {vehicleTypes.map((type, typeIdx) =>
                                            <div className=" text-gray-200 capitalize" key={typeIdx}>{type}</div>
                                        )} */}
                                        <div className=" text-gray-200 capitalize">{vehicleTypes.join(', ')}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Rules</div>
                                        {rules && rules.length > 0 ?
                                            <div>{rules}</div> :
                                            <div className="text-gray-300">No Rules</div>
                                        }
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Date</div>
                                        <div className="flex flex-col gap-3">
                                            <div>{formatDisplayDate(date)}</div>
                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href={generateGoogleCalendarLink(meetup)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 text-gray-200 border border-slate-900 hover:border-amber-300 cursor-pointer transition-colors duration-200 text-sm"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-red-400" />
                                                    Google Calendar
                                                </a>
                                                <a
                                                    href={generateOutlookCalendarLink(meetup)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 text-gray-200 border border-slate-900 hover:border-amber-300 cursor-pointer transition-colors duration-200 text-sm"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-sky-400" />
                                                    Outlook
                                                </a>
                                                <a
                                                    href={generateYahooCalendarLink(meetup)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 text-gray-200 border border-slate-900 hover:border-amber-300 cursor-pointer transition-colors duration-200 text-sm"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarPlus} className="text-purple-400" />
                                                    Yahoo Calendar
                                                </a>
                                                <button
                                                    onClick={() => downloadICSFile(meetup)}
                                                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 text-gray-200 border border-slate-900 hover:border-amber-300 cursor-pointer transition-colors duration-200 text-sm"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="text-green-400" />
                                                    Download ICS
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 mb-5 xl:mb-0">
                                        <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Location</div>
                                        <a href={venue.googleMapLink} target="_blank" rel="noopener noreferrer">
                                            <div className="no-underline text-amber-300 hover:text-amber-500 transition-colors ease-in-out duration-200">{venue.address}, {venue.country}, {venue.pincode}</div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isLoggedIn &&
                            <div className="flex flex-1">
                                <div className="flex flex-1 flex-col w-full xl:w-1/3 text-gray-900 border-t xl:border-t-0 xl:border-l-0 px-2 py-5 xl:py-2 xl:px-5 h-full overflow-y-auto bg-amber-400 xl:rounded-lg">
                                    <div className="text-lg font-semibold xl:text-2xl xl:font-normal mb-5">Participants</div>
                                    <div className="flex flex-col flex-1 justify-center items-center gap-4">
                                        <FontAwesomeIcon icon={faLock} size="4x" />
                                        <span>Register to see more</span>
                                    </div>
                                </div>
                            </div>
                        }
                        {participants &&
                            <div className="flex flex-1">
                                <div className="flex flex-1 flex-col w-full xl:w-1/3 bg-amber-400 text-gray-800 py-5 xl:py-2 xl:px-5 h-full overflow-y-auto rounded-lg">
                                    <div className="text-lg font-semibold xl:text-2xl xl:font-normal mb-5">Participants</div>
                                    {(participants && participantCount && participantCount > 0) ?
                                        <ol className="flex flex-col gap-5 list-decimal list-inside" type="1">
                                            {participants.map((participant, i) => (
                                                <Link href={`${ROUTES.profile}/${participant.userId}`} key={`paticipant-${i}`}>
                                                    <li>
                                                        {participant.username}
                                                        <div className="flex flex-col">
                                                            {
                                                                participant.vehicles.map(({ name }, i2) => {
                                                                    return <div key={`vehicle-${i2}`} className="ml-10">{name}</div>
                                                                })
                                                            }
                                                        </div>
                                                    </li>
                                                </Link>
                                            ))}
                                        </ol> :
                                        <div className="text-lg text-gray-600 leading-relaxed">No Participants Yet</div>
                                    }
                                </div>
                            </div>
                        }
                        <div className="flex xl:hidden flex-row flex-wrap gap-2 items-center w-full">
                            {isOwner &&
                                <>
                                    <button
                                        className="w-full rounded-lg bg-amber-300/80 text-gray-900 flex justify-center items-center cursor-pointer px-5 py-2 font-medium gap-2"
                                        onClick={handleEditClick}
                                    >
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        className="w-full rounded-lg bg-amber-300/80 text-gray-900 flex justify-center items-center cursor-pointer px-5 py-2 font-medium gap-2"
                                        onClick={handleDeleteClick}
                                    >
                                        <span>Delete</span>
                                    </button>
                                </>
                            }
                            {renderAttendButton(isAttending, isFull, isLoggedIn, "w-full text-center")}
                        </div>
                    </div>
                }

                <ChooseRideModal
                    onClose={handleCloseChooseModalClick}
                    isVisible={showChooseVehicleModal}
                    meetup={meetup}
                    currentUser={currentUser} />

                {(isPendingDelete || isLoading) &&
                    <div className="fixed top-0 left-0 h-full w-full bg-black-80">
                        {
                            isPendingDelete && <Loader message="Deleting Meetup" />
                        }
                        {
                            isLoading && <Loader message="Fetching Meetup Details" />
                        }
                    </div>
                }

                <ConfirmDialog
                    message={(participantCount && participantCount > 0) ? `The event has ${participantCount} ${participantCount > 1 ? 'participants' : 'participant'}. Are you sure you want to delete?` : "Are you sure you want to delete?"}
                    isVisible={showConfirmModal}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={() => confirmDeleteClick()}
                    onDecline={() => setShowConfirmModal(false)}
                />
            </div>

            <MeetupForm
                isVisible={showUpdateModal}
                currentUser={currentUser}
                onClose={() => setShowUpdateModal(false)}
                initialValues={meetup}
                operation="update"
            />

        </div>
    )
}

export default MeetupDetailPage;