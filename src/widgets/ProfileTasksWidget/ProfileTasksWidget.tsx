import React, {useEffect, useState} from "react";
import {deleteGoal, EventData, getGoalsBuEventId, GoalData, GoalStatus} from "../../shared/api";
import {useFetching, useNotification} from "../../shared/hook";
import {
    ArrowDownOutlined,
    ArrowUpOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined,
    FormOutlined, PlusCircleOutlined, PlusOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {formatDate} from "../../shared/lib";
import cl from './ui/ProfileTasksWidget.module.css';
import {Button, Dropdown, MenuProps, Tooltip} from "antd";
import {GoalCreateModal} from "../../modal/GoalCreateModal";
import { GoalChangeModal } from "../../modal/GoalChangeModal";

const emptyTask = {
    id: '',
    title: '',
    goalStatusId: '',
    deadline: new Date(),
    holidayId: '',
};

export const ProfileTasksWidget: React.FC<{ eventId: string }> = ({ eventId }) => {
    const [tasks, setTasks] = useState([] as GoalData[]);
    const [selectedTask, setSelectedTask] = useState<GoalData>({
        id: '',
        title: '',
        goalStatusId: '',
        deadline: new Date(),
        holidayId: '',
    });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreateGoalModal, setIsCreateGoalModal] = useState(false);
    const [isChangeGoalModal, setIsChangeGoalModal] = useState(false);
    const notification = useNotification();

    const [fetchGetTasks, isLoadingFetchGetTasks, errorFetchGetTasks] = useFetching(async () => {
        try {
            const response = await getGoalsBuEventId(eventId);

            if (response) {
                setTasks(response);
            }
        } catch (e) {
            console.error(`Ошибка при получения списка задач: ${errorFetchGetTasks}`);
        }
    });

    const [fetchDeleteTasks, isLoadingFetchDeleteTasks, errorFetchDeleteTasks] = useFetching(async (goalId: string) => {
        try {
            const response = await deleteGoal(goalId);

            if (response) {
                onDeleteEvent(goalId)
            }
        } catch (e) {
            console.error(`Ошибка при получения удалении задачи: ${errorFetchGetTasks}`);
        }
    });

    useEffect(() => {
        fetchGetTasks();
    }, [eventId]);

    const onDeleteEvent = (goalId: string) => {
        const updatedTasks = tasks.filter(task => task.id !== goalId);
        setTasks(updatedTasks);
    }

    const openCreateGoalModal = () => {
        setIsCreateGoalModal(true);
    };


    const handleCancelCreateGoalModal = () => {
        setIsCreateGoalModal(false);
    };

    const items = (task: GoalData): MenuProps['items'] => [
        {
            label: (
                <Button
                    icon={<EditOutlined />}
                    iconPosition={"start"}
                    onClick={() => openChangeGoalModal(task)}
                    color={"default"}
                    variant={"link"}
                >
                    Изменить
                </Button>
            ),
            key: '0',
        },
        {
            label: (
                <Button
                    icon={<DeleteOutlined />}
                    iconPosition={"start"}
                    loading={isLoadingFetchDeleteTasks}
                    onClick={() => fetchDeleteTasks(task.id)}
                    color={"danger"}
                    variant={"link"}
                >
                    Удалить
                </Button>
            ),
            key: '2',
        },
    ];    

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    const onCreateGoal = (newGoal: GoalData) => {
        setTasks([...tasks, newGoal])
    }

    const openChangeGoalModal = (task: GoalData) => {
        setSelectedTask(task);
        setIsChangeGoalModal(true);
    };

    const handleCancelChangeGoalModal = () => {
        setIsChangeGoalModal(false);
        setSelectedTask(emptyTask);
    };


    const onChangeGoal = (goalId: string, newGoal: GoalData) => {
        const index = tasks.findIndex(task => task.id === goalId);

        if (index !== -1) {
            const updatedTasks = [
                ...tasks.slice(0, index),
                newGoal,
                ...tasks.slice(index + 1)
            ];

            setTasks(updatedTasks);
        } else {
            console.warn(`Задача с id ${goalId} не найдено`);
        }
    }


    return (
        <>
            <div className={cl.resumeTask}>
                <div className={cl.resumeTaskHeader}>
                    <div className={cl.resumeTaskHeaderLeft}>
                        <FormOutlined className={cl.resumeTaskHeaderButton}/>
                        <div className={cl.resumeTaskHeaderText}>Задачи</div>
                        <div className={cl.resumeTaskHeaderComplete}>Выполнено: {tasks.filter(t => Number(t.goalStatusId) === GoalStatus['выполнено']).length}/{tasks.length}</div>
                    </div>
                    <div className={cl.resumeTaskHeaderInfo}>
                        <Button
                            icon={<PlusOutlined />}
                            iconPosition={"end"}
                            className={cl.headerButton}
                            onClick={() => {openCreateGoalModal()}}
                        >
                            Добавить
                        </Button>
                    </div>
                </div>
                <div className={cl.resumeUnderlineHeader}></div>

                <div className={cl.tasksContainer}>
                    <div className={cl.tasksContainer}>
                        {tasks.slice(0, isExpanded ? tasks.length : 3).map((task) => (
                            <div key={task.id} className={cl.blockTaskBack}>
                                <div className={cl.blockTaskName}>
                                    <div className={cl.statusIcon}>
                                        {(() => {
                                            switch (task.goalStatusId) {
                                                case '1':
                                                    return <Tooltip title="В процессе"><ClockCircleOutlined style={{ color: "#FFA500" }} /></Tooltip>
                                                case '2':
                                                    return <Tooltip title="Выполнено"><CheckCircleOutlined style={{ color: "#52C41A" }} /></Tooltip>
                                                case '3':
                                                    return <Tooltip title="Отменено"><CloseCircleOutlined style={{ color: "#FF4D4F" }} /></Tooltip>
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </div>
                                    <div>&nbsp;{task.title}</div>

                                    <div className={cl.taskActions}>
                                        <div className={cl.taskDeadline}>{task.deadline.getTime() < Date.now() && "(Время истекло)"}&nbsp;{formatDate(task.deadline)}</div>
                                        <Dropdown menu={{ items: items(task) }} trigger={['click', 'contextMenu']}>
                                            <SettingOutlined className={cl.settingsTaskIcon}/>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <>
                    {
                        tasks.length > 2 && <div className={cl.expandButton} onClick={toggleExpand}>
                            {isExpanded
                                ? (<><ArrowUpOutlined/> Свернуть</>)
                                : (<><ArrowDownOutlined/> Показать все задачи</>)
                            }
                        </div>
                    }
                </>
            </div>
            <GoalCreateModal visible={isCreateGoalModal} eventId={eventId} onCreateGoal={onCreateGoal} onCancel={handleCancelCreateGoalModal}/>
            {selectedTask.id !== '' && (
                <GoalChangeModal
                    visible={true}
                    eventId={eventId}
                    goal={selectedTask}
                    onChangeGoal={onChangeGoal}
                    onCancel={handleCancelChangeGoalModal}
                />
            )}
        </>
    );
};