import React, {useEffect, useState} from "react";
import ImageContainerProfile from "../../shared/image/image-container-profile.png"
import {EventData, getAllEvents} from "../../shared/api";
import {useFetching, useNotification} from "../../shared/hook";
import {AdviceContainer, InfoContainer, ProfileMenu} from "../../shared/ui";
import {PlusOutlined} from "@ant-design/icons";
import {ProfileBudgetWidget, ProfileEventsWidget, ProfileGoastInfoWidget} from "../../widgets";
import {EventCreateModal} from "../../modal/EventCreateModal";
import {useNavigate, useLocation} from "react-router-dom";
import {RoutesPaths} from "../../shared/config";
import {useFooterContext} from "../../shared/ui/Footer/Footer";
import { Spin } from 'antd';
import cl from "./ui/ProfilePage.module.css";

export const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const notification = useNotification();
    const {updateFloatButton} = useFooterContext();
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedEventId, setSelectedEventId] = useState(localStorage.getItem('selectEventId'));
    const [isCreateEventModal, setIsCreateEventModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [fetchGetEvents, isLoadingFetchGetEvents, errorFetchGetEvents] = useFetching(async () => {
        try {
            setIsLoading(true);
            const response = await getAllEvents();
            if (response) {
                setEvents(response);
            }
        } catch (e) {
            notification.error(`Ошибка при получении меропритий: ${errorFetchGetEvents}`);
        } finally {
            setIsLoading(false);
        }
    });

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            updateFloatButton(undefined);
            await fetchGetEvents();
        };

        init();

        return () => {
            mounted = false;
        };
    }, []);

    const handleNavigation = (path: string) => {
        if (!isLoading) {
            navigate(path);
        }
    };

    const updateSelectedId = (newSelectedId: string) => {
        const targetEvent = events.find(event => event.id === newSelectedId);
        if (!targetEvent) return;
        
        setSelectedEventId(newSelectedId);
    };

    const openCreateEventModal = () => {
        setIsCreateEventModal(true);
    };

    const handleCancelCreateEventModal = () => {
        setIsCreateEventModal(false);
    };

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <InfoContainer
                title={"Давайте займемся организацией вашего мероприятия"}
                src={ImageContainerProfile}
                onBtnClick={openCreateEventModal}
                buttonSettings={{btnIcon: <PlusOutlined/>, iconPosition: 'end', btnText: "Создать мероприятие"}}
            />
            <ProfileMenu/>
            <div className={cl.contentResume}>
                <div className={cl.textResume}>
                    <div className={cl.resumeBlock}>Сводка</div>
                    <div className={cl.resumeUnderline}></div>

                    {events.length !== 0 && (
                        <ProfileEventsWidget
                            events={events}
                            updateSelectedEventId={updateSelectedId}
                        />
                    )}
                    {selectedEventId && (
                        <>
                            <ProfileGoastInfoWidget eventId={selectedEventId}/>
                            <ProfileBudgetWidget eventId={selectedEventId}/>
                        </>
                    )}
                </div>
            </div>
            <AdviceContainer/>
            <EventCreateModal
                visible={isCreateEventModal}
                onCancel={handleCancelCreateEventModal}
                onCreateEvent={() => handleNavigation(RoutesPaths.EVENTS)}
            />
        </>
    );
};