import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./QueryListItem.module.css";
import { BACKEND_URI, QUERIES_PATH_PART } from "../modules/const";
import { fetchQuery, selectOpenQuery } from "../redux/slices/openQuerySlice";
import {
  selectIsInitialQueryOpened,
  selectIsQueryChanged,
  setIsInitialQueryOpened,
  setIsLoading,
  setIsQueryChanged,
} from "../redux/slices/statusSlice";
import { setError } from "../redux/slices/errorSlice";

const QueryListItem = ({ id, index, name, isOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [queryName, setQueryName] = useState(name);
  const [isRenameConfirmationPending, setIsRenameConfirmationPending] = useState(false); 
  const MENU_BUTTON_ID_PREFIX = "menuBtn";
  const dispatch = useDispatch();
  const isQueryChanged = useSelector(selectIsQueryChanged);
  const isInitialQueryOpened = useSelector(selectIsInitialQueryOpened);
  const openQueryData = useSelector(selectOpenQuery);
  const dialogRef = useRef(null);
  const renameDialogRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_ITEMS = {menu_item_execute: "Выполнить", menu_item_rename: "Переименовать", menu_item_clone: "Клонировать", menu_item_delete: "Удалить"}
  
  const handleButtonClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const handleRenameClick = () => {
    setQueryName(name);
    renameDialogRef.current?.showModal();
  };

  const saveRenamedQuery = useCallback(async () => {
    const queryWithoutId = { ...openQueryData };
    delete queryWithoutId.id;
    const renamedQuery = {
      ...queryWithoutId,
      name: queryName,
    };

    try {
      dispatch(setIsLoading(true));
      await axios.post(
        BACKEND_URI + QUERIES_PATH_PART,
        renamedQuery,
      );
      dispatch(setIsQueryChanged(false));
    } catch (error) {
      dispatch(
        setError(`Ошибка при подключении к серверу: ${error.message}`),
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, openQueryData, queryName]);

  const handleRenameSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    renameDialogRef.current?.close();

    if (isQueryChanged) {
      setIsRenameConfirmationPending(true);
      dialogRef.current?.showModal();
      return;
    }

    await saveRenamedQuery();
  };

  const handleMenuItemClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen(false);
    switch(event.target.id) {
      case "menu_item_rename":
        handleRenameClick();
        break;
      case "menu_item_execute":
        break;
      case "menu_item_clone":
        break;
      case "menu_item_delete":
        break;
    }
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleDocumentClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        event.stopPropagation();
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isMenuOpen]);

  const handleDialogClose = (event) => {
    event.stopPropagation();
    dialogRef.current?.close();
    setIsRenameConfirmationPending(false);
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
    if (isRenameConfirmationPending) {
      setIsRenameConfirmationPending(false);
      await saveRenamedQuery();
      return;
    }
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
      <span className={styles.menuWrapper} ref={menuRef}>
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
        отменить их, нажмите Нет, чтобы вернуться к текущему запросу.
        <br/>Отменить изменения?
        <div className={styles.dialog_buttons}>
          <button type="button" onClick={handleDiscardChanges}>
            Да
          </button>
          <button type="button" onClick={handleDialogClose}>
            Нет
          </button>
        </div>
      </dialog>
      <dialog
        ref={renameDialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Ввод названия запроса</h3>
        <p>Введите название запроса:</p>
        <form onSubmit={handleRenameSubmit}>
          <input
            type="text"
            value={queryName}
            onChange={(event) => setQueryName(event.target.value)}
            autoFocus
          />
          <div className={styles.dialog_buttons}>
            <button type="submit">Ok</button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                renameDialogRef.current?.close();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>      
    </div>
  );
};

export default QueryListItem;
