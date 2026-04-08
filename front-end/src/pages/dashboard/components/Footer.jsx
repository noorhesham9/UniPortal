import "./Footer.css";

const Footer = () => (
  <footer className="dash-footer">
    <div className="dash-footer-left">
      <span>&copy; 2024 University Enterprise Portal. Systems Online.</span>
      <span className="dash-secure-badge">
        <span className="secure-dot" />
        SECURE SERVER
      </span>
    </div>
    <div className="dash-footer-right">
      <a href="#privacy">PRIVACY</a>
      <a href="#terms">TERMS</a>
      <a href="#support">SUPPORT</a>
    </div>
  </footer>
);

export default Footer;
