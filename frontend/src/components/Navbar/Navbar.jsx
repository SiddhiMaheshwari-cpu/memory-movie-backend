import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container">

        <div className="navbar__logo">
          <div className="logo-circle"></div>

          <div className="logo-content">
            <h2>Aetheris</h2>
            <span>AI Memory Studio</span>
          </div>
        </div>

        <nav className="navbar__links">
          <a href="#">Studio</a>
          <a href="#">Dashboard</a>
          <a href="#">Flow</a>
          <a href="#">Pricing</a>
        </nav>

        <div className="navbar__buttons">
          <button className="login-btn">
            Sign In
          </button>

          <button className="cta-btn">
            Start Creating
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;