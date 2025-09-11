"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import MeetupForm from "./MeetupForm";
import { useAuth } from "../hooks/authHooks";
import { useRouter } from "next/navigation";
import Loader from "../_components/Loader";
import { ROUTES } from "../constants/path";
import { Meetup } from "../types/models";
import { formatDisplayDate } from "./utils";
import { VEHICLE_TYPES } from "../constants/variables";
import { useFetchMeetups } from "../hooks/meetupHooks";
import { useFetchVehicles } from "../hooks/vehicleHooks";
import TitleText from "../_components/TitleText";
import { toast } from "react-toastify";

const Meetups = () => {
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const { data: meetupList, isLoading: isLoadingMeetupList, isError, error } = useFetchMeetups();
  const { currentUser } = useAuth();
  const router = useRouter();
  const { data: vehicleData, isLoading: isLoadingVehicles } = useFetchVehicles(currentUser?.uid)

  // Filters
  const [activeType, setActiveType] = useState('all')
  const [activeExclusivity, setActiveExclusivity] = useState('all')
  const [activeAvailableOnly, setActiveAvailableOnly] = useState(false)
  const [activeWeekendOnly, setActiveWeekendOnly] = useState(false)
  const [activeEligibleOnly, setActiveEligibleOnly] = useState(false)

  const handleMeetupClick = (meetup: Meetup) => {
    router.push(`${ROUTES.meetups}/${meetup.id}`)
  }

  const handleNewMeetupClick = () => {
    setShowMeetupForm(true)
  }

  const handleNewMeetupCloseClick = () => {
    setShowMeetupForm(false)
  }

  const handleResetFilters = () => {
    setActiveType('all')
    setActiveExclusivity("all")
    setActiveAvailableOnly(false)
    setActiveWeekendOnly(false)
    setActiveEligibleOnly(false)
  }


  const renderMeetupList = () => {
    if (isLoadingMeetupList || isLoadingVehicles) {
      return (
        <Loader message="Fetching Meetups" />
      )
    } else if (!filteredMeetupList || filteredMeetupList.length === 0 || isError) {
      return (
        <div className="text-gray-400 text-xl leading-relaxed text-center mb-20 flex-1 flex justify-center items-center">
          No Meetups/Events found.
          <>{isError && toast.error("Failed to Fetch Meetups. Please try again!")}</>
        </div>
      )
    } else {
      return (
        <div className="px-5 xl:px-10 mb-10">
          <p className="mb-5 text-right text-xs xl:text-base">{filteredMeetupList.length} {filteredMeetupList.length === 1 ? 'Event' : 'Events'} Found</p>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            {filteredMeetupList.map((meetup, index) => {
              const isMeetupFull = meetup.participantCount === meetup.participationLimit;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-2 xl:p-4 border border-slate-200 flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform duration-200 ease-out relative"
                  onClick={() => handleMeetupClick(meetup)}
                >
                  <div className="flex justify-between items-start flex-1">
                    <h2 className="text-lg xl:text-xl font-semibold text-slate-800">
                      {meetup.title}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div>
                      <strong>Date:</strong> {formatDisplayDate(meetup.date)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {meetup.duration}
                    </div>
                    <div>
                      <strong>Participants:</strong> {meetup.participantCount}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${meetup.isPrivate
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                        }`}
                    >
                      {meetup.isPrivate ? "Private" : "Public"}
                    </span>
                    {meetup.cost ? (
                      <div className="text-gray-800">&#8377;{meetup.cost}</div>
                    ) : (
                      <div className="text-green-600">Free</div>
                    )}
                  </div>

                  {isMeetupFull &&
                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                      <div className="uppercase text-gray-900 bg-amber-300 font-semibold px-5 xl:px-10 py-5 rounded-full shadow-lg -rotate-30">event full</div>
                    </div>}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  let filteredMeetupList = meetupList;
  if (filteredMeetupList && filteredMeetupList.length > 0) {
    if (activeType && activeType !== 'all') {
      filteredMeetupList = filteredMeetupList.filter(({ vehicleTypes }) => vehicleTypes.includes(activeType))
    }
    if (activeExclusivity && activeExclusivity !== "all") {
      const privateOnly = activeExclusivity === "private";
      filteredMeetupList = filteredMeetupList.filter(({ isPrivate }) => isPrivate === privateOnly)
    }
    if (activeAvailableOnly) {
      filteredMeetupList = filteredMeetupList.filter(({ participantCount, participationLimit }) => (participantCount ?? 0) < participationLimit)
    }
    if (activeWeekendOnly) {
      filteredMeetupList = filteredMeetupList.filter(({ date }) => {
        const dayOfWeek = new Date(date * 1000).getDay();
        return [0, 6].includes(dayOfWeek)
      })
    }
    if (activeEligibleOnly) {
      if (!vehicleData){
          return;
        }
      filteredMeetupList = filteredMeetupList.filter(({vehicleTypes}) => {
        const matches = vehicleData?.filter(({type}) => {
          return !vehicleTypes || vehicleTypes.length === 0 || vehicleTypes.includes(type)
        });
        return matches.length > 0;
      })
    }
  }

  return (
    <div className="w-full min-h-100 flex flex-col gap-5">
      <TitleText title="Meetup / Events" options={{className: "mb-4 xl:mb-5"}} />

      {/* Filters */}
      <div className="mx-10 border border-white rounded-lg px-3 py-4 xl:p-5 relative flex gap-4 xl:gap-5 justify- xl:justify-start items-end flex-wrap">
        <p className="absolute -top-3 left-3 bg-black px-5 text-sm xl:text-base">Filters</p>
        {/* Vehicle Type */}
        <div>
          <p className="text-amber-300 mb-1 leading-relaxed" style={{ fontSize: '0.65rem' }}>Vehicle Type</p>
          <select
            className="border border-amber-300 rounded-lg px-5 py-2 capitalize"
            value={activeType}
            onChange={(e) => setActiveType(e.currentTarget.value)}>
            {["all", ...VEHICLE_TYPES].map((type) =>
              <option key={`vehicle-type-${type}`} value={type} className="capitalize text-gray-700 hover:text-gray-900">
                {type}
              </option>
            )}
          </select>
        </div>
        {/* Exclusivity - Public/Private */}
        <div>
          <p className="text-amber-300 mb-1 leading-relaxed" style={{ fontSize: '0.65rem' }}>Public/Private</p>
          <select
            className="border border-amber-300 rounded-lg px-5 py-2 capitalize"
            value={activeExclusivity}
            onChange={(e) => setActiveExclusivity(e.currentTarget.value)}>
            {["all", "public", "private"].map((opt) =>
              <option key={`exclusivity-${opt}`} value={opt} className="capitalize text-gray-700 hover:text-gray-900">
                {opt}
              </option>
            )}
          </select>
        </div>
        {/* Eligible Only */}
        <div className="pb-2">
          <label className="flex gap-1 xl:gap-2">
            Eligible Only:
            <input type="checkbox" checked={activeEligibleOnly} onChange={(e) => setActiveEligibleOnly(prev => !prev)} />
          </label>
        </div>
        {/* Availability */}
        <div className="pb-2">
          <label className="flex gap-1 xl:gap-2">
            Available Only:
            <input type="checkbox" checked={activeAvailableOnly} onChange={(e) => setActiveAvailableOnly(prev => !prev)} />
          </label>
        </div>
        {/* Weekend Only */}
        <div className="pb-2">
          <label className="flex gap-1 xl:gap-2">
            Weekend Only:
            <input type="checkbox" checked={activeWeekendOnly} onChange={(e) => setActiveWeekendOnly(prev => !prev)} />
          </label>
        </div>
        <div>
          <button
            onClick={handleResetFilters}
            className="bg-amber-300 text-gray-900 hover:bg-amber-400 transition-colors duration-300 ease-in-out py-2 px-8 rounded-lg cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {renderMeetupList()}

      <div
        className="fixed bottom-10 right-10 bg-amber-300/80 text-gray-900 rounded-md p-2 text-3xl transition-all ease-in-out duration-150 hover:bg-amber-300/100 hover:scale-110 cursor-pointer"
        onClick={handleNewMeetupClick}
      >
        <FontAwesomeIcon icon={faPlus} />
      </div>

      <MeetupForm
        isVisible={showMeetupForm}
        currentUser={currentUser}
        onClose={handleNewMeetupCloseClick}
        operation="create"
      />
    </div>
  );
};

export default Meetups;
