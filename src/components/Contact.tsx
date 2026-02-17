import '../styles/Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">
          Have questions or ready to make a purchase? We're here to help you find the perfect domain.
        </p>

        <div className="contact-content">
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3>Email</h3>
              <a href="mailto:sales@premiumnameventures.com" className="contact-link">
                sales@premiumnameventures.com
              </a>
              <p className="contact-note">We respond within 24 hours</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <h3>Phone</h3>
              <a href="tel:+15199141655" className="contact-link">
                (519) 914-1655
              </a>
              <p className="contact-note">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>

          <div className="contact-cta">
            <h3>Ready to Get Started?</h3>
            <p>
              Browse our collection of premium domains or reach out directly to discuss your specific needs.
              Our team is ready to help you secure the perfect domain for your business.
            </p>
            <a href="mailto:sales@premiumnameventures.com" className="btn btn-primary">
              Contact Sales Team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
