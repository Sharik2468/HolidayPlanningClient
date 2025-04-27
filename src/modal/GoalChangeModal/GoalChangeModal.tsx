import React, {useState} from "react";
import {Input, DatePicker, TimePicker, Select} from "antd";
import dayjs, {Dayjs} from "dayjs";
import cl from './ui/GoalChangeModal.module.css';
import Logo from '../../shared/image/modal-logo.png';
import {dateTimePickerStyle, inputStyle, selectStyle} from "./config/theme";
import {useFetching, useNotification} from "../../shared/hook";
import {
    changeGoal,
    getEnumMapping,
    GoalData,
    GoalStatus,
    goalStatuses
} from "../../shared/api";
import {Modal} from "../../shared/ui";

const { Option } = Select;


type FormData = {
    goalStatus: string,
    title: string,
    deadlineDate: string,
    deadlineTime: string
};

export const GoalChangeModal: React.FC<{
    visible: boolean;
    eventId: string;
    goal: GoalData;
    onChangeGoal: (goalId: string, newGoal: GoalData) => void;
    onCancel: () => void;
}> = ({ visible, eventId, goal, onChangeGoal, onCancel }) => {
    const initialFormState: FormData = {
        goalStatus: goalStatuses[0] as string,
        title: goal.title,
        deadlineDate: goal.deadline.toISOString().slice(0, 10),
        deadlineTime: goal.deadline.toISOString().slice(11, 16),
    };

    const [formData, setFormData] = useState<FormData>(initialFormState);
    const notification = useNotification()
    const [fetchChangeGoal, isLoadingFetchChangeGoal, errorFetchChangeGoal] = useFetching(async () => {
        try {
            const updatedGoal: GoalData = {
                ...goal,
                title: formData.title,
                goalStatusId: `${getEnumMapping(GoalStatus, formData.goalStatus as keyof typeof GoalStatus)}`,
                deadline: new Date(`${formData.deadlineDate}T${formData.deadlineTime}`),
            };
            const response = await changeGoal(goal.id, updatedGoal);
            if (response) {
                onChangeGoal(goal.id, updatedGoal);
                notification.success(`Задача '${formData.title}' успешно изменена!`);
            }
        } catch (e) {
            notification.error(`Ошибка при изменении задачи: ${errorFetchChangeGoal}`)
        } finally {
            handleClose();
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleDateChange = (date: Dayjs | null, field: "deadlineDate" | "deadlineTime") => {
        setFormData(prev => ({
            ...prev,
            [field]: date ? date.format('YYYY-MM-DD') : null,
        }));
    };

    const handleTimeChange = (time: Dayjs | null, field: "deadlineDate" | "deadlineTime") => {
        setFormData(prev => ({
            ...prev,
            [field]: time ? time.format('HH:mm') : null,
        }));
    };

    const handleSelectChange = (value: string, field: keyof FormData) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        fetchChangeGoal()
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onCancel();
    };

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleSubmit}
            okButtonText={"Изменить"}
            icon={Logo}
            modalTitle={"Изменение задачи"}
            description={"Здесь вы можете изменить задачу"}
            visible={visible}
            loading={isLoadingFetchChangeGoal}
            disabled={Object.values(formData).some(value => value === '')}
        >
            <div className={cl.inputContainer}>
                <Input
                    placeholder="Заголовок задачи"
                    style={inputStyle}
                    value={formData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                />
            </div>

            <div className={cl.inputDatetimeContainer}>
                <DatePicker
                    placeholder="Дата конца"
                    style={dateTimePickerStyle}
                    value={formData.deadlineDate ? dayjs(formData.deadlineDate, 'YYYY-MM-DD') : null}
                    onChange={(date) => handleDateChange(date, 'deadlineDate')}
                />
                <TimePicker
                    placeholder="Время конца"
                    style={dateTimePickerStyle}
                    value={formData.deadlineTime ? dayjs(formData.deadlineTime, 'HH:mm') : null}
                    onChange={(time) => handleTimeChange(time, 'deadlineTime')}
                    format="HH:mm"
                />
            </div>

            <div className={cl.inputContainer}>
                <Select
                    placeholder="Выберите статус"
                    style={selectStyle}
                    value={formData.goalStatus}
                    onChange={(value) => handleSelectChange(value, 'goalStatus')}
                >
                    {goalStatuses.map((status) => (
                        <Option key={status} value={status}>{status}</Option>
                    ))}
                </Select>
            </div>
        </Modal>
    );
};
