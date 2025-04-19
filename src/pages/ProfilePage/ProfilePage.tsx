import React, {useEffect, useState} from "react";
import ImageContainerProfile from "../../shared/image/image-container-profile.png"
import {EventData, getAllEvents} from "../../shared/api";
import {useFetching, useNotification} from "../../shared/hook";
import {AdviceContainer, InfoContainer, ProfileMenu} from "../../shared/ui";
import {PlusOutlined} from "@ant-design/icons";
import {ProfileBudgetWidget, ProfileEventsWidget, ProfileGoastInfoWidget} from "../../widgets";
import {EventCreateModal} from "../../modal/EventCreateModal";
import {useNavigate} from "react-router-dom";
import {RoutesPaths} from "../../shared/config";
import {useFooterContext} from "../../shared/ui/Footer/Footer";
import cl from "./ui/ProfilePage.module.css";
import { Spin, Alert, Button } from 'antd';

export const ProfilePage = () => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {updateFloatButton } = useFooterContext()
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedEventId, setSelectedEventId] = useState(localStorage.getItem('selectEventId'))
    const [isCreateEventModal, setIsCreateEventModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchGetEvents, isLoadingFetchGetEvents, errorFetchGetEvents] = useFetching(async () => {
        try {
            const response = await getAllEvents()

            if(response){
                setEvents(response)
            }
        } catch (e) {
            notification.error(`Ошибка при получении меропритий: ${errorFetchGetEvents}`)
        }
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Проверка авторизации
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    navigate(RoutesPaths.HOME);
                    return;
                }

                await fetchGetEvents();
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="Загрузка..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Alert
                    message="Ошибка"
                    description={error}
                    type="error"
                    showIcon
                />
                <Button onClick={() => window.location.reload()}>
                    Попробовать снова
                </Button>
            </div>
        );
    }

    const updateSelectedId = (newSelectedId: string) => {
        const targetEvent = events.find(event => event.id === newSelectedId);
        if (!targetEvent) return events; // Если не найден — возвращаем исходный массив
        const remainingEvents = events.filter(event => event.id !== newSelectedId);
        setEvents([targetEvent, ...remainingEvents])
        setSelectedEventId(newSelectedId)
    }

    const openCreateEventModal = () => {
        setIsCreateEventModal(true);
    };

    const handleCancelCreateEventModal = () => {
        setIsCreateEventModal(false);
    };

    return (
        <>
            <InfoContainer
                title={"Давайте займемся организацией вашего мероприятия"}
                src={ImageContainerProfile}
                onBtnClick={openCreateEventModal}
                buttonSettings={{ btnIcon: <PlusOutlined/>, iconPosition: 'end', btnText: "Создать мероприятие" }}
            />
            <ProfileMenu/>
            <div className={cl.contentResume}>
                <div className={cl.textResume}>
                    <div className={cl.resumeBlock}>Сводка</div>
                    <div className={cl.resumeUnderline}></div>

                    {events.length !== 0 && <ProfileEventsWidget
                        events={events}
                        updateSelectedEventId={updateSelectedId}
                    />}
                    <ProfileGoastInfoWidget eventId={`${selectedEventId}`}/>
                    <ProfileBudgetWidget eventId={`${selectedEventId}`}/>
                </div>
            </div>
            <AdviceContainer/>
            <EventCreateModal
                visible={isCreateEventModal}
                onCancel={handleCancelCreateEventModal}
                onCreateEvent={() => {
                    navigate(RoutesPaths.EVENTS)
                }}
            />
        </>
    )
}