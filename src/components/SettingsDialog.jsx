import React from "react";
import {
    useCallback,
    forwardRef,
    useRef,
    useImperativeHandle,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "./SettingsDialog.module.css";
import { BACKEND_URI, SETTINGS_PATH_PART, VERSION } from "../modules/const";
import {
    fetchSettings,
    setJiraLogin,
    selectJiraLogin,
    setJiraPassword,
    selectJiraPassword,
    setJiraServer,
    selectJiraServer,
    setProject,
    selectProject,
    setBoardId,
    selectBoardId,
    setTeamMembers,
    selectTeamMembers,
} from "../redux/slices/settingsSlice";
import { setError } from "../redux/slices/errorSlice";
import axios from "axios";

const SettingsDialog = forwardRef(({ onOk, onCancel }, ref) => {
    const dispatch = useDispatch();
    const dialogRef = useRef(null);
    const jiraLogin = useSelector(selectJiraLogin);
    const jiraPassword = useSelector(selectJiraPassword);
    const jiraServer = useSelector(selectJiraServer);
    const project = useSelector(selectProject);
    const boardId = useSelector(selectBoardId);
    const teamMembers = useSelector(selectTeamMembers);

    // Локальное состояние диалога для хранения динамических данных
    const [dialogData, setDialogData] = useState(null);

    useImperativeHandle(ref, () => ({
        // Теперь метод принимает данные из любого места, где вызывается
        showModal: (data) => {
            console.log(
                `showModal(${data ? JSON.stringify(data) : "null"}) executed`,
            );
            setDialogData(data); // Сохраняем переданные данные
            const url = BACKEND_URI + SETTINGS_PATH_PART;
            console.log("Fetching settings from url: " + url);
            dispatch(fetchSettings({ url }));
            console.log("Settings fetched");
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null); // Очищаем данные при закрытии
        },
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
        onCancel();
    };

    const updateSettings = useCallback(async () => {
        console.log("updateSettings executed");
        try {
            const updatedSettings = {
                jiraLogin,
                jiraPassword,
                jiraServer,
                project,
                boardId,
                teamMembers: teamMembers.filter((m) => m.login && m.name),
            };
            console.log("PUT /settings");
            await axios.put(
                `${BACKEND_URI}${SETTINGS_PATH_PART}`,
                updatedSettings,
            );
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        }
    }, [dispatch, jiraLogin, jiraPassword, jiraServer, project, boardId, teamMembers]);

    const handleConfirm = async () => {
        // Передаем данные обратно в родительский обработчик «Да»
        onOk(dialogData);
        dialogRef.current?.close();
        await updateSettings();
        setDialogData(null);
    };

    const handleAddUserClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (teamMembers.length < 14) {
            dispatch(setTeamMembers([...teamMembers, { login: "", name: "" }]));
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            <p>Настройки Jiraffe {VERSION}</p>
            <div className={styles.gridContainer}>
                <div className={styles.settings_dialog_section_header}>
                    Учетные данные Jira
                </div>
                <div className={styles.settings_dialog_setting_label}>
                    <label> Логин: </label>
                </div>
                <div className={styles.settings_dialog_setting}>
                    <input
                        type="text"
                        value={jiraLogin}
                        onChange={(event) =>
                            dispatch(setJiraLogin(event.target.value))
                        }
                        autoFocus
                    />
                </div>
                <div className={styles.settings_dialog_setting_label}>
                    <label> Пароль: </label>
                </div>
                <div className={styles.settings_dialog_setting}>
                    <input
                        type="password"
                        value={jiraPassword}
                        className={styles.query_name_input}
                        autoComplete="true"
                        onChange={(event) =>
                            dispatch(setJiraPassword(event.target.value))
                        }
                    />
                </div>
                <div className={styles.settings_dialog_setting_label}>
                    <label> Сервер Jira: </label>
                </div>
                <div className={styles.settings_dialog_setting}>
                    <input
                        type="text"
                        value={jiraServer}
                        onChange={(event) =>
                            dispatch(setJiraServer(event.target.value))
                        }
                    />
                </div>
                <div className={styles.settings_dialog_setting_label}>
                    <label> Проект: </label>
                </div>
                <div className={styles.settings_dialog_setting}>
                    <input
                        type="text"
                        value={project}
                        onChange={(event) =>
                            dispatch(setProject(event.target.value))
                        }
                    />
                </div>
                <div className={styles.settings_dialog_setting_label}>
                    <label> Доска: </label>
                </div>
                <div className={styles.settings_dialog_setting}>
                    <input
                        type="text"
                        value={boardId}
                        onChange={(event) =>
                            dispatch(setBoardId(event.target.value))
                        }
                    />
                </div>
                <div className={styles.settings_dialog_section_header}>
                    Члены команды
                </div>
                <div className={styles.team_members_label}>Логин</div>
                <div className={styles.team_members_label}>Имя</div>
                {teamMembers.map((member, index) => (
                    <React.Fragment key={`member-${index}`}>
                        <div>
                            <input
                                className={styles.team_member_input}
                                type="text"
                                value={member.login ?? ""} // Добавили защиту от null/undefined
                                onChange={(event) => {
                                    // Создаем новый массив
                                    const updatedMembers = [...teamMembers];
                                    // Глубоко копируем объект и меняем в нем свойство login
                                    updatedMembers[index] = {
                                        ...updatedMembers[index],
                                        login: event.target.value,
                                    };
                                    // Отправляем обновленный массив в Redux через dispatch
                                    dispatch(setTeamMembers(updatedMembers));
                                }}
                            />
                        </div>
                        <div>
                            <input
                                className={styles.team_member_input}
                                type="text"
                                value={member.name ?? ""} // Добавили защиту от null/undefined
                                onChange={(event) => {
                                    // Создаем новый массив
                                    const updatedMembers = [...teamMembers];
                                    // Глубоко копируем объект и меняем в нем свойство name
                                    updatedMembers[index] = {
                                        ...updatedMembers[index],
                                        name: event.target.value,
                                    };
                                    // Отправляем обновленный массив в Redux через dispatch
                                    dispatch(setTeamMembers(updatedMembers));
                                }}
                            />
                        </div>
                    </React.Fragment>
                ))}
                {teamMembers.length < 14 && (
                    <div className={`${styles.item} ${styles.add_level_btn}`}>
                        <button
                            id="add_level_btn"
                            type="button"
                            className={styles.add_level_button}
                            onClick={handleAddUserClick}
                        >
                            Добавить члена команды
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.dialog_buttons}>
                <button type="submit" onClick={handleConfirm}>
                    Ok
                </button>
                <button type="button" onClick={handleDialogClose}>
                    Cancel
                </button>
            </div>
        </dialog>
    );
});

SettingsDialog.displayName = "SettingsDialog";
export default SettingsDialog;
