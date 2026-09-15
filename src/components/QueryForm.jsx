import styles from './QueryForm.module.css'
import QueryToolBar from './QueryToolBar'
const QueryForm = () => {
    const handleSubmit = (e) => {
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <QueryToolBar />
        </form>
    )
}

export default QueryForm