import "./Landing.css";

import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";

function Landing() {
  return (
    <main className="landing">

      <div className="landing__background">

        <div className="light light-one"></div>
        <div className="light light-two"></div>
        <div className="light light-three"></div>

      </div>

      <Navbar />

      <Hero />

    </main>
  );
}

export default Landing;