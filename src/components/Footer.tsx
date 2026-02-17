import '../styles/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-brand">Premium Name Ventures</h3>
            <p className="footer-tagline">
              Your trusted source for premium domain names since 2020
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#domains">Browse Domains</a></li>
              <li><a href="#featured">Featured Domains</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:sales@premiumnameventures.com">
                  sales@premiumnameventures.com
                </a>
              </li>
              <li>
                <a href="tel:+15199141655">
                  (519) 914-1655
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Premium Name Ventures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
