import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchQueryList } from "../redux/slices/queryListSlice";
import { setIsLoading, selectIsLoading } from "../redux/slices/statusSlice";
import styles from "./QueryList.module.css";
import QueryListItem from "./QueryListItem";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";
import { selectOpenQuery } from "../redux/slices/openQuerySlice";

const QueryList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const openQuery = useSelector(selectOpenQuery);
  const queryList = useSelector((state) => state.queryList);

  const refreshQueryList = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      return await dispatch(
        fetchQueryList(BACKEND_URI + QUERIES_PATH_PART),
      ).unwrap();
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    refreshQueryList();
  }, [refreshQueryList]);

  const handleQueryCloned = useCallback(
    async (clonedQueryName) => {
      console.log("handleQueryCloned executed");
      const refreshedQueryList = await refreshQueryList();
      const queries = Array.isArray(refreshedQueryList)
        ? refreshedQueryList
        : [refreshedQueryList];
      const clonedQuery = queries.find(
        (query) => query?.name === clonedQueryName,
      );
      console.log(`clonedQuery=${clonedQuery.id}`);

      if (!clonedQuery) {
        throw new Error(`Не удалось найти клонированный запрос "${clonedQueryName}"`);
      }

      dispatch(setIsLoading(true));
      try {
        await dispatch(
          fetchQuery({
            url: BACKEND_URI + QUERIES_PATH_PART,
            queryId: clonedQuery.id,
          }),
        ).unwrap();
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, refreshQueryList],
  );

  return (
    <div className={styles.formContainer} aria-busy={isLoading}>
      <div>
        <h2 className={styles.title}>Запросы</h2>
      </div>
      <div>
        {isLoading && <div>Загрузка...</div>}
        {queryList.length === 0 && !isLoading ?  (
          <div className={styles.emptyQueryListMessage}>Пока нет запросов</div>
        ) : (
          Array.isArray(queryList) &&
          queryList.map((query, index) => (
                <QueryListItem
                    key={`QueryListItem-${query.id}`}
                    index={index}
                    id={query.id}
                    name={query.name}
                    isOpen={query.id === openQuery.id}
                    onQueryCloned={handleQueryCloned}
                />
            )
          )
        )}
      </div>
    </div>
  );
};

export default QueryList;
