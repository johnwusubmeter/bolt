import { useEffect, useState } from 'react';
import { supabase, Domain } from '../lib/supabase';
import '../styles/FeaturedDomains.css';

export default function FeaturedDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedDomains();
  }, []);

  const fetchFeaturedDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_featured', true)
        .order('price', { ascending: false })
        .limit(6);

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching featured domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInquiry = (domainName: string) => {
    const subject = encodeURIComponent(`Inquiry about ${domainName}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in purchasing the domain ${domainName}. Please provide more information.\n\nThank you.`);
    window.location.href = `mailto:sales@premiumnameventures.com?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <section id="featured" className="section featured-section">
        <div className="container">
          <h2 className="section-title">Featured Premium Domains</h2>
          <div className="loading">Loading featured domains...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="section featured-section">
      <div className="container">
        <h2 className="section-title">Featured Premium Domains</h2>
        <p className="section-subtitle">
          Hand-picked premium domains that represent exceptional value and branding potential
        </p>

        <div className="featured-grid">
          {domains.map((domain) => (
            <div key={domain.id} className="featured-card">
              <div className="featured-badge">Featured</div>
              <div className="domain-name">{domain.name}</div>
              <div className="domain-category">{domain.category || 'Premium'}</div>
              <p className="domain-description">
                {domain.description || 'Premium domain name available for purchase'}
              </p>
              <div className="domain-meta">
                {domain.word_count && (
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 4h12v1H2V4zm0 3h12v1H2V7zm0 3h8v1H2v-1z"/>
                    </svg>
                    {domain.word_count} {domain.word_count === 1 ? 'word' : 'words'}
                  </span>
                )}
              </div>
              <div className="domain-price">{formatPrice(domain.price)}</div>
              <button
                className="btn btn-primary btn-inquiry"
                onClick={() => handleInquiry(domain.name)}
              >
                Inquire Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
