import { VscCollapseAll, VscDownload, VscExpandAll } from "react-icons/vsc";
import styles from "./ResultToolbar.module.css";
import ExportSettingsDialog from "./ExportSettingsDialog";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSearchResults } from "../redux/slices/searchResultsSlice";
import { setError } from "../redux/slices/errorSlice";
import { exportTreeToXlsx } from "../modules/exportIssues";
import {
    fetchExportSettings,
    selectExportSettings,
    selectExportSettingsStatus,
} from "../redux/slices/exportSettingsSlice";
import { BACKEND_URI, EXPORT_SETTINGS_PATH_PART } from "../modules/const";

const ResultToolbar = ({ onExpandAll, onCollapseAll, tree }) => {
    const dispatch = useDispatch();
    const exportSettingsDialogRef = useRef(null);
    const { progress, total } = useSelector(selectSearchResults);
    const exportSettings = useSelector(selectExportSettings);
    const exportSettingsStatus = useSelector(selectExportSettingsStatus);

    const handleExpandAllClick = (e) => {
        e.preventDefault();
        onExpandAll?.();
    };

    const handleCollapseAllClick = (e) => {
        e.preventDefault();
        onCollapseAll?.();
    };

    const handleExportClick = async (e) => {
        e.preventDefault();

        if (exportSettingsStatus === "succeeded") {
            exportSettingsDialogRef.current?.showModal(exportSettings);
            return;
        }

        const result = await dispatch(
            fetchExportSettings({
                url: `${BACKEND_URI}${EXPORT_SETTINGS_PATH_PART}`,
            }),
        );
        if (fetchExportSettings.fulfilled.match(result)) {
            exportSettingsDialogRef.current?.showModal(result.payload);
        }
    };

    const handleExportSettingsDialogSubmit = (settings) => {
        if (!tree) {
            dispatch(setError("Нет дерева результатов для экспорта."));
            return;
        }

        if (total > 0 && progress < total) {
            dispatch(setError("Подождите завершения поиска перед экспортом."));
            return;
        }

        if (!tree.children?.length) {
            dispatch(setError("Нет рабочих элементов для экспорта."));
            return;
        }

        const hasExportFields = settings.oneCellExportEnabled
            ? Boolean(settings.oneCellExportTemplate?.trim())
            : settings.individualCellsTemplates?.length > 0;
        if (!hasExportFields) {
            dispatch(setError("Выберите поля или задайте шаблон для экспорта."));
            return;
        }

        try {
            exportTreeToXlsx(tree, settings);
        } catch (error) {
            dispatch(setError(`Не удалось сформировать XLSX-файл: ${error.message}`));
        }
    };

    const handleExportSettingsDialogCancel = () => {};

    return (
        <>
            <ul className={styles.toolbar}>
                <li className={styles.toolbarIconItem}>
                    <button
                        type="button"
                        aria-label="Развернуть все элементы"
                        title="Развернуть все элементы"
                        onClick={handleExpandAllClick}
                    >
                        <VscExpandAll size={32} />
                    </button>
                </li>
                <li className={styles.toolbarIconItem}>
                    <button
                        type="button"
                        aria-label="Свернуть все элементы"
                        title="Свернуть все элементы"
                        onClick={handleCollapseAllClick}
                    >
                        <VscCollapseAll size={32} />
                    </button>
                </li>
                <li className={styles.toolbarIconItem}>
                    <button
                        type="button"
                        aria-label="Экспортировать результаты"
                        title={
                            exportSettingsStatus === "loading"
                                ? "Загрузка настроек экспорта"
                                : "Экспортировать результаты"
                        }
                        aria-busy={exportSettingsStatus === "loading"}
                        disabled={exportSettingsStatus === "loading"}
                        onClick={handleExportClick}
                    >
                        <VscDownload size={32} />
                    </button>
                </li>
            </ul>
            <ExportSettingsDialog
                ref={exportSettingsDialogRef}
                onOk={handleExportSettingsDialogSubmit}
                onCancel={handleExportSettingsDialogCancel}
            />
        </>
    );
};

export default ResultToolbar;
