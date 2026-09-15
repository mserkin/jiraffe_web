import { useDispatch } from 'react-redux';
import styles from './QueryListItem.module.css';
import { BACKEND_URI, QUERIES_PATH_PART } from '../modules/const';
import { fetchQuery } from '../redux/slices/openQuerySlice';
import { setIsLoading } from '../redux/slices/statusSlice';

const QueryListItem = ({ id, name, isOpen }) => {
    const dispatch = useDispatch();
    const MENU_BUTTON_ID_PREFIX = 'menuBtn';

    const handleButtonClick = async (event, queryId) => {
        console.log(`handleButtonClick(${queryId})`);
        event.stopPropagation();
    };

    const handleItemClick = async (queryId) => {
        console.log(`handleItemClick(${queryId})`);
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
    };

    return (
        <div className={isOpen? styles.openQuery: styles.queryName} onClick={() => handleItemClick(id)}>
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
        </div>
    );
};

export default QueryListItem;
