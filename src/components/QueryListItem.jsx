import { useDispatch } from 'react-redux';
import styles from './QueryListItem.module.css';

const QueryListItem = ({
    id,
    name,
}) => {
    const dispatch = useDispatch();
    const MENU_BUTTON_ID_PREFIX = 'menuBtn';
    
    const handleOnClick = (e, queryId) => {
        console.log(`handleOnClick(${queryId})`)
    };

    return (
        <div className={styles.queryName}>
            <span>
                {name}
            </span>
            <span>
                <button
                    className={styles.menuBtn}
                    type="button"
                    id={`${MENU_BUTTON_ID_PREFIX}${id}`}
                    onClick={(e) => handleOnClick(e, id)}
                >
                    ...
                </button>
            </span>
        </div>
    );
};

export default QueryListItem;
