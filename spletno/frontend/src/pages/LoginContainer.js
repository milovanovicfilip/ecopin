import styles from '../styles/LoginRegisterContainer.module.css';
import ForgotPasswordFormTab from "../components/ForgotPasswordFormTab"
import ForgotPasswordImage from "../components/ForgotPasswordImage";
import LoginFormTab from "../components/LoginFormTab";
import RegisterImage from "../components/RegisterImage";
import RegisterFormTab from "../components/RegisterFormTab";


export default function LoginContainer(props) {
  
  let content;

  switch (props.page) {
    case "forgot":
      content = (
        <>
          <ForgotPasswordFormTab />
          <ForgotPasswordImage />
        </>
      );
      break;
    case "register":
      content = (
        <>
          <RegisterFormTab />
          <RegisterImage image ="register" />
        </>
      );
      break;
    case "login":
      content = (
        <>
          <LoginFormTab />
          <RegisterImage image="login" />
        </>
      )
      break;
    default:
      content = null;
      break;
  }
  return (
    <div className={styles['register-center-wrapper']}>
        <div className={`${styles['register-container']} d-flex`}>
          {content}
        </div>
    </div>
  );
}
