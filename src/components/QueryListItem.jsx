import { useDispatch } from 'react-redux';
import styles from './QueryListItem.module.css';
import { BACKEND_URI, QUERIES_PATH_PART } from '../modules/const';
import { fetchQuery } from '../redux/slices/openQuerySlice';
import { setIsLoading } from '../redux/slices/statusSlice';
import { useEffect } from 'react';

const QueryListItem = ({ id, name }) => {
    const dispatch = useDispatch();
    const MENU_BUTTON_ID_PREFIX = 'menuBtn';

    const handleOnClick = async (queryId) => {
        console.log(`handleOnClick(${queryId})`);
                try {
                    dispatch(setIsLoading(true));
                    await dispatch(
                        fetchQuery({
                            url: BACKEND_URI + QUERIES_PATH_PART, 
                            queryId
                }),
            );
                } finally {
                    dispatch(setIsLoading(false));
                }
    };

    return (
        <div className={styles.queryName}>
            <span>{name}</span>
            <span className={styles.menuWrapper}>
                <button
                    className={styles.menuBtn}
                    type="button"
                    id={`${MENU_BUTTON_ID_PREFIX}${id}`}
                    onClick={() => handleOnClick(id)}
                >
                    ...
                </button>
            </span>
        </div>
    );
};

export default QueryListItem;
