import { useDispatch, useSelector } from 'react-redux';
import styles from './QueryListItem.module.css';
import { BACKEND_URI, QUERIES_PATH_PART } from '../modules/const';
import { fetchQuery } from '../redux/slices/openQuerySlice';
import {
    selectIsQueryChanged,
    setIsLoading,
} from '../redux/slices/statusSlice';

const QueryListItem = ({ id, name, isOpen }) => {
    const MENU_BUTTON_ID_PREFIX = 'menuBtn';
    const dispatch = useDispatch();
    const isQueryChanged = useSelector(selectIsQueryChanged);
    const dialog = document.getElementById('dialog');
    const discardChangesBtn = document.getElementById('discardChangesBtn');
    const preserveChangesBtn = document.getElementById('preserveChangesBtn');

    discardChangesBtn.addEventListener('click', () => {
        dialog.close();
    });

    preserveChangesBtn.addEventListener('click', () => {
        dialog.close();
    });

    const handleButtonClick = async (event, queryId) => {
        console.log(`handleButtonClick(${queryId})`);
        event.stopPropagation();
    };

    const handleItemClick = async (queryId) => {
        console.log(`handleItemClick(${queryId})`);
        if (isQueryChanged) {
            dialog.showModal();
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
            <dialog id="dialog">
                В текущий запрос внесены не сохраненные изменения. Нажмите Да,
                чтобы отменить их и открыть новый запрос, нажмите Нет, чтобы
                вернуться к текущему запросу.
                <button type="button" id="discardChangesBtn">Да</button>
                <button type="button" id="preserveChangesBtn">Нет</button>
            </dialog>
        </div>
    );
};

export default QueryListItem;
