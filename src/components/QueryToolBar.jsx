import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    VscAdd,
    VscSave,
    VscSaveAs,
    VscRename,
    VscPlay,
    VscDebugStop,
    VscSettings,
} from "react-icons/vsc";

import {
    selectIsQueryChanged,
    setIsQueryChanged,
    setIsLoading,
    setIsQueryListRefreshPending,
} from "../redux/slices/statusSlice";
import styles from "./QueryToolBar.module.css";
import { selectOpenQuery, setQueryName } from "../redux/slices/openQuerySlice";
import { useCallback, useRef, useState } from "react";
import { setError } from "../redux/slices/errorSlice";
import axios from "axios";
import {
    BACKEND_URI,
    QUERIES_PATH_PART,
    SETTINGS_PATH_PART,
    VERSION,
} from "../modules/const";
import {
    selectSettings,
    fetchSettings,
    setJiraLogin,
    selectJiraLogin,
    setJiraPassword,
    selectJiraPassword,
    setJiraServer,
    selectJiraServer,
    setProject,
    selectProject,
    setTeamMembers,
    selectTeamMembers,
} from "../redux/slices/settingsSlice";
import DiscardChangesDialog from "./DiscardChangesDialog";
import TextInputDialog from "./TextInputDialog";

const QueryToolBar = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const settings = useSelector(selectSettings);
    const jiraLogin = useSelector(selectJiraLogin);
    const jiraPassword = useSelector(selectJiraPassword);
    const jiraServer = useSelector(selectJiraServer);
    const project = useSelector(selectProject);
    const teamMembers = useSelector(selectTeamMembers);
    
    const discardChangesDialogRef = useRef(null);
    const textInputDialogRef = useRef(null);
    const queryTitleRef = useRef("");

    const settingsDialogRef = useRef(null);
    const [queryTitle, setQueryTitle] = useState("");
    const [isCreateConfirmationPending, setIsCreateConfirmationPending] =
        useState(false);
    const PendingAction = Object.freeze({
        ADD_NEW: "ADD_NEW",
        SAVE_AS: "SAVE_AS",
        CHANGE_NAME: "CHANGE_NAME",
    });

    const handleAddClick = (event) => {
        textInputDialogRef.current?.showModal({
            prompt: "Введите название нового запроса:",
            pendingAction: PendingAction.ADD_NEW,
        });
    };

    const handleSaveClick = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await saveQuery();
    };

    const handleSaveAsClick = (event) => {
        textInputDialogRef.current?.showModal({
            prompt: "Под каким именем хотите сохранить запрос:",
            pendingAction: PendingAction.SAVE_AS,
        });
    };

    const handleEditNameClick = async (event) => {
        textInputDialogRef.current?.showModal({
            prompt: 'Введите новое название запроса:',
            pendingAction: PendingAction.CHANGE_NAME,
        });
    };

    const handleSettingsClick = async (event) => {
        console.log("handleSettingsClick executed");
        const url = BACKEND_URI + SETTINGS_PATH_PART;
        console.log("Fetching settings from url: " + url);
        dispatch(fetchSettings({ url }));
        console.log("Settings fetched");
        settingsDialogRef.current?.showModal();
    };

    const createQuery = useCallback(async (name = queryTitleRef.current) => {
        console.log("createQuery executed");
        try {
            dispatch(setIsLoading(true));
            const newQuery = {
                name,
                queryText: null,
                epicViewType: null,
                levelFilters: [],
            };
            console.log("POST /queries");
            const createdQuery = (
                await axios.post(`${BACKEND_URI}${QUERIES_PATH_PART}`, newQuery)
            ).data;
            console.log(`createdQuery.id=${createdQuery.id}`);
            dispatch(setIsQueryListRefreshPending(createdQuery.id));
            dispatch(setIsQueryChanged(false));
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch]);

    const saveAsQuery = useCallback(async (name = queryTitleRef.current) => {
        console.log("saveAsQuery executed");
        console.log(`queryTitle: '${name}'`);
        try {
            dispatch(setIsLoading(true));
            const newQuery = {
                name,
                queryText: openQuery.queryText,
                epicViewType: openQuery.epicViewType,
                levelFilters: openQuery.levelFilters,
            };
            console.log("POST /queries");
            const createdQuery = (
                await axios.post(`${BACKEND_URI}${QUERIES_PATH_PART}`, newQuery)
            ).data;
            console.log(`createdQuery.id=${createdQuery.id}`);
            dispatch(setIsQueryListRefreshPending(createdQuery.id));
            dispatch(setIsQueryChanged(false));
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, openQuery]);

    const saveQuery = useCallback(async () => {
        console.log("saveQuery executed");
        try {
            dispatch(setIsLoading(true));
            const updatedQuery = {
                id: openQuery.id,
                name: openQuery.name,
                queryText: openQuery.queryText,
                epicViewType: openQuery.epicViewType,
                levelFilters: openQuery.levelFilters,
            };
            console.log("PUT /queries/id");
            await axios.put(
                `${BACKEND_URI}${QUERIES_PATH_PART}/${openQuery.id}`,
                updatedQuery,
            );
            dispatch(setIsQueryListRefreshPending(openQuery.id));
            dispatch(setIsQueryChanged(false));
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, openQuery]);

    const updateSettings = useCallback(async () => {
        console.log("updateSettings executed");
        try {
            dispatch(setIsLoading(true));
            const updatedSettings = {
                jiraLogin,
                jiraPassword,
                jiraServer,
                project,
                teamMembers,
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
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, jiraLogin, jiraPassword, jiraServer, project, teamMembers]);

    const handleTextInputDialogSubmit = async (dialogData) => {
        const nextQueryTitle = dialogData.requestName ?? "";
        console.log("handleTextInputDialogSubmit executed");
        console.log(`dialogData.requestName: '${nextQueryTitle}'`);

        queryTitleRef.current = nextQueryTitle;
        setQueryTitle(nextQueryTitle);

        switch (dialogData.pendingAction) {
            case PendingAction.SAVE_AS:
                await saveAsQuery(nextQueryTitle);
                break;

            case PendingAction.ADD_NEW:
                if (isQueryChanged) {
                    setIsCreateConfirmationPending(true);
                    discardChangesDialogRef.current?.showModal({
                        requestName: openQuery.name,
                    });
                    return;
                } else {
                    await createQuery(nextQueryTitle);
                }
                break;
            case PendingAction.CHANGE_NAME:
                dispatch(setQueryName(nextQueryTitle));
                dispatch(setIsQueryChanged(true));
                break;
            default:
                console.error(
                    `Unknown pendingAction: ${dialogData.pendingAction}`,
                );
        }      
    };

    const handleTextInputDialogCancel = (dialogData) => {};

    const handleSettingsSubmit = async (event) => {
        console.log("handleSettingsSubmit executed");
        event.preventDefault();
        event.stopPropagation();

        settingsDialogRef.current?.close();
        await updateSettings();
    };

    const handleAddUserClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (teamMembers.length < 14) {
            dispatch(setTeamMembers([...teamMembers, { login: "", name: "" }]));
        }
    };

    const handleDiscardCancel = () => {
        setIsCreateConfirmationPending(false);
    };

    const handleDiscardChanges = async (dataFromDialog) => {
        if (isCreateConfirmationPending) {
            setIsCreateConfirmationPending(false);
            await createQuery();
            return;
        }
        dispatch(setIsQueryChanged(false));
        //await openQuery(id);
    };

    return (
        <header>
            <nav>
                <ul className={styles.toolbar}>
                    <li
                        className={styles.toolbarIconItem}
                        onClick={handleAddClick}
                    >
                        <VscAdd size={32} />
                    </li>
                    <li
                        aria-disabled="true"
                        className={
                            isQueryChanged
                                ? styles.toolbarIconItem
                                : styles.toolbarIconItemDisabled
                        }
                        onClick={handleSaveClick}
                    >
                        <VscSave size={32} />
                    </li>
                    <li
                        className={styles.toolbarIconItem}
                        onClick={handleSaveAsClick}
                    >
                        <VscSaveAs size={32} />
                    </li>
                    <li
                        className={styles.toolbarIconItem}
                        onClick={handleEditNameClick}
                    >
                        <VscRename size={32} />
                    </li>
                    <li className={styles.toolbarTextItem}>
                        {openQuery.name ? openQuery.name : "Jiraffe in the Web"}
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscPlay size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscDebugStop size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSettings size={32} onClick={handleSettingsClick} />
                    </li>
                </ul>
            </nav>
            <TextInputDialog
                ref={textInputDialogRef}
                onOk={handleTextInputDialogSubmit}
                onCancel={handleTextInputDialogCancel}
            />
            <dialog
                ref={settingsDialogRef}
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
                                        dispatch(
                                            setTeamMembers(updatedMembers),
                                        );
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
                                        dispatch(
                                            setTeamMembers(updatedMembers),
                                        );
                                    }}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                    {teamMembers.length < 14 && (
                        <div
                            className={`${styles.item} ${styles.add_level_btn}`}
                        >
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
                    <button type="submit" onClick={handleSettingsSubmit}>
                        Ok
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            settingsDialogRef.current?.close();
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </dialog>
            <DiscardChangesDialog
                ref={discardChangesDialogRef}
                onDiscard={handleDiscardChanges}
                onClose={handleDiscardCancel}
            />
        </header>
    );
};

export default QueryToolBar;
