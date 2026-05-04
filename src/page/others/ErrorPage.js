import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { Header } from "../navbar/Header";
import { Container } from "./component";
export default function ErrorPage({title = "Error", message = "Something went wrong" }) {
  const navigate = useNavigate();

  return (
    <>
        <Header />
        <div className={styles.outerContainer}>
        <Container title={title} message={message}/>
        <button onClick={() => navigate("/")}>
            Go Home
        </button>
        </div>
    </>
  );
}