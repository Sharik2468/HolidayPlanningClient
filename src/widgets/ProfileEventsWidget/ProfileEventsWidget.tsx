import React, {useEffect, useState} from "react";
import {EventData} from "../../shared/api";
import {useNotification} from "../../shared/hook";
import {CheckOutlined, GiftOutlined, MenuOutlined} from "@ant-design/icons";
import {formatDate, getCountdown} from "../../shared/lib";
import cl from './ui/ProfileEventsWidget.module.css'

export const ProfileEventsWidget: React.FC<{
    events: EventData[],
    updateSelectedEventId: (newSelectedId: string) => void,
}> = ({events, updateSelectedEventId}) => {
    const notification = useNotification()
    const [selectEventId, setSelectEventId] = useState<string | undefined | null>(localStorage.getItem('selectEventId'));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Get the selected event safely
    const selectedEvent = events.find(ev => ev.id === selectEventId);
    const [beforeEventTime, setBeforeEventTime] = useState(selectedEvent?.startDate);

    useEffect(() => {
        if (events.length === 0) return; // Guard against empty events array

        if (selectEventId) {
            // Check if the selected event exists in the current events array
            const eventExists = events.some(ev => ev.id === selectEventId);
            if (eventExists) {
                localStorage.setItem('selectEventId', selectEventId);
                updateSelectedId(selectEventId);
            } else {
                // If selected event doesn't exist, find closest event
                const closestEventId = findClosestEvent(events);
                updateSelectedId(closestEventId);
            }
        } else {
            const closestEventId = findClosestEvent(events);
            updateSelectedId(closestEventId);
        }
    }, [selectEventId, events]);

    useEffect(() => {
        console.log('Создние таймера')
        const interval = setInterval(() => {
            if(beforeEventTime){
                if(Date.now() >= beforeEventTime.getTime()){
                    clearInterval(interval);
                }
                setBeforeEventTime(new Date(beforeEventTime.getTime() - 1000))
            }
        }, 1000)

        return () => {
            console.log('Удаление таймера')
            clearInterval(interval)
        };
    }, [selectEventId]);

    const handleSelectEvent = (event: EventData) => {
        updateSelectedId(event.id);
        setIsDropdownOpen(false);
        setBeforeEventTime(event.startDate)
        notification.success(`Выбрано мероприятие: ${event.title}`);
    };

    const updateSelectedId = (newSelectedId: string) => {
        setSelectEventId(newSelectedId)
        updateSelectedEventId(newSelectedId)
    }

    const findClosestEvent = (events: EventData[]): string => {
        if (events.length === 0) return ''; // Guard against empty array

        const currentDateTime = new Date();
        const futureEvents = events.filter(event => event.startDate >= currentDateTime);

        if (futureEvents.length > 0) {
            const closestEvent = futureEvents.reduce((closest, event) =>
                event.startDate < closest.startDate ? event : closest
            );
            return closestEvent.id;
        } 

        // If no future events, get the most recent past event
        const closestEvent = events.reduce((closest, event) =>
            event.startDate > closest.startDate ? event : closest
        );
        return closestEvent.id;
    };

    // Guard against no events
    if (events.length === 0) {
        return (
            <div className={cl.resumeEvent}>
                <div className={cl.resumeEventHeader}>
                    <GiftOutlined className={cl.resumeEventHeaderButton}/>
                    <div className={cl.resumeEventHeaderText}>Мероприятия</div>
                </div>
                <div className={cl.resumeUnderlineHeader}></div>
                <div>Нет доступных мероприятий</div>
            </div>
        );
    }

    // Get current event safely
    const currentEvent = selectedEvent || events[0];

    return (
        <>
            <div className={cl.resumeEvent}>
                <div className={cl.resumeEventHeader}>
                    <GiftOutlined className={cl.resumeEventHeaderButton}/>
                    <div className={cl.resumeEventHeaderText}>Мероприятия</div>
                </div>
                <div className={cl.resumeUnderlineHeader}></div>
                <div className={cl.resumeBlockEventName}>
                    <div>
                        {isDropdownOpen ? (
                            <>
                                {events.map((event) => (
                                    <div key={event.id} className={cl.resumeNameEventList}>
                                        <div
                                            className={cl.resumeNameEventList}
                                            onClick={() => handleSelectEvent(event)}
                                        >
                                            {event.title}
                                            {currentEvent.title === event.title && (
                                                <CheckOutlined className={cl.checkIcon}/>
                                            )}
                                        </div>
                                        <div className={cl.resumeDateEvent}>
                                            {formatDate(event.startDate)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className={cl.resumeNameEvent}>{currentEvent.title}</div>
                                <div className={cl.resumeDateEvent}>{formatDate(currentEvent.startDate)}</div>
                            </>
                        )}
                    </div>
                    <MenuOutlined 
                        className={cl.iconDropdown}
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                    />
                </div>
                <div className={cl.countdownTimer}>
                    <div className={cl.timerDisplay}>{getCountdown(beforeEventTime)}</div>
                </div>
            </div>
        </>
    );
};