import { useDispatch, useSelector } from 'react-redux';
import {
    VscAdd,
    VscSave,
    VscSaveAs,
    VscEditCompact,
    VscPlay,
    VscDebugStop,
    VscSettings,
} from 'react-icons/vsc';

import {
    selectIsQueryChanged,
    setIsQueryChanged,
    setIsLoading,
    setIsQueryListRefreshPending,
} from '../redux/slices/statusSlice';
import styles from './QueryToolBar.module.css';
import { selectOpenQuery } from '../redux/slices/openQuerySlice';
import { useCallback, useRef, useState } from 'react';
import { setError } from '../redux/slices/errorSlice';
import axios from 'axios';
import { BACKEND_URI, QUERIES_PATH_PART } from '../modules/const';

const QueryToolBar = () => {
    const dispatch = useDispatch();
    const openQuery = useSelector(selectOpenQuery);
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const createDialogRef = useRef(null);
    const discardChangesDialogRef = useRef(null);
    const [queryName, setQueryName] = useState('');
    const [isCreateConfirmationPending, setIsCreateConfirmationPending] =
        useState(false);

    const handleAddClick = (event) => {
        createDialogRef.current?.showModal();
    };

    const createQuery = useCallback(async () => {
        console.log('createQuery executed');
        try {
            dispatch(setIsLoading(true));
            const newQuery = {
                name: queryName,
                queryText: null,
                epicViewType: null,
                levelFilters: [],
            };
            console.log('POST /queries');
            const createdQuery = (
                await axios.post(`${BACKEND_URI}${QUERIES_PATH_PART}`, newQuery)
            ).data;
            console.log(`createdQuery.id=${createdQuery.id}`);
            setIsQueryListRefreshPending(createdQuery.id);
            dispatch(setIsQueryChanged(false));
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        } finally {
            dispatch(setIsLoading(false));
        }
    }, [dispatch, queryName]);

    const handleCreateSubmit = async (event) => {
        console.log('handleCreateSubmit executed');
        event.preventDefault();
        event.stopPropagation();
        createDialogRef.current?.close();

        if (isQueryChanged) {
            console.log('isQueryChange==true');
            setIsCreateConfirmationPending(true);
            discardChangesDialogRef.current?.showModal();
            return;
        } else {
            console.log('isQueryChange==false');
            await createQuery();
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
                    <li className={styles.toolbarIconItem}>
                        <VscAdd size={32} onClick={handleAddClick} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSave size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSaveAs size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscEditCompact size={32} />
                    </li>
                    <li className={styles.toolbarTextItem}>
                        {openQuery.name ? openQuery.name : 'Jiraffe in the Web'}
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscPlay size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscDebugStop size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSettings size={32} />
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
                        value={queryName}
                        className={styles.query_name_input}
                        onChange={(event) => setQueryName(event.target.value)}
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
