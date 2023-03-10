import { Helmet } from "react-helmet";
import { Footer } from "./components/footer";
import { Player } from "./pages/player";

import "./style/defaults/variables.css"
import "./style/defaults/page-setup.css"
import "./style/defaults/transitions.css"

export default function App() {
  return <>
      <Helmet>
        <title>ReactRadio</title>
      </Helmet>

      <Player />
      <Footer />
  </>
}