import { useEffect, useState } from 'react';
import { supabase, Domain } from '../lib/supabase';
import '../styles/DomainSearch.css';

export default function DomainSearch() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    filterDomains();
  }, [searchTerm, selectedCategory, priceRange, domains]);

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setDomains(data || []);

      const uniqueCategories = Array.from(
        new Set((data || []).map(d => d.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDomains = () => {
    let filtered = [...domains];

    if (searchTerm) {
      filtered = filtered.filter(domain =>
        domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(domain => domain.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(domain => {
        const price = domain.price;
        switch (priceRange) {
          case 'under-25k':
            return price < 25000;
          case '25k-50k':
            return price >= 25000 && price < 50000;
          case '50k-100k':
            return price >= 50000 && price < 100000;
          case 'over-100k':
            return price >= 100000;
          default:
            return true;
        }
      });
    }

    setFilteredDomains(filtered);
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

  return (
    <section id="domains" className="section domains-section">
      <div className="container">
        <h2 className="section-title">Browse All Domains</h2>

        <div className="search-filters">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search domains by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under-25k">Under $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="over-100k">Over $100,000</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading domains...</div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredDomains.length} of {domains.length} domains
            </div>

            <div className="domains-grid">
              {filteredDomains.map((domain) => (
                <div key={domain.id} className="domain-card">
                  <div className="domain-card-header">
                    <h3 className="domain-card-name">{domain.name}</h3>
                    {domain.category && (
                      <span className="domain-card-category">{domain.category}</span>
                    )}
                  </div>

                  {domain.description && (
                    <p className="domain-card-description">{domain.description}</p>
                  )}

                  <div className="domain-card-meta">
                    {domain.word_count && (
                      <span className="meta-badge">
                        {domain.word_count} {domain.word_count === 1 ? 'word' : 'words'}
                      </span>
                    )}
                  </div>

                  <div className="domain-card-footer">
                    <div className="domain-card-price">{formatPrice(domain.price)}</div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleInquiry(domain.name)}
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDomains.length === 0 && (
              <div className="no-results">
                <p>No domains found matching your criteria.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
