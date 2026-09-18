import styles from './QueryList.module.css'
const Results = () => {
    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2>Запросы</h2>
        </form>
    )
}

export default Results