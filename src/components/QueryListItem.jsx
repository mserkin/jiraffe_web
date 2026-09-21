import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

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
import { setError } from "../redux/slices/errorSlice";

const QueryListItem = ({ id, index, name, isOpen, onQueryCloned, onQueryRenamed, onQueryDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [queryName, setQueryName] = useState(name);
  const [isCloneConfirmationPending, setIsCloneConfirmationPending] =
    useState(false);
  const [isRenameConfirmationPending, setIsRenameConfirmationPending] =
    useState(false);
  const [isDeleteConfirmationPending, setIsDeleteConfirmationPending] =
    useState(false);
  const MENU_BUTTON_ID_PREFIX = "menuBtn";
  const dispatch = useDispatch();
  const isQueryChanged = useSelector(selectIsQueryChanged);
  const isInitialQueryOpened = useSelector(selectIsInitialQueryOpened);
  const discardChangesDialogRef = useRef(null);
  const cloneDialogRef = useRef(null);
  const renameDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_ITEMS = {
    menu_item_rename: "Переименовать",
    menu_item_clone: "Клонировать",
    menu_item_delete: "Удалить",
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const handleCloneClick = () => {
    setQueryName(name);
    cloneDialogRef.current?.showModal();
  };

  const handleRenameClick = () => {
    setQueryName(name);
    renameDialogRef.current?.showModal();
  }

  const handleDeleteClick = () => {
    setQueryName(name);
    deleteDialogRef.current?.showModal();
  }

  const saveClonedQuery = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const sourceQuery = (
        await axios.get(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`)
      ).data;
      const queryWithoutId = { ...sourceQuery };

      delete queryWithoutId.id;
      const clonedQuery = {
        ...queryWithoutId,
        name: queryName,
      };

      await axios.post(BACKEND_URI + QUERIES_PATH_PART, clonedQuery);
      await onQueryCloned(queryName);
      dispatch(setIsQueryChanged(false));
    } catch (error) {
      dispatch(setError(`Ошибка при подключении к серверу: ${error.message}`));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, id, onQueryCloned, queryName]);

  const handleCloneSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    cloneDialogRef.current?.close();

    if (isQueryChanged) {
      setIsCloneConfirmationPending(true);
      discardChangesDialogRef.current?.showModal();
      return;
    }

    await saveClonedQuery();
  };

  const saveRenamedQuery = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const sourceQuery = (
        await axios.get(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`)
      ).data;
      const renamedQuery = {
        ...sourceQuery,
        name: queryName,
      };

      await axios.put(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`, renamedQuery);
      await onQueryRenamed(queryName);
      dispatch(setIsQueryChanged(false));
    } catch (error) {
      dispatch(setError(`Ошибка при подключении к серверу: ${error.message}`));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, id, onQueryRenamed, queryName]);

  const handleRenameSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    renameDialogRef.current?.close();

    if (isQueryChanged) {
      setIsRenameConfirmationPending(true);
      discardChangesDialogRef.current?.showModal();
      return;
    }
    else {
      await saveRenamedQuery();
    }
  };

  const deleteQuery = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      await axios.delete(`${BACKEND_URI}${QUERIES_PATH_PART}/${id}`);
      await onQueryDeleted();
      dispatch(setIsQueryChanged(false));
    } catch (error) {
      dispatch(setError(`Ошибка при подключении к серверу: ${error.message}`));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, id, onQueryRenamed, queryName]);


  const handleDeleteSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    deleteDialogRef.current?.close();

    if (isQueryChanged) {
      setIsDeleteConfirmationPending(true);
      discardChangesDialogRef.current?.showModal();
      return;
    }
    else {
      await deleteQuery();
    }
  };

  const handleMenuItemClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen(false);
    switch (event.target.id) {
      case "menu_item_rename":
        handleRenameClick();
        break;
      case "menu_item_clone":
        handleCloneClick();
        break;
      case "menu_item_delete":
        handleDeleteClick();
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
    discardChangesDialogRef.current?.close();
    if (isCloneConfirmationPending) {
      setIsCloneConfirmationPending(false);
    }
    if (isRenameConfirmationPending) {
      setIsRenameConfirmationPending(false);
    }
    if (isDeleteConfirmationPending) {
      setIsDeleteConfirmationPending(false);
    }
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
    discardChangesDialogRef.current?.close();
    if (isCloneConfirmationPending) {
      setIsCloneConfirmationPending(false);
      await saveClonedQuery();
      return;
    }
    if (isRenameConfirmationPending) {
      setIsRenameConfirmationPending(false);
      await saveRenamedQuery();
      return;
    }
    if (isDeleteConfirmationPending) {
      setIsDeleteConfirmationPending(false);
      await deleteQuery();
      return;
    }
    dispatch(setIsQueryChanged(false));
    await openQuery(id);
  };

  const handleItemClick = async (queryId) => {
    console.log(`handleItemClick(${queryId})`);
    if (isQueryChanged) {
      discardChangesDialogRef.current?.showModal();
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
            {Object.entries(MENU_ITEMS).map(([menuItemId, menuItemText]) => (
              <button
                id={menuItemId}
                key={menuItemId}
                type="button"
                role="menuitem"
                onClick={handleMenuItemClick}
              >
                {menuItemText}
              </button>
            ))}
          </div>
        )}
      </span>
      <dialog
        ref={discardChangesDialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        В текущий запрос внесены не сохраненные изменения. Нажмите Да, чтобы
        отменить их, нажмите Нет, чтобы вернуться к текущему запросу.
        <br />
        Отменить изменения?
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
        ref={cloneDialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <p>Введите название нового запроса:</p>
        <form onSubmit={handleCloneSubmit}>
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
                cloneDialogRef.current?.close();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
      <dialog
        ref={renameDialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <p>Введите новое название запроса:</p>
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
      <dialog
        ref={deleteDialogRef}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <p>Вы уверены, что хотите удалить запрос '{queryName}' ?</p>
        <form onSubmit={handleDeleteSubmit}>
          <div className={styles.dialog_buttons}>
            <button type="submit">Yes</button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                deleteDialogRef.current?.close();
              }}
            >
              No
            </button>
          </div>
        </form>
      </dialog>      
    </div>
  );
};

export default QueryListItem;
