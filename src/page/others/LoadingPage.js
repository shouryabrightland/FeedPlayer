import { Header } from "../navbar/Header";
import { Container } from "./component";

export default function LoadingPage({msg = "please wait"}) {
  return (<>
    <Header/>
    <Container title="Loading..." message={msg}/>
  </>)
}