import React, {useState} from "react";
import {Input, Select} from "antd";
import cl from './ui/BudgetChangeModal.module.css'
import Logo from '../../shared/image/modal-logo.png';
import {inputStyle, selectStyle} from "./config/theme";
import {useFetching, useNotification} from "../../shared/hook";
import {
    BudgetData
} from "../../shared/api";
import {Modal} from "../../shared/ui";


type FormData = {
    title: string
    description: string,
    totalAmount: number,
    paidAmount: number,
};

export const BudgetChangeModal: React.FC<{
    eventId: string,
    budget: BudgetData,
    visible: boolean;
    onChangeBudget: (budgetId: string, newBudget: BudgetData) => void;
    onCancel: () => void;
}> = ({ eventId, budget, visible, onChangeBudget, onCancel}) => {
    const [formData, setFormData] = useState<FormData>({
            title: budget.title,
            description: budget.description,
            paidAmount: budget.paidAmount,
            totalAmount: budget.totalAmount,
    });
    const notification = useNotification()

    /*const [fetchCreateBudget, isLoadingFetchCreateBudget, errorFetchCreateBudget] = useFetching(async () => {
        try {
            const response = await createBudget({
                id: budget.id,
                holidayId: eventId,
                title: formData.title,
                description: formData.description,
                paidAmount: Number(formData.paidAmount),
                totalAmount: Number(formData.totalAmount),
                isContractor: false,
            })
            if (response) {
                onChangeBudget(response)
                notification.success(`Статья расхода '${formData.title}' успешно изменена!`)
            }
        } catch (e) {
            notification.error(`Ошибка при изменении статьи расхода: ${errorFetchCreateBudget}`)
        }
    })*/

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
        const newBudget: BudgetData = {
            id: budget.id,
            holidayId: eventId,
            title: formData.title,
            description: formData.description,
            paidAmount: formData.paidAmount,
            totalAmount: formData.totalAmount,
            isContractor: false,
        };

        //fetchCreateBudget()
        onChangeBudget(newBudget.id, newBudget);
        handleClose();
    };

    const handleClose = () => {
        setFormData(formData);
        onCancel();
    };

    return (
        <Modal
            onCancel={handleClose}
            onOk={handleSubmit}
            okButtonText={"Изменить"}
            icon={Logo}
            modalTitle={"Изменение статьи расхода"}
            description={"Напиши информацию о статье расхода для мероприятия"}
            visible={visible}
            disabled={formData.title === '' || formData.paidAmount <= 0 || formData.totalAmount <= 0}
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
