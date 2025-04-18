import React, {useState} from "react";
import {Input, Select} from "antd";
import cl from './ui/BudgetCreateModal.module.css'
import Logo from '../../shared/image/modal-logo.png';
import {inputStyle, selectStyle} from "./config/theme";
import {useFetching, useNotification} from "../../shared/hook";
import {
    BudgetData, createBudget
} from "../../shared/api";
import {Modal} from "../../shared/ui";


type FormData = {
    title: string
    description: string,
    totalAmount: number,
    paidAmount: number,
};

export const BudgetCreateModal: React.FC<{
    eventId: string,
    visible: boolean;
    onCreateBudget: (newBudget: BudgetData) => void;
    onCancel: () => void;
}> = ({ eventId, visible, onCreateBudget, onCancel}) => {
    const initialFormState: FormData = {
        title: '',
        description: '',
        totalAmount: 0,
        paidAmount: 0
    };

    const [formData, setFormData] = useState<FormData>(initialFormState);
    const notification = useNotification()

    const [fetchCreateBudget, isLoadingFetchCreateBudget, errorFetchCreateBudget] = useFetching(async () => {
        try {
            const newBudget = {
                id: `${Date.now()}`,
                holidayId: eventId,
                title: formData.title,
                description: formData.description,
                paid: Number(formData.paidAmount),
                amount: Number(formData.totalAmount)
            }
            const response = await createBudget(newBudget)
            if (response && response.status === 200) {
                onCreateBudget({...newBudget, isContractor: false})
                notification.success(`Статья расхода '${formData.title}' успешно добавлена!`)
            }
        } catch (e) {
            notification.error(`Ошибка при добавлении статьи расхода: ${errorFetchCreateBudget}`)
        } finally {
            handleClose()
        }
    })

    const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) >= 0)) {
            setFormData(prev => ({ ...prev, paidAmount: value === '' ? 0 : parseFloat(value) }));
        }
    };

    const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) >= 0)) {
            setFormData(prev => ({ ...prev, totalAmount: value === '' ? 0 : parseFloat(value) }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof FormData) => {
            const value = e.target.value;
            setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        fetchCreateBudget()
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onCancel();
    };

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleSubmit}
            okButtonText={"Добавить"}
            icon={Logo}
            modalTitle={"Добавление статьи расхода"}
            description={"Напиши информацию о статье расхода для мероприятия"}
            visible={visible}
            loading={isLoadingFetchCreateBudget}
            disabled={formData.title === '' || formData.paidAmount < 0 || formData.totalAmount <= 0}
        >
            <div className={cl.inputContainer}>
                <Input
                    placeholder="Название статьи расхода"
                    style={inputStyle}
                    value={formData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                />
            </div>

            <div className={cl.inputContainer}>
                <Input
                    placeholder="Внесенная стоимость статьи расхода"
                    style={inputStyle}
                    value={formData.paidAmount}
                    onChange={handlePaidAmountChange}
                    type="number"
                    min={0}
                />
            </div>

            <div className={cl.inputContainer}>
                <Input.TextArea
                    placeholder="Описание"
                    style={inputStyle}
                    value={formData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    rows={4}
                />
            </div>

            <div className={cl.inputContainer}>
                <Input
                    placeholder="Полная стоимость статьи расхода"
                    style={inputStyle}
                    value={formData.totalAmount}
                    onChange={handleTotalAmountChange}
                    type="number"
                    min={0}
                />
            </div>
        </Modal>
    );
};
