import React, {useState} from "react";
import {Input, DatePicker, TimePicker, Select} from "antd";
import dayjs, {Dayjs} from "dayjs";
import cl from './ui/GoalCreateModal.module.css';
import Logo from '../../shared/image/modal-logo.png';
import {dateTimePickerStyle, inputStyle, selectStyle} from "./config/theme";
import {useFetching, useNotification} from "../../shared/hook";
import {
    createGoal,
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

export const GoalCreateModal: React.FC<{
    visible: boolean;
    eventId: string;
    onCreateGoal: (newGoal: GoalData) => void;
    onCancel: () => void;
}> = ({ visible, eventId, onCreateGoal, onCancel }) => {
    const initialFormState: FormData = {
        goalStatus: goalStatuses[0] as string,
        title: '',
        deadlineDate: '',
        deadlineTime: ''
    };

    const [formData, setFormData] = useState<FormData>(initialFormState);
    const notification = useNotification()
    const [fetchCreateGoal, isLoadingFetchCreateGoal, errorFetchCreateGoal] = useFetching(async () => {
        try {
            const newGoal: GoalData = {
                id: `${Date.now()}`,
                title: formData.title,
                holidayId: eventId,
                goalStatusId: `${getEnumMapping(GoalStatus, formData.goalStatus as keyof typeof GoalStatus)}`,
                deadline: new Date(`${formData.deadlineDate} ${formData.deadlineTime}`)
            }
            const response = await createGoal(newGoal)
            if (response) {
                onCreateGoal && onCreateGoal(newGoal)
                notification.success(`Задача '${formData.title}' успешно создана!`)
            }
        } catch (e) {
            notification.error(`Ошибка при создании задачи: ${errorFetchCreateGoal}`)
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
        fetchCreateGoal()
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onCancel();
    };

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleSubmit}
            okButtonText={"Создать"}
            icon={Logo}
            modalTitle={"Создать новую задачу"}
            description={"Здесь вы можете создатьновую задачу"}
            visible={visible}
            loading={isLoadingFetchCreateGoal}
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
