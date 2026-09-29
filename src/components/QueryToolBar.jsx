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
} from "../modules/const";
import TextInputDialog from "./TextInputDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import SettingsDialog from "./SettingsDialog";

const QueryToolBar = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const isQueryChanged = useSelector(selectIsQueryChanged);

    const confirmationDialogRef = useRef(null);
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
            prompt: "Введите новое название запроса:",
            pendingAction: PendingAction.CHANGE_NAME,
        });
    };

    const handleSettingsClick = async (event) => {
        settingsDialogRef.current?.showModal({});
    };

    const createQuery = useCallback(
        async (name = queryTitleRef.current) => {
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
                    await axios.post(
                        `${BACKEND_URI}${QUERIES_PATH_PART}`,
                        newQuery,
                    )
                ).data;
                console.log(`createdQuery.id=${createdQuery.id}`);
                dispatch(setIsQueryListRefreshPending(createdQuery.id));
                dispatch(setIsQueryChanged(false));
            } catch (error) {
                dispatch(
                    setError(
                        `Ошибка при подключении к серверу: ${error.message}`,
                    ),
                );
            } finally {
                dispatch(setIsLoading(false));
            }
        },
        [dispatch],
    );

    const saveAsQuery = useCallback(
        async (name = queryTitleRef.current) => {
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
                    await axios.post(
                        `${BACKEND_URI}${QUERIES_PATH_PART}`,
                        newQuery,
                    )
                ).data;
                console.log(`createdQuery.id=${createdQuery.id}`);
                dispatch(setIsQueryListRefreshPending(createdQuery.id));
                dispatch(setIsQueryChanged(false));
            } catch (error) {
                dispatch(
                    setError(
                        `Ошибка при подключении к серверу: ${error.message}`,
                    ),
                );
            } finally {
                dispatch(setIsLoading(false));
            }
        },
        [dispatch, openQuery],
    );

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
                    confirmationDialogRef.current?.showModal({
                        requestName: openQuery.name,
                        message: `В текущий запрос '${openQuery.name || ""}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.`,
                        question: "Отменить изменения?",
                        confirmButtonText: "Да",
                        rejectButtonText: "Нет",
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
    const handleSettingsDialogSubmit = (dialogData) => {};
    const handleSettingsDialogCancel = (dialogData) => {};

    const handleRejectDiscardChanges = () => {
        setIsCreateConfirmationPending(false);
    };

    const handleConfirmDiscardChanges = async (dataFromDialog) => {
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
            <SettingsDialog
                ref={settingsDialogRef}
                onOk={handleSettingsDialogSubmit}
                onCancel={handleSettingsDialogCancel}
            />
            <TextInputDialog
                ref={textInputDialogRef}
                onOk={handleTextInputDialogSubmit}
                onCancel={handleTextInputDialogCancel}
            />
            <ConfirmationDialog
                ref={confirmationDialogRef}
                onConfirm={handleConfirmDiscardChanges}
                onReject={handleRejectDiscardChanges}
            />
        </header>
    );
};

export default QueryToolBar;
