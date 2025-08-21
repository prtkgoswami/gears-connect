"use client";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCoins, faCalendarPlus, faDownload, faUserGroup, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { downloadICSFile, formatDisplayDate, generateGoogleCalendarLink, generateOutlookCalendarLink, generateYahooCalendarLink } from "./utils";
import ChooseRideModal from "./ChooseRideModal";
import { User } from "firebase/auth";
import Link from "next/link";
import { ROUTES } from "../constants/path";
import { useDeleteMeetup, useFetchMeetup } from "../hooks/meetupHooks";
import Loader from "../_components/Loader";
import ConfirmDialog from "../_components/ConfirmDialog";
import NewMeetupModal from "./NewMeetupModal";

type MeetupDetailProps = {
  meetupId: string;
  isVisible: boolean;
  currentUser: User | null | undefined;
  onClose: () => void;
};

const MeetupDetail = ({ meetupId, isVisible, currentUser, onClose }: MeetupDetailProps) => {
  const modalBGRef = useRef(null);
  const [showChooseVehicleModal, setShowChooseVehicleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { data: meetup, isLoading, isError } = useFetchMeetup(meetupId)
  const { mutate: deleteMeetup, isPending: isPendingDelete } = useDeleteMeetup()

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
        onSuccess: () => onClose(),
        onError: () => {
          alert("Failed to delete Meetup. Try Again!")
        }
      }
    )
  }

  const renderAttendButton = (isAttending: boolean, isFull: boolean) => {
    if (isAttending) {
      return <div role="button" className="bg-gray-200/80 text-gray-800 rounded-lg py-2 px-5 cursor-not-allowed transition-colors duration-150 ease-in-out hover:bg-gray-300/100 w-fit">In Attending</div>
    } else if (isFull) {
      return <div role="button" className="bg-gray-200/80 text-gray-800 rounded-lg py-2 px-5 cursor-not-allowed transition-colors duration-150 ease-in-out hover:bg-gray-300/100">Event is Full</div>
    }
    return <div role="button" className="bg-amber-300/80 text-gray-800 rounded-lg py-2 px-5 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-amber-300/100" onClick={handleAttendClick}>Attend</div>
  }


  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();

      if (isVisible && e.target === modalBGRef.current) {
        onClose();
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isVisible]);

  if (!meetup || !isVisible) {
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
    organizer
  } = meetup;

  const isAttending = participants && participants.filter(({ userId }) => userId === currentUser?.uid).length > 0 || false;
  const isFull = participants && participants.length === participationLimit || false;
  const isOwner = organizer === currentUser?.uid;

  return (
    <div
      className="fixed xl:absolute top-0 left-0 h-full w-full xl:px-20 xl:py-5 z-50 bg-black/80"
      ref={modalBGRef}
    >
      <div className="relative bg-slate-100 rounded-lg flex flex-col w-full h-full gap-5 overflow-y-auto overflow-x-hidden">
        <div className="px-4 xl:px-10 py-4 xl:py-5 flex flex-col gap-5 h-full">

          <div className="flex flex-col">
            <div className="flex justify-end gap-3">
              {isOwner &&
                <>
                  <button
                    className="w-8 xl:w-10 aspect-square rounded-full bg-amber-300/90 text-gray-900 flex justify-center items-center hover:scale-125 hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer"
                    onClick={handleEditClick}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="w-8 xl:w-10 aspect-square rounded-full bg-amber-300/90 text-gray-900 flex justify-center items-center hover:scale-125 hover:bg-amber-300/100 transition-all duration-300 ease-in-out cursor-pointer"
                    onClick={handleDeleteClick}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </>
              }
              <button
                className="w-8 xl:w-10 aspect-square rounded-full bg-slate-800/80 text-slate-100 flex justify-center items-center hover:scale-125 hover:bg-slate-800/100 transition-all duration-300 ease-in-out cursor-pointer"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faClose} />
              </button>
            </div>
            <div className="flex flex-col xl:flex-row xl:gap-5 xl:items-center min-w-0">
              <div className="text-2xl font-semibold xl:font-normal xl:text-4xl text-gray-800 max-w-full truncate">
                {title}
              </div>
              <div className="hidden xl:flex flex-row gap-5 items-center">
                {renderAttendButton(isAttending, isFull)}
                <p className="text-xs text-gray-900 bg-gray-200/50 px-2 py-2 rounded-lg italic flex-1">Event ID: {id}</p>
              </div>
              <div className="flex flex-row xl:hidden gap-5 items-center">
                <p className="text-xs text-gray-900 bg-gray-200/50 px-2 py-2 rounded-lg italic flex-1">Event ID: {id}</p>
                {renderAttendButton(isAttending, isFull)}
              </div>
            </div>
          </div>
          <div className="flex justify-between xl:justify-start xl:gap-5 text-sm xl:text-xl text-gray-600">
            <div className="flex gap-1 xl:gap-2">
              <div><FontAwesomeIcon icon={faClock} /></div>
              <div>{duration}</div>
            </div>
            <div className="h-full border border-gray-900/20"></div>
            <div>{isPrivate ? "Private" : "Public"} Event</div>
            <div className="h-full border border-gray-900/20"></div>
            <div className="flex gap-1 xl:gap-2">
              <div><FontAwesomeIcon icon={faCoins} /></div>
              <div>{cost ? <>&#8377;{cost}</> : "Free"}</div>
            </div>
            <div className="h-full border border-gray-900/20"></div>
            <div className="flex gap-1 xl:gap-2">
              <div><FontAwesomeIcon icon={faUserGroup} /></div>
              <div>{participationLimit}</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {vehicleTypes.map((type, typeIdx) =>
              <div className="text-xs bg-amber-200 text-gray-900 py-1 px-3 rounded-full uppercase font-semibold cursor-pointer transition-colors duration-300 ease-in-out hover:bg-amber-300" key={typeIdx}>{type}</div>
            )}
            {tags && tags.length > 0 && tags.map((tag, tagIdx) =>
              <div className="text-xs bg-amber-200 text-gray-900 py-1 px-3 rounded-full uppercase font-semibold cursor-pointer transition-colors duration-300 ease-in-out hover:bg-amber-300" key={tagIdx}>{tag}</div>
            )}
          </div>

          <div className="flex w-full h-full grow flex-wrap">
            <div className="text-gray-800 w-full xl:w-2/3 flex flex-col gap-5 py-2 grow pr-5">
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Description</div>
                <div >{description}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Rules</div>
                <div>{rules}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Date</div>
                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                  <div>{formatDisplayDate(date)}</div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={generateGoogleCalendarLink(meetup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 text-sm"
                    >
                      <FontAwesomeIcon icon={faCalendarPlus} />
                      Google Calendar
                    </a>
                    <a
                      href={generateOutlookCalendarLink(meetup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-150 text-sm"
                    >
                      <FontAwesomeIcon icon={faCalendarPlus} />
                      Outlook
                    </a>
                    <a
                      href={generateYahooCalendarLink(meetup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-150 text-sm"
                    >
                      <FontAwesomeIcon icon={faCalendarPlus} />
                      Yahoo Calendar
                    </a>
                    <button
                      onClick={() => downloadICSFile(meetup)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-150 text-sm"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Download ICS
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 mb-5 xl:mb-0">
                <div className="text-lg font-semibold xl:text-2xl xl:font-normal">Location</div>
                <a href={venue.googleMapLink} target="_blank" rel="noopener noreferrer">
                  <div className="no-underline text-blue-600 hover:text-blue-800">{venue.address}, {venue.country}, {venue.pincode}</div>
                </a>
              </div>
            </div>
            <div className="flex flex-col w-full xl:w-1/3 text-gray-800 border-t xl:border-2 xl:rounded-lg py-5 xl:p-2 h-full overflow-y-auto">
              <div className="text-lg font-semibold xl:text-2xl xl:font-normal mb-5">Participants</div>
              {(participants && participants.length > 0) ?
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
        </div>

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
          message={participants.length > 0 ? `The event has ${participants.length} ${participants.length > 1 ? 'participants' : 'participant'}. Are you sure you want to delete?` : "Are you sure you want to delete?"}
          isVisible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => confirmDeleteClick()}
          onDecline={() => setShowConfirmModal(false)}
        />
      </div>

      <NewMeetupModal
        isVisible={showUpdateModal}
        currentUser={currentUser}
        onClose={() => setShowUpdateModal(false)}
        initialValues={meetup}
        operation="update"
      />

    </div>
  );
}

export default MeetupDetail;
