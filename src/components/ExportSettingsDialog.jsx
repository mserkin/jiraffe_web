import React from "react";
import {
    useCallback,
    forwardRef,
    useRef,
    useImperativeHandle,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "./ExportSettingsDialog.module.css";
import { BACKEND_URI, EXPORT_SETTINGS_PATH_PART } from "../modules/const";
import {
    setOneCellExportEnabled,
    selectOneCellExportEnabled,
    setOneCellExportTemplate,
    selectOneCellExportTemplate,
    setIndividualCellsTemplates,
    selectIndividualCellsTemplates,
} from "../redux/slices/exportSettingsSlice";
import { setError } from "../redux/slices/errorSlice";
import axios from "axios";

// Если fetchExportSettings импортируется из вашего слайса, раскомментируйте:
// import { fetchExportSettings } from "../redux/slices/exportSettingsSlice";

const ExportSettingsDialog = forwardRef(({ onOk, onCancel }, ref) => {
    const dispatch = useDispatch();
    const dialogRef = useRef(null);

    // Глобальные селекторы из Redux (используются для инициализации буфера)
    const reduxOneCellExportEnabled = useSelector(selectOneCellExportEnabled);
    const reduxOneCellExportTemplate = useSelector(selectOneCellExportTemplate);
    const reduxIndividualCellsTemplates = useSelector(selectIndividualCellsTemplates) || [];

    const TEMPLATES = [
        "{key}",
        "{issue_type}",
        "{status}",
        "{sprints}",
        "{estimate}",
        "{summary_tag}",
        "{summary}",
        "{creator_login}",
        "{creator}",
        "{assignee_login}",
        "{assignee}",
        "{reporter_login}",
        "{reporter}",
    ];

    // --- Локальные стейты-буферы для хранения изменений формы ---
    const [localEnabled, setLocalEnabled] = useState(false);
    const [localTemplate, setLocalTemplate] = useState("");
    const [localIndividualTemplates, setLocalIndividualTemplates] = useState([]);

    // Стейты для контроля за выделенными строками в списках
    const [selectedLeft, setSelectedLeft] = useState("");
    const [selectedRight, setSelectedRight] = useState("");

    // Локальное состояние диалога для хранения динамических данных родителя
    const [dialogData, setDialogData] = useState(null);

    useImperativeHandle(ref, () => ({
        showModal: (data) => {
            console.log(`showModal(${data ? JSON.stringify(data) : "null"}) executed`);
            setDialogData(data); 
            
            // Заполняем локальный буфер актуальными данными из Redux при открытии
            setLocalEnabled(reduxOneCellExportEnabled);
            setLocalTemplate(reduxOneCellExportTemplate);
            setLocalIndividualTemplates(reduxIndividualCellsTemplates);
            
            // Сбрасываем старые выделения в списках
            setSelectedLeft("");
            setSelectedRight("");

            const url = BACKEND_URI + EXPORT_SETTINGS_PATH_PART;
            console.log("Fetching export settings from url: " + url);
            
            // Если в вашем проекте есть fetchExportSettings, вызываем его
            // dispatch(fetchExportSettings({ url }));
            
            console.log("Export settings fetched");
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            setDialogData(null); 
        },
    }));

    const handleDialogClose = (event) => {
        event.stopPropagation();
        dialogRef.current?.close();
        setDialogData(null);
        onCancel(); // Просто закрываем, Redux не меняется
    };

    const updateExportSettings = useCallback(async (settingsToSave) => {
        console.log("updateExportSettings executed");
        try {
            console.log("PUT /settings/export");
            await axios.put(
                `${BACKEND_URI}${EXPORT_SETTINGS_PATH_PART}`,
                settingsToSave,
            );
        } catch (error) {
            dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
        }
    }, [dispatch]);

    const handleConfirm = async () => {
        const updatedExportSettings = {
            oneCellExportEnabled: localEnabled,
            oneCellExportTemplate: localTemplate,
            individualCellsTemplates: localIndividualTemplates,
        };

        // 1. При нажатии OK сохраняем всё в глобальный Redux-стор
        dispatch(setOneCellExportEnabled(localEnabled));
        dispatch(setOneCellExportTemplate(localTemplate));
        dispatch(setIndividualCellsTemplates(localIndividualTemplates));

        // 2. Отправляем обновленные данные на бэкенд
        await updateExportSettings(updatedExportSettings);

        // 3. Вызываем родительский callback и закрываем окно
        onOk(dialogData);
        dialogRef.current?.close();
        setDialogData(null);
    };

    // --- Обработчики кнопок перемещения (Dual Listbox) ---

    const handleAdd = () => {
        if (!selectedLeft) return;
        setLocalIndividualTemplates(prev => [...prev, selectedLeft]);
        setSelectedLeft(""); // Сбрасываем выбор в левом списке
    };

    const handleRemove = () => {
        if (!selectedRight) return;
        setLocalIndividualTemplates(prev => prev.filter(item => item !== selectedRight));
        setSelectedRight(""); // Сбрасываем выбор в правом списке
    };

    const handleUp = () => {
        if (!selectedRight) return;
        const index = localIndividualTemplates.indexOf(selectedRight);
        if (index > 0) {
            const updated = [...localIndividualTemplates];
            // Меняем местами текущий элемент с предыдущим
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
            setLocalIndividualTemplates(updated);
        }
    };

    const handleDown = () => {
        if (!selectedRight) return;
        const index = localIndividualTemplates.indexOf(selectedRight);
        if (index !== -1 && index < localIndividualTemplates.length - 1) {
            const updated = [...localIndividualTemplates];
            // Меняем местами текущий элемент со следующим
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            setLocalIndividualTemplates(updated);
        }
    };

    // Фильтруем левый список: убираем элементы, которые уже перенесены в правый
    const leftListElements = TEMPLATES.filter(item => !localIndividualTemplates.includes(item));

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
        >
            <p>Настройки экспорта</p>
            
            {/* Первый блок: Отдельные ячейки */}
            <div className={styles.individual_cells_radio_div}>
                <input 
                    type="radio" 
                    id="individual_cells_radio" 
                    name="export_mode" 
                    value="individual_cells" 
                    checked={!localEnabled}
                    onChange={(event) => setLocalEnabled(!event.target.checked)}
                />
                <label htmlFor="individual_cells_radio">Следующую информацию о рабочем элементе класть в отдельные ячейки</label>
            </div>
            
            {/* Контейнер со списками и кнопками */}
            <div className={styles.container || "container"}>
                {/* Левый список выбора */}
                <div>
                    <select 
                        id="leftList" 
                        className={styles.listBox || "list-box"} 
                        size={20}
                        value={selectedLeft}
                        onChange={(e) => setSelectedLeft(e.target.value)}
                    >
                        {leftListElements.map((member) => (
                            <option key={member} value={member}>{member}</option>
                        ))}
                    </select>
                </div>
                
                {/* Колонки кнопок управления */}
                <div className={styles.controls || "controls"}>
                    <div className={styles.btnGroup || "btn-group"}>
                        <button type="button" id="addBtn" onClick={handleAdd}>Добавить &rarr;</button>
                    </div>
                    <div className={styles.btnGroup || "btn-group"}>
                        <button type="button" id="removeBtn" onClick={handleRemove}>&larr; Удалить</button>
                    </div>
                    <div className={styles.btnGroup || "btn-group"}>
                        <button type="button" id="upBtn" onClick={handleUp}>Вверх</button>
                    </div>
                    <div className={styles.btnGroup || "btn-group"}>                    
                        <button type="button" id="downBtn" onClick={handleDown}>Вниз</button>
                    </div>                        
                </div>
                
                {/* Правый список выбора */}
                <div>
                    <select 
                        id="rightList" 
                        className={styles.listBox || "list-box"} 
                        size={20}
                        value={selectedRight}
                        onChange={(e) => setSelectedRight(e.target.value)}
                    >
                        {localIndividualTemplates.map((member) => (
                            <option key={member} value={member}>{member}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Второй блок: Одна ячейка */}
            <div className={styles.single_cell_radio_div}>
                <input 
                    type="radio" 
                    id="single_cell_radio" 
                    name="export_mode" 
                    value="single_cell" 
                    checked={localEnabled}
                    onChange={(event) => setLocalEnabled(event.target.checked)}
                />
                <label htmlFor="single_cell_radio">Информацию о рабочем элементе класть в одну ячейку, формируя строку в соответствии с шаблоном:</label>
            </div>
           
            {/* Текстовое поле ввода шаблона */}
            <div>
                <input
                    type="text"
                    value={localTemplate}
                    onChange={(event) => setLocalTemplate(event.target.value)}
                />
            </div>

            {/* Кнопки Подтверждения / Отмены диалога */}
            <div className={styles.dialog_buttons}>
                <button type="button" onClick={handleConfirm}>
                    Ok
                </button>
                <button type="button" onClick={handleDialogClose}>
                    Cancel
                </button>
            </div>
        </dialog>
    );
});

ExportSettingsDialog.displayName = "ExportSettingsDialog";
export default ExportSettingsDialog;

