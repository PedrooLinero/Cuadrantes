import { Outlet } from "react-router";
import Menu from "../components/Menu";
import CreateCenterScreen from "../components/CrearCentro";


function Home() {
  return (
    <>
      <Menu />
      <CreateCenterScreen />
      <Outlet />
    </>
  );
}

export default Home;
