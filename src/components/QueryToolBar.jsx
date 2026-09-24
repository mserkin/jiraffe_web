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
import { BACKEND_URI, QUERIES_PATH_PART, VERSION } from "../modules/const";

const QueryToolBar = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const createDialogRef = useRef(null);
    const saveAsDialogRef = useRef(null);
    const changeNameDialogRef = useRef(null);
    const settingsDialogRef = useRef(null);
    const discardChangesDialogRef = useRef(null);
    const [queryTitle, setQueryTitle] = useState("");
    const [userLogin, setUserLogin] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [jiraServer, setJiraServer] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
    const [isCreateConfirmationPending, setIsCreateConfirmationPending] =
        useState(false);

    const handleAddClick = (event) => {
        createDialogRef.current?.showModal();
    };

    const handleSaveClick = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await saveQuery();
    };

    const handleSaveAsClick = (event) => {
        saveAsDialogRef.current?.showModal();
    };

    const handleEditNameClick = async (event) => {
        changeNameDialogRef.current?.showModal();
    };

    const handleSettingsClick = async (event) => {
        settingsDialogRef.current?.showModal();
    };

    const createQuery = useCallback(async () => {
        console.log("createQuery executed");
        try {
            dispatch(setIsLoading(true));
            const newQuery = {
                name: queryTitle,
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
    }, [dispatch, queryTitle]);

    const saveAsQuery = useCallback(async () => {
        console.log("saveAsQuery executed");
        try {
            dispatch(setIsLoading(true));
            const newQuery = {
                name: queryTitle,
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
    }, [dispatch, queryTitle, openQuery]);

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

    const handleCreateSubmit = async (event) => {
        console.log("handleCreateSubmit executed");
        event.preventDefault();
        event.stopPropagation();
        createDialogRef.current?.close();

        if (isQueryChanged) {
            console.log("isQueryChange==true");
            setIsCreateConfirmationPending(true);
            discardChangesDialogRef.current?.showModal();
            return;
        } else {
            console.log("isQueryChange==false");
            await createQuery();
        }
    };

    const handleSaveAsSubmit = async (event) => {
        console.log("handleSaveAsSubmit executed");
        event.preventDefault();
        event.stopPropagation();
        saveAsDialogRef.current?.close();

        await saveAsQuery();
    };

    const handleChangeNameSubmit = (event) => {
        console.log("handleChangeNameSubmit executed");
        event.preventDefault();
        event.stopPropagation();
        changeNameDialogRef.current?.close();

        dispatch(setQueryName(queryTitle));
        dispatch(setIsQueryChanged(true));
    };

    const handleSettingsSubmit = (event) => {};
    const handleAddUserClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (teamMembers.length < 14) {
            setTeamMembers([...teamMembers, { login: "", name: "" }]);
        }
    };

    const handleDialogClose = (event) => {
        event.stopPropagation();
        discardChangesDialogRef.current?.close();
        if (isCreateConfirmationPending) {
            setIsCreateConfirmationPending(false);
        }
    };

    const handleDiscardChanges = async (event) => {
        event.stopPropagation();
        discardChangesDialogRef.current?.close();
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
            <dialog
                ref={createDialogRef}
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
            >
                <p>Введите название нового запроса:</p>
                <div>
                    <input
                        type="text"
                        value={queryTitle}
                        className={styles.query_name_input}
                        onChange={(event) => setQueryTitle(event.target.value)}
                        autoFocus
                    />
                    <div className={styles.dialog_buttons}>
                        <button type="submit" onClick={handleCreateSubmit}>
                            Ok
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                createDialogRef.current?.close();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
            <dialog
                ref={saveAsDialogRef}
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
            >
                <p>Под каким именем хотите сохранить запрос: </p>
                <div>
                    <input
                        type="text"
                        value={queryTitle}
                        className={styles.query_name_input}
                        onChange={(event) => setQueryTitle(event.target.value)}
                        autoFocus
                    />
                    <div className={styles.dialog_buttons}>
                        <button type="submit" onClick={handleSaveAsSubmit}>
                            Ok
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                saveAsDialogRef.current?.close();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
            <dialog
                ref={changeNameDialogRef}
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
            >
                <p>Введите новое название запроса: </p>
                <div>
                    <input
                        type="text"
                        value={queryTitle}
                        className={styles.query_name_input}
                        onChange={(event) => setQueryTitle(event.target.value)}
                        autoFocus
                    />
                    <div className={styles.dialog_buttons}>
                        <button type="submit" onClick={handleChangeNameSubmit}>
                            Ok
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                changeNameDialogRef.current?.close();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
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
                        <label htmlFor="userLoginInput"> Логин: </label>
                    </div>
                    <div className={styles.settings_dialog_setting}>
                        <input
                            id="userLoginInput"
                            type="text"
                            value={userLogin}
                            onChange={(event) =>
                                setUserLogin(event.target.value)
                            }
                            autoFocus
                        />
                    </div>
                    <div className={styles.settings_dialog_setting_label}>
                        <label htmlFor="userPasswordInput"> Пароль: </label>
                    </div>
                    <div className={styles.settings_dialog_setting}>
                        <input
                            id="userPasswordInput"
                            type="password"
                            value={userPassword}
                            className={styles.query_name_input}
                            onChange={(event) =>
                                setUserPassword(event.target.value)
                            }
                        />
                    </div>
                    <div className={styles.settings_dialog_setting_label}>
                        <label htmlFor="userLoginInput"> Сервер Jira: </label>
                    </div>
                    <div className={styles.settings_dialog_setting}>
                        <input
                            id="jiraServerInput"
                            type="text"
                            value={jiraServer}
                            onChange={(event) =>
                                setJiraServer(event.target.value)
                            }
                            autoFocus
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
                                    value={member.login}
                                    onChange={(event) => {
                                        const updatedMembers = [...teamMembers];
                                        updatedMembers[index].login = event.target.value;
                                        setTeamMembers(updatedMembers);
                                    }}
                                />
                            </div>
                            <div>
                                <input
                                    className={styles.team_member_input}
                                    type="text"
                                    value={member.name}
                                    onChange={(event) => {
                                        const updatedMembers = [...teamMembers];
                                        updatedMembers[index].name = event.target.value;
                                        setTeamMembers(updatedMembers);
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
            <dialog
                ref={discardChangesDialogRef}
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
            >
                В текущий запрос внесены не сохраненные изменения. Нажмите Да,
                чтобы отменить их, нажмите Нет, чтобы вернуться к текущему
                запросу.
                <br />
                Отменить изменения?
                <div className={styles.dialog_buttons}>
                    <button type="button" onClick={handleDiscardChanges}>
                        Да
                    </button>
                    <button type="button" onClick={handleDialogClose}>
                        Нет
                    </button>
                </div>
            </dialog>
        </header>
    );
};

export default QueryToolBar;
