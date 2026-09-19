import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const MENU_BUTTON_ID_PREFIX = "menuBtn";
  const dispatch = useDispatch();
  const isQueryChanged = useSelector(selectIsQueryChanged);
  const isInitialQueryOpened = useSelector(selectIsInitialQueryOpened);
  const dialogRef = useRef(null);
  const MENU_ITEMS = {menu_item_execute: "Выполнить", menu_item_rename: "Переименовать", menu_item_clone: "Клонировать", menu_item_delete: "Удалить"}
  
  const handleButtonClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const handleMenuItemClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen(false);
    switch(event.target.id) {
      case "menu_item_rename":
        break;
      case "menu_item_execute":
        break;
      case "menu_item_clone":
        break;
      case "menu_item_delete":
        break;
    }
  };

  const handleDialogClose = (event) => {
    event.stopPropagation();
    dialogRef.current?.close();
  };

  const openQuery = useCallback(
    async (queryId) => {
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
    },
    [dispatch],
  );

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

  useEffect(() => {
    if (isInitialQueryOpened || index !== 0) {
      return;
    }

    async function doOpenInitialQuery() {
      await openQuery(id);
      dispatch(setIsInitialQueryOpened(true));
    }

    doOpenInitialQuery();
  }, [dispatch, id, index, isInitialQueryOpened, openQuery]);

  return (
    <div
      className={isOpen ? styles.openQuery : styles.queryName}
      onClick={() => handleItemClick(id)}
    >
      <span>{name}</span>
      <span className={styles.menuWrapper}>
        <button
          className={`${styles.menuBtn} ${isMenuOpen ? styles.menuOpen : ""}`}
          type="button"
          id={`${MENU_BUTTON_ID_PREFIX}${id}`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={handleButtonClick}
        >
          ...
        </button>
        {isMenuOpen && (
          <div className={styles.contextMenu} role="menu">
            {Object.entries(MENU_ITEMS).map(
              ([menuItemId, menuItemText]) => (
                <button
                  id={menuItemId}
                  key={menuItemId}
                  type="button"
                  role="menuitem"
                  onClick={handleMenuItemClick}
                >
                  {menuItemText}
                </button>
              ),
            )}
          </div>
        )}        
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
