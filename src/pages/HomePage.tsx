import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedDomains from '../components/FeaturedDomains';
import DomainSearch from '../components/DomainSearch';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <FeaturedDomains />
      <DomainSearch />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
