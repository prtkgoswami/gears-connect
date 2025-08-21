import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { Meetup } from "@/app/types/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

type EventsHostedSectionProps = {
    eventIds: string[] | undefined;
    sectionTitle: string;
}

type CustomEvent = {
    id: string;
    title: string;
    date: number;
}

const EventsSection = ({ sectionTitle, eventIds }: EventsHostedSectionProps) => {
    const [eventData, setEventData] = useState<CustomEvent[]>()
    const [isExpanded, setIsExpanded] = useState(false);

    const onSectionClick = () => {
        setIsExpanded(prev => !prev)
    }

    const fetchEventDetails = async (eventIds: string[]) => {
        try {
            const eventRef = collection(db, 'meetups');
            const eventQuery = query(eventRef, where(documentId(), "in", eventIds));
            const eventSnap = await getDocs(eventQuery);
            const eventList: CustomEvent[] = [];
            eventSnap.docs.forEach(doc => {
                const data = doc.data() as Omit<Meetup, "id">
                eventList.push({
                    id: doc.id,
                    title: data.title,
                    date: data.date
                })
            })
            setEventData(eventList);
        } catch (err) {
            console.log('Failed to fetch Event details', err);
            alert('Failed to fetch event details. Try Again.')
        }
    }

    const renderDatelabel = (dateUnix: number) => {
        const target = new Date(dateUnix * 1000);
        const today = new Date();
        const diff = target.getTime() - today.getTime();
        const numOfDays = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (numOfDays < 0) {
            return (<div className="text-red-600 font-semibold text-xs xl:text-base">Passed</div>)
        } else if (numOfDays === 0) {
            return (<div className="text-emerald-400 font-semibold text-xs xl:text-base">Today</div>)
        } else {
            return (<div className="text-amber-400 font-semibold text-xs xl:text-base">In {numOfDays} {numOfDays === 1 ? 'Day' : 'Days'}</div>)
        }
    }

    useEffect(() => {
        if (eventIds && eventIds.length > 0) {
            void fetchEventDetails(eventIds)
        }
    }, [eventIds])

    return (
        <>
            <div className="flex items-center gap-2 border-b py-3 cursor-pointer xl:mb-8" onClick={onSectionClick}>
                {isExpanded ?
                    <FontAwesomeIcon icon={faCaretDown} /> :
                    <FontAwesomeIcon icon={faCaretRight} />
                }
                <div className="text-amber-300 text-xl xl:text-2xl leading-relaxed uppercase">{sectionTitle}</div>
            </div>
            <div className={`transition-all origin-top duration-300 ease-out ${isExpanded ? 'scale-y-100 xl:max-h-[600px] xl:overflow-y-auto' : 'scale-y-0 max-h-0 overflow-y-hidden'}`}>
                <div className="flex flex-col xl:items-center gap-4 xl:px-5 mt-5 xl:mt-0">
                    {eventData?.map(({ id, title, date }, idx) => (
                        <div key={idx} className="flex justify-between gap-1 w-full xl:w-1/2 border px-2 xl:px-5 py-2 rounded-lg">
                            <div className="flex flex-col flex-1 gap-1 min-w-0 xl:gap-2 w-fit">
                                <p className="leading-relaxed font-semibold truncate whitespace-nowrap w-full">{title}</p>
                                <p className="leading-relaxed font-light italic text-xs xl:text-base">Event ID: {id}</p>
                            </div>
                            <div>
                                {renderDatelabel(date)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default EventsSection;