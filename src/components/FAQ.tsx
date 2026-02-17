import { useState } from 'react';
import '../styles/FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does the domain purchase process work?',
    answer: 'Once you find a domain you like, click the "Inquire Now" button to send us an email. We\'ll respond within 24 hours with payment options and transfer instructions. After payment is confirmed, we initiate the secure domain transfer process, which typically takes 5-7 days.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank wire transfers, PayPal, and cryptocurrency payments (Bitcoin, Ethereum). For high-value domains over $100,000, we also offer escrow services through Escrow.com for added security.'
  },
  {
    question: 'Are your domain prices negotiable?',
    answer: 'Some domains may have room for negotiation, especially for bulk purchases. Contact us with your offer, and we\'ll do our best to work with your budget while ensuring fair market value.'
  },
  {
    question: 'How long does the domain transfer take?',
    answer: 'The transfer process typically takes 5-7 business days. This includes verification, authorization, and the actual transfer between registrars. We handle all technical aspects to ensure a smooth transition.'
  },
  {
    question: 'Do you offer financing options?',
    answer: 'Yes, we offer payment plans for domains priced over $10,000. Plans can be structured over 12, 24, or 36 months with flexible terms. Contact us to discuss financing options that work for your budget.'
  },
  {
    question: 'What if the domain I want is not listed?',
    answer: 'We have access to thousands of additional premium domains not currently listed. Contact us with your requirements, and we\'ll search our network to find the perfect domain for your needs.'
  },
  {
    question: 'Are there any additional fees?',
    answer: 'The listed price is the total purchase price. However, you\'ll need to pay annual registration fees to your registrar (typically $10-15/year). If using escrow services, those fees are split between buyer and seller.'
  },
  {
    question: 'Can I get help choosing the right domain?',
    answer: 'Absolutely! Our team has years of experience in domain selection and branding. We\'re happy to provide consultation to help you find a domain that perfectly matches your business goals and brand identity.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section faq-section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Everything you need to know about buying premium domains
        </p>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <svg
                  className="faq-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
