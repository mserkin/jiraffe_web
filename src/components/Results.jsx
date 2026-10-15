import IssuePropertyEditor from './IssuePropertyEditor';
import IssueToolbar from './IssueToolbar';
import styles from './Results.module.css'
import ResultToolbar from './ResultToolbar';
import ResultTreePane from './ResultTreePane';


const Results = () => {
    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.leftPane}>
                <ResultToolbar />
                <ResultTreePane />
            </div>
            <div className={styles.rightPane}>
                <IssueToolbar />
                <IssuePropertyEditor />
            </div>
        </form>
    )
}

export default Results;