import styles from '../styles/LoginRegisterImage.module.css';

export default function RegisterImage(props) {
    let content;
    switch (props.image) {
        case "login":
            content = (
                <>
                    <div className={styles['login-image']}></div>
                </>
            );
            break;
        case "register":
            content = (
                <>
                    <div className={styles['register-image']}></div>
                </>
            )
            break;
        default:
            content = null;
            break;
    }
    return (
        <>
            {content}
        </>
    );
}