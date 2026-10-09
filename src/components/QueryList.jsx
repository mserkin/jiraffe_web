import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchQueryList } from "../redux/slices/queryListSlice";
import {
  setIsLoading,
  selectIsLoading,
  setIsInitialQueryOpened,
  selectIsQueryListRefreshPending,
  setIsQueryListRefreshPending
} from "../redux/slices/statusSlice";
import styles from "./QueryList.module.css";
import QueryListItem from "./QueryListItem";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";
import { fetchQuery, selectOpenQuery } from "../redux/slices/openQuerySlice";

const QueryList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const openQuery = useSelector(selectOpenQuery);
  const isQueryListRefreshPending = useSelector(selectIsQueryListRefreshPending);
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
      const refreshedQueryList = await refreshQueryList();
      const queries = Array.isArray(refreshedQueryList)
        ? refreshedQueryList
        : [refreshedQueryList];
      const clonedQuery = queries.find(
        (query) => query?.name === clonedQueryName,
      );

      if (!clonedQuery) {
        throw new Error(
          `Не удалось найти клонированный запрос "${clonedQueryName}"`,
        );
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

  const handleQueryRenamed = useCallback(
    async (renamedQueryName) => {
      const refreshedQueryList = await refreshQueryList();
      const queries = Array.isArray(refreshedQueryList)
        ? refreshedQueryList
        : [refreshedQueryList];
      const renamedQuery = queries.find(
        (query) => query?.name === renamedQueryName,
      );

      if (!renamedQuery) {
        throw new Error(
          `Не удалось найти переименованный запрос "${renamedQueryName}"`,
        );
      }

      dispatch(setIsLoading(true));
      try {
        await dispatch(
          fetchQuery({
            url: BACKEND_URI + QUERIES_PATH_PART,
            queryId: renamedQuery.id,
          }),
        ).unwrap();
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, refreshQueryList],
  );

  const handleQueryDeleted = useCallback(async () => {
    console.log(`handleQueryDeleted executed`);
    console.log(`openQuery: ${JSON.stringify(openQuery)}`)
    const id = openQuery.id;
    console.log(`id=${id}`);
    const refreshedQueryList = await refreshQueryList();
    const queries = Array.isArray(refreshedQueryList)
      ? refreshedQueryList
      : [refreshedQueryList];
    const openQueryFound = queries.find((query) => query?.id === id);
    console.log(`openQueryFound=${JSON.stringify(openQueryFound)}`);
    if (!openQueryFound) {
      console.log("Setting setIsInitialQueryOpened=false");
      dispatch(setIsInitialQueryOpened(false));
      console.log("isInitialQueryOpened is set to false");
    }

    dispatch(setIsLoading(true));
    try {
      await dispatch(
        fetchQuery({
          url: BACKEND_URI + QUERIES_PATH_PART,
          queryId: id,
        }),
      ).unwrap();
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, openQuery.id, refreshQueryList]);

const handleIsQueryListRefreshPending = useCallback(async (queryId) => {
    console.log(`handleIsQueryListRefreshPending executed`);
    const id = isQueryListRefreshPending.id;
    console.log(`id=${queryId}`);
    const refreshedQueryList = await refreshQueryList();
    const queries = Array.isArray(refreshedQueryList)
      ? refreshedQueryList
      : [refreshedQueryList];
    const openQueryFound = queries.find((query) => query?.id === queryId);
    console.log(`openQueryFound=${JSON.stringify(openQueryFound)}`);

    dispatch(setIsLoading(true));
    try {
      await dispatch(
        fetchQuery({
          url: BACKEND_URI + QUERIES_PATH_PART,
          queryId,
        }),
      ).unwrap();
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, refreshQueryList]);

  useEffect(() => {
      if (!isQueryListRefreshPending) {
          return;
      }

      handleIsQueryListRefreshPending(isQueryListRefreshPending)
          .catch((error) => {
              console.error('Не удалось обновить список запросов', error);
          })
          .finally(() => {
              dispatch(setIsQueryListRefreshPending(false));
          });
  }, [dispatch, handleIsQueryListRefreshPending, isQueryListRefreshPending]);

  return (
    <div className={styles.formContainer} aria-busy={isLoading}>
      <div>
        <h2 className={styles.title}>Запросы</h2>
      </div>
      <div>
        {isLoading && <div>Загрузка...</div>}
        {queryList.length === 0 && !isLoading ? (
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
              onQueryRenamed={handleQueryRenamed}
              onQueryDeleted={handleQueryDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QueryList;
