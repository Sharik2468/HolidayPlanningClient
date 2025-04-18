import React, {useEffect, useState} from "react";
import {Input} from "antd";
import cl from './ui/BudgetChangeModal.module.css'
import Logo from '../../shared/image/modal-logo.png';
import {inputStyle} from "./config/theme";
import {useFetching, useNotification} from "../../shared/hook";
import {
    BudgetData, changeBudget
} from "../../shared/api";
import {Modal} from "../../shared/ui";


type FormData = {
    title: string
    description: string,
    amount: number,
    paid: number,
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
            paid: budget.paid,
            amount: budget.amount,
    });
    const notification = useNotification()
    const [fetchCreateBudget, isLoadingFetchCreateBudget, errorFetchCreateBudget] = useFetching(async () => {
        try {
            const newBudget: BudgetData = {
                id: budget.id,
                holidayId: eventId,
                title: formData.title,
                description: formData.description,
                paid: Number(formData.paid),
                amount: Number(formData.amount),
                isContractor: budget.isContractor,
            };

            const response = await changeBudget(newBudget)
            if (response && response.status === 200) {
                onChangeBudget(budget.id, newBudget);
                notification.success(`Статья расхода '${formData.title}' успешно изменена!`)
            }
        } catch (e) {
            notification.error(`Ошибка при изменении статьи расхода: ${errorFetchCreateBudget}`)
        } finally {
            handleClose()
        }
    })

    useEffect(() => {
        setFormData({...budget, paid: budget.paid})
    }, [budget]);

    const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) >= 0)) {
            setFormData(prev => ({ ...prev, paid: value === '' ? 0 : parseFloat(value) }));
        }
    };

    const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) >= 0)) {
            setFormData(prev => ({ ...prev, amount: value === '' ? 0 : parseFloat(value) }));
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
            loading={isLoadingFetchCreateBudget}
            disabled={formData.title === '' || formData.paid < 0 || formData.amount <= 0}
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
                    value={formData.paid}
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
                    value={formData.amount}
                    onChange={handleTotalAmountChange}
                    type="number"
                    min={0}
                />
            </div>
        </Modal>
    );
};
