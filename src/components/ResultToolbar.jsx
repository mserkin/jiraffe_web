import { VscCollapseAll, VscDownload, VscExpandAll } from 'react-icons/vsc';
import styles from './ResultToolbar.mobile.css';

const ResultToolbar = () => {

    const handleExpandAllClick = (e) => {

    }

    const handleCollapseAllClick = (e) => {
        
    }

    const handleExportClick = (e) => {
        
    }

    return (
        <ul className={styles.toolbar}>
            <li className={styles.toolbarIconItem} onClick={handleExpandAllClick}>
                <VscExpandAll size={32} />
            </li>
            <li className={styles.toolbarIconItem} onClick={handleCollapseAllClick}>
                <VscCollapseAll size={32} />
            </li>
            <li className={styles.toolbarIconItem} onClick={handleExportClick}>
                <VscDownload size={32} />
            </li>            
        </ul>
    );
};
