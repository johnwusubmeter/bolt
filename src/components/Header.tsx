import { Link } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text">Premium Name Ventures</span>
          </Link>

          <nav className="nav">
            <a href="#domains" className="nav-link">Domains</a>
            <a href="#featured" className="nav-link">Featured</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
