import { useCallback, useRef, useState } from "react";
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
    selectIsQueryExecuting,
    setIsQueryChanged,
    setIsQueryExecuting,
    setIsLoading,
    setIsQueryListRefreshPending,
} from "../redux/slices/statusSlice";
import { selectTimeout, selectProject } from "../redux/slices/settingsSlice";
import {
    selectIssueTypes,
    selectLinkTypes,
    fetchJiraMetadata,
} from "../redux/slices/jiraMetadataSlice";
import styles from "./QueryToolBar.module.css";
import { selectOpenQuery, setQueryName } from "../redux/slices/openQuerySlice";
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
import {
    clearSearchResults,
    setSearchComplete,
    setSearchResults,
} from "../redux/slices/searchResultsSlice";
import {
    buildLevelFilterJql,
    countIssueTree,
    expandIssueTree,
} from "../modules/issueTree";
import { queryNameExists } from "../modules/queryNames";
import { replaceCustomFilterValues } from "../modules/customFilters";

const QueryToolBar = ({ settingsDialogRef }) => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const issueTypes = useSelector(selectIssueTypes);
    const linkTypes = useSelector(selectLinkTypes);
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const isQueryExecuting = useSelector(selectIsQueryExecuting);
    const timeout = useSelector(selectTimeout);
    const defaultProject = useSelector(selectProject);

    const confirmationDialogRef = useRef(null);
    const timeoutDialogRef = useRef(null);
    const textInputDialogRef = useRef(null);
    const queryTitleRef = useRef("");
    const taskIdRef = useRef(null);
    const isStopRequestedRef = useRef(false);
    const searchRunIdRef = useRef(0);
    const searchAbortControllerRef = useRef(null);
    const timeoutTimerRef = useRef(null);

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
            requestName: openQuery.name,
            pendingAction: PendingAction.CHANGE_NAME,
        });
    };

    const handleSettingsClick = async (event) => {
        settingsDialogRef.current?.showModal({});
    };

    const createQuery = useCallback(
        async (name = queryTitleRef.current) => {
            try {
                dispatch(setIsLoading(true));
                const newQuery = {
                    name,
                    project: defaultProject,
                    queryText: null,
                    epicViewType: null,
                    customFilters: [],
                    levelFilters: [{}],
                };
                const createdQuery = (
                    await axios.post(
                        `${BACKEND_URI}${QUERIES_PATH_PART}`,
                        newQuery,
                    )
                ).data;
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
        [dispatch, defaultProject],
    );

    const saveAsQuery = useCallback(
        async (name = queryTitleRef.current) => {
            try {
                dispatch(setIsLoading(true));
                const newQuery = {
                    name,
                    project: openQuery.project,
                    queryText: openQuery.queryText,
                    countLimit: openQuery.countLimit,
                    epicViewType: openQuery.epicViewType,
                    customFilters: openQuery.customFilters,
                    levelFilters: openQuery.levelFilters,
                };
                const createdQuery = (
                    await axios.post(
                        `${BACKEND_URI}${QUERIES_PATH_PART}`,
                        newQuery,
                    )
                ).data;
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
                project: openQuery.project,
                queryText: openQuery.queryText,
                countLimit: openQuery.countLimit,
                epicViewType: openQuery.epicViewType,
                customFilters: openQuery.customFilters,
                levelFilters: openQuery.levelFilters,
            };
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

        queryTitleRef.current = nextQueryTitle;
        setQueryTitle(nextQueryTitle);

        if (dialogData.pendingAction === PendingAction.ADD_NEW) {
            dispatch(clearSearchResults());
        }

        const shouldCheckName =
            dialogData.pendingAction === PendingAction.ADD_NEW ||
            dialogData.pendingAction === PendingAction.SAVE_AS ||
            dialogData.pendingAction === PendingAction.CHANGE_NAME;
        let isNameTaken = false;
        if (shouldCheckName) {
            try {
                isNameTaken = await queryNameExists(
                    nextQueryTitle,
                    dialogData.pendingAction === PendingAction.CHANGE_NAME
                        ? openQuery.id
                        : undefined,
                );
            } catch (error) {
                dispatch(
                    setError(
                        `Ошибка при подключении к серверу: ${error.message}`,
                    ),
                );
                return;
            }
        }

        if (isNameTaken) {
            confirmationDialogRef.current?.showModal({
                message: "Запрос с таким именем уже есть, введите другое имя",
                confirmButtonText: "Продолжить",
                singleButton: true,
                retryDialogData: dialogData,
            });
            return;
        }

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
    const handleSettingsDialogSubmit = () => {};
    const handleSettingsDialogCancel = () => {};
    const handleSettingsDialogClosed = () => {
        dispatch(fetchJiraMetadata());
    };

    const handleRejectDiscardChanges = () => {
        setIsCreateConfirmationPending(false);
    };

    const handleConfirmDiscardChanges = async (dataFromDialog) => {
        if (dataFromDialog?.retryDialogData) {
            textInputDialogRef.current?.showModal(
                dataFromDialog.retryDialogData,
            );
            return;
        }
        if (isCreateConfirmationPending) {
            setIsCreateConfirmationPending(false);
            await createQuery();
            return;
        }
        dispatch(setIsQueryChanged(false));
        //await openQuery(id);
    };

    const constructJQLQuery = () => {
        const query_text = replaceCustomFilterValues(
            openQuery.queryText,
            openQuery.customFilters,
        ).trim();
        const order_pos = query_text.toUpperCase().indexOf("ORDER BY");
        const order_clause = order_pos > 0 ? query_text.slice(order_pos) : "";
        const where_clause = order_pos > 0 ? query_text.slice(0, order_pos - 1) : query_text;
        const level0 = openQuery.levelFilters?.[0] ?? {};
        const filtersJql = buildLevelFilterJql(level0, issueTypes);
        const projectJql = openQuery.project ? `project = "${openQuery.project}"` : "";
        let query = '';
        if (where_clause) {
            if (filtersJql) {
                if (projectJql) {
                    query = `${projectJql} AND (${filtersJql} AND (${where_clause})) ${order_clause}`;
                }
                else {                                    
                    query = `${filtersJql} AND (${where_clause}) ${order_clause}`;
                }
            }
            else {
                if (projectJql) {
                    query = `${projectJql} AND (${where_clause}) ${order_clause}`
                }
                else {                
                    query = `${where_clause} ${order_clause}`
                }
            }
        }
        else {
            if (filtersJql) {
                if (projectJql) {
                    query = `${projectJql} AND (${filtersJql}) ${order_clause}`;                
                }
                else {           
                    query = `${filtersJql} ${order_clause}`;
                }
            }
        }
        return query
    }

    const handlePlayClick = async () => {
        const timeoutSeconds = Number(timeout);
        if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
            dispatch(setError("Таймаут должен быть положительным числом."));
            return;
        }

        const runId = ++searchRunIdRef.current;
        const abortController = new AbortController();
        searchAbortControllerRef.current = abortController;
        dispatch(setIsQueryExecuting(true));
        dispatch(clearSearchResults());
        taskIdRef.current = null;
        isStopRequestedRef.current = false;
        let isTimedOut = false;
        const expireSearch = () => {
            if (isTimedOut || runId !== searchRunIdRef.current) {
                return;
            }
            isTimedOut = true;
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
            isStopRequestedRef.current = true;
            searchRunIdRef.current += 1;
            abortController.abort();
            searchAbortControllerRef.current = null;
            dispatch(clearSearchResults());
            dispatch(setIsQueryExecuting(false));
            timeoutDialogRef.current?.showModal({
                message:
                    "Время выполенения запроса превысило заданный лимит. Вы можете упростить запрос или увеличить лимит в настройках, задав значение параметра Таймаут",
                confirmButtonText: "Понятно",
                singleButton: true,
            });

            const taskId = taskIdRef.current;
            taskIdRef.current = null;
            if (taskId) {
                axios
                    .post(`${BACKEND_URI}search/cancel/${taskId}`)
                    .catch((error) => {
                        console.error(
                            "Не удалось отменить задачу после истечения таймаута:",
                            error,
                        );
                    });
            }
        };
        timeoutTimerRef.current = setTimeout(
            expireSearch,
            timeoutSeconds * 1000,
        );

        const levelFilters = Array.isArray(openQuery.levelFilters)
            ? openQuery.levelFilters
            : [];
        const rootIssues = [];
        const processedIssueKeys = new Set();
        const pendingExpansions = new Set();
        const countLimit = Number(openQuery.countLimit) || 0;
        const issueBudget = { count: 0, limit: countLimit };
        let latestLimitReached = false;
        let limitStopRequested = false;
        let searchCompleted = false;
        let expansionFailed = false;

        const cloneIssueTree = (issue) => ({
            ...issue,
            children: (issue.children ?? []).map(cloneIssueTree),
            epicChildren: (issue.epicChildren ?? []).map(cloneIssueTree),
        });
        const publishSearchResults = () => {
            const totalCount = countIssueTree(rootIssues);
            issueBudget.count = totalCount;
            if (countLimit > 0 && totalCount >= countLimit) {
                latestLimitReached = true;
                limitStopRequested = true;
                const taskId = taskIdRef.current;
                if (taskId) {
                    axios
                        .post(`${BACKEND_URI}search/cancel/${taskId}`)
                        .catch((error) => {
                            const responseError = error.response?.data?.error;
                            dispatch(
                                setError(
                                    `Не удалось остановить загрузку после достижения лимита: ${
                                        responseError ?? error.message
                                    }`,
                                ),
                            );
                        });
                }
            }
            dispatch(
                setSearchResults({
                    issues: rootIssues.map(cloneIssueTree),
                    progress: totalCount,
                    countLimit,
                    limitReached:
                        latestLimitReached ||
                        (countLimit > 0 && totalCount >= countLimit),
                }),
            );
        };

        const searchIssuesByJql = async (jql, limit) => {
            const { data } = await axios.get(
                `${BACKEND_URI}search?jql=${encodeURIComponent(jql)}${
                    limit === undefined ? "" : `&limit=${limit}`
                }`,
                { signal: abortController.signal },
            );
            return data;
        };

        try {
            const jql = constructJQLQuery();
            const { data: startResponse } = await axios.post(
                `${BACKEND_URI}search/start`,
                { jql, countLimit: openQuery.countLimit },
                { signal: abortController.signal },
            );
            const taskId = startResponse?.taskId;
            if (!taskId) {
                throw new Error("Сервер не вернул ID задачи поиска.");
            }

            if (
                runId !== searchRunIdRef.current ||
                isStopRequestedRef.current ||
                abortController.signal.aborted
            ) {
                await axios.post(`${BACKEND_URI}search/cancel/${taskId}`);
                return;
            }

            taskIdRef.current = taskId;

            while (
                runId === searchRunIdRef.current &&
                !isStopRequestedRef.current &&
                !limitStopRequested &&
                !abortController.signal.aborted
            ) {
                await Promise.all(pendingExpansions);
                if (limitStopRequested) {
                    break;
                }
                await new Promise((resolve, reject) => {
                    const timer = setTimeout(() => {
                        abortController.signal.removeEventListener(
                            "abort",
                            handleAbort,
                        );
                        resolve();
                    }, 1000);
                    const handleAbort = () => {
                        clearTimeout(timer);
                        reject(new Error("Запрос поиска был отменен."));
                    };
                    abortController.signal.addEventListener(
                        "abort",
                        handleAbort,
                        { once: true },
                    );
                });
                if (
                    runId !== searchRunIdRef.current ||
                    isStopRequestedRef.current ||
                    limitStopRequested ||
                    abortController.signal.aborted
                ) {
                    break;
                }

                const { data: statusResponse } = await axios.get(
                    `${BACKEND_URI}search/status/${taskId}`,
                    { signal: abortController.signal },
                );
                if (
                    statusResponse.error !== null &&
                    statusResponse.error !== undefined
                ) {
                    const errorMessage =
                        typeof statusResponse.error === "string"
                            ? statusResponse.error
                            : JSON.stringify(statusResponse.error);
                    dispatch(setError(errorMessage));
                    break;
                }
                if (!Array.isArray(statusResponse.issues)) {
                    throw new Error(
                        "Сервер вернул некорректный список результатов поиска.",
                    );
                }
                if (statusResponse.status === "timedout") {
                    expireSearch();
                    break;
                }

                latestLimitReached = statusResponse.limitReached === true;
                const availableRootSlots =
                    countLimit > 0
                        ? Math.max(0, countLimit - issueBudget.count)
                        : undefined;
                const newRootIssues = statusResponse.issues
                    .filter((issue) => {
                        const key = issue.key ?? issue.id;
                        return key && !processedIssueKeys.has(key);
                    })
                    .slice(
                        0,
                        availableRootSlots === undefined
                            ? undefined
                            : availableRootSlots,
                    )
                    .map((issue) => ({ ...issue, children: [] }));
                for (const issue of newRootIssues) {
                    processedIssueKeys.add(issue.key ?? issue.id);
                }
                rootIssues.push(...newRootIssues);
                issueBudget.count += newRootIssues.length;
                publishSearchResults();

                if (
                    newRootIssues.length > 0 &&
                    levelFilters.length > 1 &&
                    (countLimit === 0 || issueBudget.count < countLimit)
                ) {
                    let expansion;
                    expansion = expandIssueTree(
                        newRootIssues,
                        levelFilters,
                        linkTypes,
                        issueTypes,
                        searchIssuesByJql,
                        () =>
                            runId !== searchRunIdRef.current ||
                            isStopRequestedRef.current ||
                            abortController.signal.aborted,
                        () => {
                            if (
                                runId === searchRunIdRef.current &&
                                !isStopRequestedRef.current &&
                                !abortController.signal.aborted
                            ) {
                                publishSearchResults();
                            }
                        },
                        openQuery.epicViewType ?? "linkedAndChildren",
                        issueBudget,
                    )
                        .then(() => {
                            if (
                                runId === searchRunIdRef.current &&
                                !isStopRequestedRef.current &&
                                !abortController.signal.aborted
                            ) {
                                publishSearchResults();
                            }
                        })
                        .catch((expandError) => {
                            if (
                                abortController.signal.aborted ||
                                isStopRequestedRef.current
                            ) {
                                return;
                            }
                            expansionFailed = true;
                            dispatch(
                                setError(
                                    `Ошибка при расширении дерева результатов: ${expandError.message}`,
                                ),
                            );
                        })
                        .finally(() => {
                            pendingExpansions.delete(expansion);
                        });
                    pendingExpansions.add(expansion);
                }

                if (statusResponse.status !== "processing") {
                    searchCompleted = statusResponse.status === "completed";
                    break;
                }
            }
        } catch (error) {
            if (
                abortController.signal.aborted ||
                isStopRequestedRef.current
            ) {
                return;
            }
            const responseError = error.response?.data?.error;
            dispatch(
                setError(
                    `Ошибка при подключении к серверу: ${
                        responseError ?? error.message
                    }`,
                ),
            );
        } finally {
            await Promise.all(pendingExpansions);
            if (runId === searchRunIdRef.current) {
                if (
                    (searchCompleted || limitStopRequested) &&
                    !expansionFailed &&
                    !isStopRequestedRef.current &&
                    !abortController.signal.aborted
                ) {
                    dispatch(setSearchComplete(true));
                }
                clearTimeout(timeoutTimerRef.current);
                timeoutTimerRef.current = null;
                taskIdRef.current = null;
                searchAbortControllerRef.current = null;
                dispatch(setIsQueryExecuting(false));
            }
        }
    };

    const handleStopClick = async () => {
        isStopRequestedRef.current = true;
        searchRunIdRef.current += 1;
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
        searchAbortControllerRef.current?.abort();
        searchAbortControllerRef.current = null;
        const taskId = taskIdRef.current;
        taskIdRef.current = null;
        try {
            if (taskId) {
                await axios.post(`${BACKEND_URI}search/cancel/${taskId}`);
            }
        } catch (error) {
            const responseError = error.response?.data?.error;
            dispatch(
                setError(
                    `Ошибка при подключении к серверу: ${
                        responseError ?? error.message
                    }`,
                ),
            );
        } finally {
            dispatch(setIsQueryExecuting(false));
        }
    };

    const handleTimeoutDialogConfirm = () => {};

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
                    <li
                        onClick={handlePlayClick}
                        className={
                            isQueryExecuting
                                ? styles.toolbarIconItemDisabled
                                : styles.toolbarIconItem
                        }                        
                    >
                        <VscPlay size={32} />
                    </li>
                    <li
                        onClick={handleStopClick}
                        className={
                            isQueryExecuting
                                ? styles.toolbarIconItem
                                : styles.toolbarIconItemDisabled
                        }
                    >
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
                onClosed={handleSettingsDialogClosed}
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
            <ConfirmationDialog
                ref={timeoutDialogRef}
                onConfirm={handleTimeoutDialogConfirm}
                onReject={handleTimeoutDialogConfirm}
            />
        </header>
    );
};

export default QueryToolBar;
