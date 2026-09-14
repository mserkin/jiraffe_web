import styles from './QueryList.module.css'
const QueryList = () => {
    const handleSubmit = (e) => {
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2>Запросы</h2>
        </form>
    )
}

export default QueryList