import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

import styles from "./QueryListItem.module.css";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";
import { fetchQuery } from "../redux/slices/openQuerySlice";
import {
  selectIsInitialQueryOpened,
  selectIsQueryChanged,
  setIsInitialQueryOpened,
  setIsLoading,
  setIsQueryChanged,
} from "../redux/slices/statusSlice";

const QueryListItem = ({ id, index, name, isOpen }) => {
  const MENU_BUTTON_ID_PREFIX = "menuBtn";
  const dispatch = useDispatch();
  const isQueryChanged = useSelector(selectIsQueryChanged);
  const isInitialQueryOpened = useSelector(selectIsInitialQueryOpened);
  const dialogRef = useRef(null);

  const handleButtonClick = async (event, queryId) => {
    console.log(`handleButtonClick(${queryId})`);
    event.stopPropagation();
  };

  const handleDialogClose = (event) => {
    event.stopPropagation();
    dialogRef.current?.close();
  };

  const openQuery = async (queryId) => {
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

  const handleDiscardChanges = async (event) => {
    event.stopPropagation();
    dialogRef.current?.close();
    dispatch(setIsQueryChanged(false));
    await openQuery(id);
  };

  const handleItemClick = async (queryId) => {
    console.log(`handleItemClick(${queryId})`);
    if (isQueryChanged) {
      dialogRef.current?.showModal();
      return;
    } else {
      await openQuery(queryId);
    }
  };

  const openInitialQuery = async () => {
    if (!isInitialQueryOpened && index == 0) {
      useEffect(() => {
        async function doOpenInitialQuery() {
          await openQuery(id);
          dispatch(setIsInitialQueryOpened(true));
        }
        doOpenInitialQuery();
      }, [dispatch, isInitialQueryOpened]);
    }
  };

  openInitialQuery();

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
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        В текущий запрос внесены не сохраненные изменения. Нажмите Да, чтобы
        отменить их и открыть новый запрос, нажмите Нет, чтобы вернуться к
        текущему запросу.
        <div className={styles.dialog_buttons}>
          <button type="button" onClick={handleDiscardChanges}>
            Да
          </button>
          <button type="button" onClick={handleDialogClose}>
            Нет
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default QueryListItem;
