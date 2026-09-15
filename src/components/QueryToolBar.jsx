import styles from './QueryToolBar.module.css';
import { VscAdd, VscSave, VscSaveAs, VscEditCompact, VscPlay, VscDebugStop, VscSettings } from 'react-icons/vsc';

const QueryToolBar = () => {
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
                    <li className={styles.toolbarTextItem}>Jiraffe Web 0.0</li>
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
