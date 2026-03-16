import React, { useState } from 'react';
import './ContentPages.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Orders & Payment",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Browse our collection, select a product, choose your desired specifications, and click 'Add to Cart'. Once you're ready, go to your cart and proceed to checkout. Follow the payment process to complete your order."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Credit Cards, Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for eligible orders. All online payments are processed through secure payment gateways."
        },
        {
          question: "Is Cash on Delivery available?",
          answer: "Yes, COD is available for most locations within India. COD orders may be subject to a nominal handling fee. The option will be shown at checkout if available for your delivery address."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 2 hours of placing it by contacting our customer support. Once the order is dispatched, cancellation is not possible, but you can return it as per our Return Policy."
        },
        {
          question: "Do you offer gift wrapping?",
          answer: "All our products come in premium gift packaging at no extra cost. If you'd like a personalized gift message, please mention it in the order notes during checkout."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional charge. Orders are processed within 1-2 business days before shipping."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we ship within India only. International shipping will be available soon. Please contact us for inquiries about international orders."
        },
        {
          question: "How can I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking number via email. You can track your order by logging into your account and visiting 'My Orders' or using the tracking link in the email."
        },
        {
          question: "What if my order is delayed?",
          answer: "Delivery times are estimates. If your order is significantly delayed, please contact us with your order number. We'll coordinate with the courier service to resolve the issue promptly."
        },
        {
          question: "Do you ship to P.O. Boxes?",
          answer: "Unfortunately, we cannot ship to P.O. Boxes or APO addresses. Please provide a physical street address for delivery."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return policy from the date of delivery. Items must be unused, in original condition with all tags and packaging. Please refer to our Return Policy page for complete details."
        },
        {
          question: "How do I return a product?",
          answer: "Contact us at returns@verabykamakshi.com within 7 days with your order number and reason for return. We'll provide a return authorization and instructions for shipping the item back."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method."
        },
        {
          question: "Can I exchange a product?",
          answer: "Yes, exchanges are available for size or color changes, subject to product availability. Contact us within 7 days to arrange an exchange. If there's a price difference, you'll be charged or refunded accordingly."
        },
        {
          question: "What if I receive a damaged or defective product?",
          answer: "Contact us immediately within 48 hours with photos of the damage. We'll arrange for a replacement or full refund at no additional cost, including return shipping."
        }
      ]
    },
    {
      category: "Product Information",
      questions: [
        {
          question: "Are your products genuine leather?",
          answer: "Yes, all VERA by Kamakshi bags are crafted from 100% genuine, premium Italian and Spanish leather. Each product comes with an authenticity certificate."
        },
        {
          question: "How do I care for my leather bag?",
          answer: "Keep your bag away from water and direct sunlight. Use a soft, dry cloth for cleaning. For stains, use leather cleaner specifically designed for the leather type. Store in the provided dust bag when not in use. Detailed care instructions are included with every purchase."
        },
        {
          question: "Do your bags have a warranty?",
          answer: "Yes, all our bags come with a 1-year warranty against manufacturing defects. The warranty covers stitching issues, hardware defects, and material flaws. It does not cover normal wear and tear or damage from misuse."
        },
        {
          question: "Can I see product dimensions?",
          answer: "Yes, detailed dimensions are provided on each product page under the 'Materials & Care' tab. Measurements include length, height, width, and strap drop."
        },
        {
          question: "Are the colors accurate in photos?",
          answer: "We strive for color accuracy, but actual colors may vary slightly due to monitor settings and lighting conditions. If you're unsure about a color, please contact us for more information."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          question: "Do I need an account to place an order?",
          answer: "Yes, you need to create an account to place an order. This helps us process your order efficiently and allows you to track orders, save addresses, and manage your wishlist."
        },
        {
          question: "I forgot my password. What should I do?",
          answer: "Click on 'Forgot Password?' on the login page, enter your email, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your data. We do not share your information with third parties except as required for order processing. Please read our Privacy Policy for complete details."
        },
        {
          question: "How do I update my account information?",
          answer: "Log into your account and visit the 'Profile' or 'Settings' section to update your personal information, addresses, and preferences."
        }
      ]
    },
    {
      category: "Product Availability",
      questions: [
        {
          question: "How do I know if a product is in stock?",
          answer: "Product availability is shown on each product page. If an item is out of stock, you can add it to your wishlist and we'll notify you when it's back in stock."
        },
        {
          question: "Will out-of-stock items be restocked?",
          answer: "We regularly restock popular items. Add the item to your wishlist to receive restock notifications. For specific inquiries, contact our customer support team."
        },
        {
          question: "Can I pre-order upcoming products?",
          answer: "Pre-orders may be available for select new launches. If pre-ordering is available, it will be indicated on the product page with expected shipping dates."
        }
      ]
    },
    {
      category: "Contact & Support",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us via email at support@verabykamakshi.com, call +91 98765 43210 (Mon-Sat, 10 AM - 6 PM IST), or use the contact form on our Contact Us page. We typically respond within 24 hours."
        },
        {
          question: "What are your business hours?",
          answer: "Our customer support team is available Monday to Saturday, 10:00 AM - 6:00 PM IST. We are closed on Sundays and public holidays. Email support is monitored during business hours."
        },
        {
          question: "Do you have a physical store?",
          answer: "Currently, we operate exclusively online through our website. This allows us to offer competitive prices and serve customers across India. Visit our About Us page to learn more about VERA by Kamakshi."
        }
      ]
    }
  ];

  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-intro">
          Find answers to common questions about VERA by Kamakshi products, orders, shipping, and more. 
          Can't find what you're looking for? <a href="/contact">Contact us</a> and we'll be happy to help.
        </p>

        <div className="faq-container">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h2 className="faq-category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = `${categoryIndex}-${questionIndex}`;
                  const isActive = activeIndex === globalIndex;
                  
                  return (
                    <div 
                      key={questionIndex} 
                      className={`faq-item ${isActive ? 'active' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleFAQ(globalIndex)}
                        aria-expanded={isActive}
                      >
                        <span>{faq.question}</span>
                        <span className="faq-toggle">{isActive ? '−' : '+'}</span>
                      </button>
                      {isActive && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <section className="content-section faq-cta">
          <h3>Still Have Questions?</h3>
          <p>If you couldn't find the answer you were looking for, we're here to help!</p>
          <div className="faq-cta-buttons">
            <a href="/contact" className="btn btn-primary">Contact Support</a>
            <a href="tel:+919876543210" className="btn btn-secondary">Call Us: +91 98765 43210</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FAQ;
