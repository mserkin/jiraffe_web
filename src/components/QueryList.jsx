import { useEffect } from 'react';
import { fetchQueryList } from '../redux/slices/queryListSlice';
import { setIsLoading, selectIsLoading } from '../redux/slices/statusSlice';
import styles from './QueryList.module.css'
import { useDispatch, useSelector } from 'react-redux';


const QueryList = () => {
    const BACKEND_URI = 'http://localhost:3010/queries';

    const dispatch = useDispatch();
    const isLoading = useSelector(selectIsLoading);
    useEffect(() => {
        const getQueryList = async () => {
            try {
                dispatch(setIsLoading(true));
                await dispatch(fetchQueryList(BACKEND_URI)).unwrap();
            } finally {
                dispatch(setIsLoading(false));
            }
        };

        getQueryList();
    }, [dispatch]);

    return (
        <form className={styles.formContainer}>
            <h2>Запросы</h2>
        </form>
    )
}

export default QueryList