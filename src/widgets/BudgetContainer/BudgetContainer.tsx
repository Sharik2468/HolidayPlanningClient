import cl from "./ui/BudgetContainer.module.css";
import {DeleteOutlined, EditOutlined, InfoCircleOutlined, SettingOutlined,} from "@ant-design/icons";
import React, {useState} from "react";
import {
    BudgetData, changePaidAmountBudget, deleteBudget
} from "../../shared/api";
import {Button, ConfigProvider, Dropdown, MenuProps, Progress, Tooltip, Typography} from "antd";
import {useFetching, useNotification} from "../../shared/hook";
import {useParams} from "react-router-dom";
import {calcPercent} from "../../shared/lib";
import {theme} from "./theme/theme";
import {BudgetChangeModal} from "../../modal/BudgetChangeModal";

const { Text } = Typography;

export const BudgetContainer: React.FC<{
    budget: BudgetData,
    onChangeBudget: (budgetId: string, newBudget: BudgetData) => void,
    onDeleteBudget: (budgetId: string) => void,
}> = ({ budget, onChangeBudget, onDeleteBudget }) => {
    const eventId = `${useParams().id}`
    const notification = useNotification()
    const [isChangeBudgetModal, setIsChangeBudgetModal] = useState(false);
    const [fetchDeleteBudget, isLoadingFetchDeleteBudget, errorFetchDeleteBudget] = useFetching(async () => {
        try {
            const response = await deleteBudget(budget.id)
            if (response) {
                onDeleteBudget(budget.id)
                notification.success(`Статься расхода '${budget.title}' успешно удалена!`)
            }
        } catch (e) {
            notification.error(`Ошибка при удалении статьи бюджета: ${errorFetchDeleteBudget}`)
        }
    })
    const [fetchChangePaidAmount, isLoadingFetchChangePaidAmount, errorFetchChangePaidAmount] = useFetching(async (newPaidAmount: number) => {
        try {
            const response = await changePaidAmountBudget(budget.id, budget.isContractor, newPaidAmount)
            if (response) {
                onChangeBudget(budget.id, {
                    ...budget,
                    paid: newPaidAmount
                })
            }
        } catch (e) {
            notification.error(`Ошибка при изменении суммы оплаты статьи расхода: ${errorFetchChangePaidAmount}`)
        }
    })

    const items: MenuProps['items'] = [
        {
            label: (
                <Button icon={<EditOutlined/>}
                        iconPosition={"start"}
                        onClick={() => {
                            openChangeBudgetModal()
                        }}
                        color={"default"}
                        variant={"link"}
                >
                    Изменить статью расхода
                </Button>
            ),
            key: '0',
        }, {
            label: (
                <Button
                    icon={<DeleteOutlined/>}
                    iconPosition={"start"}
                    loading={isLoadingFetchDeleteBudget}
                    onClick={() => {
                        fetchDeleteBudget()
                    }}
                    color={"danger"}
                    variant={"link"}
                >
                    Удалить статью расхода
                </Button>
            ),
            key: '1',
        }
    ];

    const onChangePaidAmount = (value: string) => {
        const newPaiAmount = Number(value)
        if (isNaN(newPaiAmount)) {
            notification.error(`Сумма не может содержать ничего кроме цифр`)
        } else if(newPaiAmount < 0) {
            notification.error(`Сумма не может быть меньше 0`)
        } else {
            const isMoreNecessary = newPaiAmount > budget.amount
            fetchChangePaidAmount(isMoreNecessary ? budget.amount : newPaiAmount)
            isMoreNecessary && notification.info('Сумма превышала максимальную. Была выставлена максимально допустимая сумма!')
        }
    };

    const openChangeBudgetModal = () => {
        setIsChangeBudgetModal(true);
    };


    const handleCloseChangeBudgetModal = () => {
        setIsChangeBudgetModal(false);
    };

    return (
        <ConfigProvider theme={theme}>
            <div key={budget.id} className={cl.blockContractorBack}>
                <div className={cl.blockContractorName}>
                    <div>{budget.title}</div>
                    {
                        budget.isContractor
                            ? <Tooltip title="Стать неизменяема, она связана с подтвержденным подрядчиком!" color={'orange'} key={'orange'}>
                                <InfoCircleOutlined className={cl.settingsContractorIcon}/>
                            </Tooltip>
                            : <Dropdown menu={{ items }} trigger={['click', 'contextMenu']}>
                                <SettingOutlined className={cl.settingsContractorIcon}/>
                            </Dropdown>

                    }
                </div>
                <div className={cl.progressContainer}>
                    <Progress
                        className={cl.progressItem}
                        strokeLinecap={"butt"}
                        size={['100%', 20]}
                        percent={calcPercent(budget.paid, budget.amount)}
                        strokeColor={{ '0%': '#FE9449', '100%': '#EF5282' }}
                        showInfo={false}
                    />
                </div>
                <div className={cl.description}>
                    <div>
                        <Text strong>Оплачено: </Text>
                        <Text strong editable={{
                            maxLength: 15,
                            text: `${budget.paid}`,
                            onChange: onChangePaidAmount
                        }}>{budget.paid}</Text>
                    </div>
                    <div>
                        <Text strong>Сумма: {budget.amount}</Text>
                    </div>
                </div>
            </div>
            <BudgetChangeModal eventId={eventId} budget={budget} visible={isChangeBudgetModal}
                               onChangeBudget={onChangeBudget} onCancel={handleCloseChangeBudgetModal}/>
        </ConfigProvider>
    );
};