import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import styles from "./QueryListItem.module.css";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";
import { fetchQuery, selectOpenQuery } from "../redux/slices/openQuerySlice";
import {
    selectIsInitialQueryOpened,
    selectIsQueryChanged,
    setIsInitialQueryOpened,
    setIsLoading,
    setIsQueryChanged,
} from "../redux/slices/statusSlice";
import { setError } from "../redux/slices/errorSlice";
import TextInputDialog from "./TextInputDialog";
import ConfirmationDialog from "./ConfirmationDialog";

const QueryListItem = ({
    id,
    index,
    name,
    isOpen,
    onQueryCloned,
    onQueryRenamed,
    onQueryDeleted,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [queryName, setQueryName] = useState(name);
    const [isCloneConfirmationPending, setIsCloneConfirmationPending] =
        useState(false);
    const [isRenameConfirmationPending, setIsRenameConfirmationPending] =
        useState(false);
    const [isDeleteConfirmationPending, setIsDeleteConfirmationPending] =
        useState(false);
    const MENU_BUTTON_ID_PREFIX = "menuBtn";
    const dispatch = useDispatch();
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const isInitialQueryOpened = useSelector(selectIsInitialQueryOpened);
    const openQuery = useSelector(selectOpenQuery);
    const confirmationDialogRef = useRef(null);
    const textInputDialogRef = useRef(null);
    const queryTitleRef = useRef("");

    const deleteDialogRef = useRef(null);
    const menuRef = useRef(null);
    const PendingAction = Object.freeze({
        CLONE: "CLONE",
        RENAME: "RENAME",
        DELETE: "DELETE",
    });
    const MENU_ITEMS = {
        menu_item_rename: "Переименовать",
        menu_item_clone: "Клонировать",
        menu_item_delete: "Удалить",
    };

    const handleButtonClick = (event) => {
        event.stopPropagation();
        setIsMenuOpen((isOpen) => !isOpen);
    };

    const handleCloneClick = () => {
        setQueryName(name);
        textInputDialogRef.current?.showModal({
            prompt: "Введите название нового запроса:",
            pendingAction: PendingAction.CLONE,
        });
    };

    const handleRenameClick = () => {
        setQueryName(name);
        textInputDialogRef.current?.showModal({
            prompt: "Введите новое название запроса:",
            pendingAction: PendingAction.RENAME,
        });
    };

    const handleDeleteClick = () => {
        setQueryName(name);
        deleteDialogRef.current?.showModal();
    };

    const saveClonedQuery = useCallback(
        async (clonedQueryName) => {
            try {
                dispatch(setIsLoading(true));
                const sourceQuery = (
                    await axios.get(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`)
                ).data;
                const queryWithoutId = { ...sourceQuery };

                delete queryWithoutId.id;
                const clonedQuery = {
                    ...queryWithoutId,
                    name: clonedQueryName,
                };

                await axios.post(BACKEND_URI + QUERIES_PATH_PART, clonedQuery);
                await onQueryCloned(clonedQueryName);
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
        [dispatch, id, onQueryCloned, queryName],
    );

    const handleTextInputDialogSubmit = async (dialogData) => {
        const nextQueryTitle = dialogData.requestName ?? "";
        console.log("handleTextInputDialogSubmit executed");
        console.log(`dialogData.requestName: '${nextQueryTitle}'`);

        queryTitleRef.current = nextQueryTitle;
        setQueryName(nextQueryTitle);

        switch (dialogData.pendingAction) {
            case PendingAction.CLONE:
                if (isQueryChanged) {
                    setIsCloneConfirmationPending(true);
                    console.log(openQuery.name);
                    confirmationDialogRef.current?.showModal({
                        requestName: openQuery.name,
                        newRequestName: nextQueryTitle,
                        message: `В текущий запрос '${openQuery.name || ""}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.`,
                        question: "Отменить изменения?",
                        confirmButtonText: "Да",
                        rejectButtonText: "Нет",
                    });
                    return;
                }
                await saveClonedQuery(nextQueryTitle);
                break;

            case PendingAction.RENAME:
                if (isQueryChanged) {
                    setIsRenameConfirmationPending(true);
                    confirmationDialogRef.current?.showModal({
                        requestName: openQuery.name,
                        newRequestName: nextQueryTitle,
                        message: `В текущий запрос '${openQuery.name || ""}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.`,
                        question: "Отменить изменения?",
                        confirmButtonText: "Да",
                        rejectButtonText: "Нет",
                    });
                    return;
                } else {
                    await saveRenamedQuery(nextQueryTitle);
                }
            default:
                console.error(
                    `Unknown pendingAction: ${dialogData.pendingAction}`,
                );
        }
    };

    const handleTextInputDialogCancel = (dialogData) => {};

    const saveRenamedQuery = useCallback(
        async (newQueryName) => {
            try {
                dispatch(setIsLoading(true));
                const sourceQuery = (
                    await axios.get(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`)
                ).data;
                const renamedQuery = {
                    ...sourceQuery,
                    name: newQueryName,
                };

                await axios.put(
                    `${BACKEND_URI}${QUERIES_PATH_PART}/${id}`,
                    renamedQuery,
                );
                await onQueryRenamed(newQueryName);
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
        [dispatch, id, onQueryRenamed, queryName],
    );

    const deleteQuery = useCallback(async () => {
        try {
            dispatch(setIsLoading(true));
            await axios.delete(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`);
            await onQueryDeleted();
            dispatch(setIsQueryChanged(false));
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, id, onQueryDeleted]);

    const handleDeleteSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteDialogRef.current?.close();

        if (isQueryChanged) {
            setIsDeleteConfirmationPending(true);
            confirmationDialogRef.current?.showModal({
                requestName: openQuery.name,
                message: `В текущий запрос '${openQuery.name || ""}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.`,
                question: "Отменить изменения?",
                confirmButtonText: "Да",
                rejectButtonText: "Нет",
            });
            return;
        } else {
            await deleteQuery();
        }
    };

    const handleMenuItemClick = (event) => {
        event.stopPropagation();
        setIsMenuOpen(false);
        switch (event.target.id) {
            case "menu_item_rename":
                handleRenameClick();
                break;
            case "menu_item_clone":
                handleCloneClick();
                break;
            case "menu_item_delete":
                handleDeleteClick();
                break;
        }
    };

    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }

        const handleDocumentClick = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                event.stopPropagation();
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("click", handleDocumentClick, true);
        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
        };
    }, [isMenuOpen]);

    const openQueryById = useCallback(
        async (queryId) => {
            try {
                dispatch(setIsLoading(true));
                await dispatch(
                    fetchQuery({
                        url: BACKEND_URI + QUERIES_PATH_PART,
                        queryId,
                    }),
                );
            } finally {
                dispatch(setIsLoading(false));
            }
        },
        [dispatch],
    );

    const handleConfirmDiscardChanges = async (dataFromDialog) => {
        if (isCloneConfirmationPending) {
            setIsCloneConfirmationPending(false);
            await saveClonedQuery(dataFromDialog.newRequestName);
            return;
        }
        if (isRenameConfirmationPending) {
            setIsRenameConfirmationPending(false);
            await saveRenamedQuery(dataFromDialog.newRequestName);
            return;
        }
        if (isDeleteConfirmationPending) {
            setIsDeleteConfirmationPending(false);
            await deleteQuery();
            return;
        }
        dispatch(setIsQueryChanged(false));
        await openQueryById(id);
    };

    const handleRejectDiscardChanges = async (dataFromDialog) => {
        setIsCloneConfirmationPending(false);
        setIsRenameConfirmationPending(false);
        setIsDeleteConfirmationPending(false);
    };

    const handleItemClick = async (queryId) => {
        console.log(`handleItemClick(${queryId})`);
        if (isQueryChanged) {
            confirmationDialogRef.current?.showModal({
                requestName: openQuery.name,
                message: `В текущий запрос '${openQuery.name || ""}' внесены не сохраненные изменения. Если продолжить, изменения будут потеряны. Нажмите «Да», чтобы продолжить, или «Нет», чтобы вернуться к редактированию текущего запроса.`,
                question: "Отменить изменения?",
                confirmButtonText: "Да",
                rejectButtonText: "Нет",
            });
            return;
        } else {
            await openQueryById(queryId);
        }
    };

    useEffect(() => {
        if (isInitialQueryOpened || index !== 0) {
            return;
        }

        async function doOpenInitialQuery() {
            await openQueryById(id);
            dispatch(setIsInitialQueryOpened(true));
        }

        doOpenInitialQuery();
    }, [dispatch, id, index, isInitialQueryOpened, openQueryById]);

    return (
        <div
            className={isOpen ? styles.openQuery : styles.queryName}
            onClick={() => handleItemClick(id)}
        >
            <span>{name}</span>
            <span className={styles.menuWrapper} ref={menuRef}>
                <button
                    className={`${styles.menuBtn} ${isMenuOpen ? styles.menuOpen : ""}`}
                    type="button"
                    id={`${MENU_BUTTON_ID_PREFIX}${id}`}
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                    onClick={handleButtonClick}
                >
                    ...
                </button>
                {isMenuOpen && (
                    <div className={styles.contextMenu} role="menu">
                        {Object.entries(MENU_ITEMS).map(
                            ([menuItemId, menuItemText]) => (
                                <button
                                    id={menuItemId}
                                    key={menuItemId}
                                    type="button"
                                    role="menuitem"
                                    onClick={handleMenuItemClick}
                                >
                                    {menuItemText}
                                </button>
                            ),
                        )}
                    </div>
                )}
            </span>

            <TextInputDialog
                ref={textInputDialogRef}
                onOk={handleTextInputDialogSubmit}
                onCancel={handleTextInputDialogCancel}
            />
            <dialog
                ref={deleteDialogRef}
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
            >
                <p>Вы уверены, что хотите удалить запрос '{queryName}' ?</p>
                <form onSubmit={handleDeleteSubmit}>
                    <div className={styles.dialog_buttons}>
                        <button type="submit">Да</button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                deleteDialogRef.current?.close();
                            }}
                        >
                            Нет
                        </button>
                    </div>
                </form>
            </dialog>
            <ConfirmationDialog
                ref={confirmationDialogRef}
                onConfirm={handleConfirmDiscardChanges}
                onReject={handleRejectDiscardChanges}
            />
        </div>
    );
};

export default QueryListItem;
