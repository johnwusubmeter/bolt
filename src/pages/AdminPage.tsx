import { useState, useEffect } from 'react';
import { supabase, Domain } from '../lib/supabase';
import '../styles/AdminPage.css';

export default function AdminPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [csvUploading, setCsvUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    word_count: '',
    category: '',
    description: '',
    is_featured: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDomains();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setIsAuthenticated(!!adminData);
    }

    setAuthChecking(false);
  };

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const domainData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      word_count: formData.word_count ? parseInt(formData.word_count) : null,
      category: formData.category.trim() || null,
      description: formData.description.trim() || null,
      is_featured: formData.is_featured,
    };

    try {
      if (editingDomain) {
        const { error } = await supabase
          .from('domains')
          .update(domainData)
          .eq('id', editingDomain.id);

        if (error) throw error;
        alert('Domain updated successfully!');
      } else {
        const { error } = await supabase
          .from('domains')
          .insert([domainData]);

        if (error) throw error;
        alert('Domain added successfully!');
      }

      resetForm();
      fetchDomains();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      price: domain.price.toString(),
      word_count: domain.word_count?.toString() || '',
      category: domain.category || '',
      description: domain.description || '',
      is_featured: domain.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Domain deleted successfully!');
      fetchDomains();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      word_count: '',
      category: '',
      description: '',
      is_featured: false,
    });
    setEditingDomain(null);
    setShowForm(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const nameIndex = headers.indexOf('name');
      const priceIndex = headers.indexOf('price');
      const wordCountIndex = headers.indexOf('word_count');
      const categoryIndex = headers.indexOf('category');
      const descriptionIndex = headers.indexOf('description');
      const featuredIndex = headers.indexOf('is_featured');

      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error('CSV must have "name" and "price" columns');
      }

      const domainsToInsert = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());

        domainsToInsert.push({
          name: values[nameIndex],
          price: parseFloat(values[priceIndex]),
          word_count: wordCountIndex !== -1 && values[wordCountIndex] ? parseInt(values[wordCountIndex]) : null,
          category: categoryIndex !== -1 ? values[categoryIndex] : null,
          description: descriptionIndex !== -1 ? values[descriptionIndex] : null,
          is_featured: featuredIndex !== -1 ? values[featuredIndex].toLowerCase() === 'true' : false,
        });
      }

      const { error } = await supabase
        .from('domains')
        .upsert(domainsToInsert, { onConflict: 'name' });

      if (error) throw error;

      alert(`Successfully uploaded ${domainsToInsert.length} domains!`);
      fetchDomains();
    } catch (error: any) {
      alert(`Error uploading CSV: ${error.message}`);
    } finally {
      setCsvUploading(false);
      e.target.value = '';
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      await checkAuth();
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    }
  };

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="loading-screen">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <h1>Domain Management</h1>
          <button onClick={() => supabase.auth.signOut()} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="container admin-content">
        <div className="admin-actions">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add New Domain'}
          </button>

          <div className="csv-upload">
            <label className="btn btn-secondary">
              {csvUploading ? 'Uploading...' : 'Upload CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={csvUploading}
                style={{ display: 'none' }}
              />
            </label>
            <span className="csv-hint">CSV format: name,price,word_count,category,description,is_featured</span>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="domain-form">
            <h2>{editingDomain ? 'Edit Domain' : 'Add New Domain'}</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Domain Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="example.com"
                />
              </div>

              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="10000"
                />
              </div>

              <div className="form-group">
                <label>Word Count</label>
                <input
                  type="number"
                  value={formData.word_count}
                  onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Business"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the domain..."
                rows={3}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span>Featured Domain</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingDomain ? 'Update Domain' : 'Add Domain'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="domains-table-container">
          <h2>All Domains ({domains.length})</h2>

          {loading ? (
            <div className="loading">Loading domains...</div>
          ) : (
            <table className="domains-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Words</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="domain-name-cell">{domain.name}</td>
                    <td>${domain.price.toLocaleString()}</td>
                    <td>{domain.word_count || '-'}</td>
                    <td>{domain.category || '-'}</td>
                    <td>
                      {domain.is_featured && <span className="featured-badge">Featured</span>}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(domain)}
                        className="btn-small btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id, domain.name)}
                        className="btn-small btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onLogin(email, password);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          id: authData.user.id,
          email,
        }]);

      if (adminError) throw adminError;

      setMessage('Account created successfully! You can now log in.');
      setTimeout(() => {
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) throw error;

      setMessage('Password reset link sent to your email. Check your inbox.');
      setTimeout(() => {
        setMode('login');
        setEmail('');
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <div className="login-page">
      <button className="close-btn" onClick={handleClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="login-container">
        {mode === 'login' && (
          <>
            <h1>Admin Login</h1>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>

            <div className="form-links">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setMessage('');
                }}
              >
                Create Account
              </button>
              <span className="link-separator">•</span>
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setMessage('');
                }}
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}

        {mode === 'register' && (
          <>
            <h1>Create Admin Account</h1>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="form-links">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1>Reset Password</h1>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={handleForgotPassword} className="login-form">
              <p className="form-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="form-links">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                  setEmail('');
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
