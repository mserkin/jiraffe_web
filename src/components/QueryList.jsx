import { useEffect } from "react";
import { fetchQueryList } from "../redux/slices/queryListSlice";
import { setIsLoading, selectIsLoading } from "../redux/slices/statusSlice";
import styles from "./QueryList.module.css";
import { useDispatch, useSelector } from "react-redux";
import QueryListItem from "./QueryListItem";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";

const QueryList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const queryList = useSelector((state) => state.queryList);

  useEffect(() => {
    const getQueryList = async () => {
      try {
        dispatch(setIsLoading(true));
        await dispatch(fetchQueryList(BACKEND_URI+QUERIES_PATH_PART)).unwrap();
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    getQueryList();
  }, [dispatch]);

  return (
    <form className={styles.formContainer}>
      <div>
        <h2 className={styles.title}>Запросы</h2>
      </div>
      <div>
        {queryList.length === 0 ? (
          <div className={styles.emptyQueryListMessage}>Пока нет запросов</div>
        ) : (
          Array.isArray(queryList) &&
          queryList.map((query, index) => {
            return (
              <QueryListItem
                key={`QueryListItem-${query.id}`}
                id={query.id}
                name={query.name}
              />
            );
          })
        )}
      </div>
    </form>
  );
};

export default QueryList;
