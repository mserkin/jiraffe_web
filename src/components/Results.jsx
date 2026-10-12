import styles from './Results.module.css'

const Results = () => {
    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.leftPane}></div>
            <div className={styles.rightPane}></div>
        </form>
    )
}

export default Results