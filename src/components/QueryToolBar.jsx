import { useSelector } from 'react-redux';
import { VscAdd, VscSave, VscSaveAs, VscEditCompact, VscPlay, VscDebugStop, VscSettings } from 'react-icons/vsc';

import styles from './QueryToolBar.module.css';
import { selectOpenQuery } from '../redux/slices/openQuerySlice';

const QueryToolBar = () => {
    const openQuery = useSelector(selectOpenQuery);
    
    return (
        <header>
            <nav>
                <ul className={styles.toolbar}>
                    <li className={styles.toolbarIconItem}>
                        <VscAdd size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSave size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSaveAs size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscEditCompact size={32} />
                    </li>
                    <li className={styles.toolbarTextItem}>
                    {
                        openQuery.name ? openQuery.name : "Jiraffe in the Web"
                    }
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscPlay size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscDebugStop size={32} />
                    </li>
                    <li className={styles.toolbarIconItem}>
                        <VscSettings size={32} />
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default QueryToolBar;
