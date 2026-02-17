import '../styles/Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect <span className="highlight">Premium Domain</span>
          </h1>
          <p className="hero-subtitle">
            Discover hand-selected premium domain names that elevate your brand and drive success.
            Over 1000+ premium domains available for purchase.
          </p>
          <div className="hero-buttons">
            <a href="#domains" className="btn btn-primary">Browse Domains</a>
            <a href="#contact" className="btn btn-secondary">Contact Us</a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Premium Domains</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">Secure Transfer</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
