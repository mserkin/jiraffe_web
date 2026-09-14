import styles from './QueryForm.module.css'
const QueryForm = () => {
    const handleSubmit = (e) => {
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2>Запросы</h2>
        </form>
    )
}

export default QueryForm