import { useDispatch, useSelector } from 'react-redux';
import styles from './QueryListItem.module.css';
import { BACKEND_URI, QUERIES_PATH_PART } from '../modules/const';
import { fetchQuery } from '../redux/slices/openQuerySlice';
import {
    selectIsQueryChanged,
    setIsLoading,
} from '../redux/slices/statusSlice';
import { useRef } from 'react';

const QueryListItem = ({ id, name, isOpen }) => {
    const MENU_BUTTON_ID_PREFIX = 'menuBtn';
    const dispatch = useDispatch();
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const dialogRef = useRef(null);

    const handleButtonClick = async (event, queryId) => {
        console.log(`handleButtonClick(${queryId})`);
        event.stopPropagation();
    };

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
    };

    const handleItemClick = async (queryId) => {
        console.log(`handleItemClick(${queryId})`);
        if (isQueryChanged) {
            dialog.current?.showModal();
        } else {
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
        }
    };

    return (
        <div
            className={isOpen ? styles.openQuery : styles.queryName}
            onClick={() => handleItemClick(id)}
        >
            <span>{name}</span>
            <span className={styles.menuWrapper}>
                <button
                    className={styles.menuBtn}
                    type="button"
                    id={`${MENU_BUTTON_ID_PREFIX}${id}`}
                    onClick={(e) => handleButtonClick(e, id)}
                >
                    ...
                </button>
            </span>
            <dialog ref={dialogRef}>
                В текущий запрос внесены не сохраненные изменения. Нажмите Да,
                чтобы отменить их и открыть новый запрос, нажмите Нет, чтобы
                вернуться к текущему запросу.
                <button
                    type="button"
                    onClick={handleDialogClose}
                >
                    Да
                </button>
                <button
                    type="button"
                    onClick={handleDialogClose}
                >
                    Нет
                </button>
            </dialog>
        </div>
    );
};

export default QueryListItem;
