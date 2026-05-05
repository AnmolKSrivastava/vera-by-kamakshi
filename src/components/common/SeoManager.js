import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'VERA by Kamakshi';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://vera-by-kamakshi.web.app';
const DEFAULT_DESCRIPTION = 'Discover handcrafted luxury handbags, clutches, totes, and wallets from VERA by Kamakshi.';
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;

const ROUTE_META = {
  '/': {
    title: 'Luxury Handbags and Accessories',
    description: 'Discover handcrafted luxury handbags, clutches, totes, and wallets designed with timeless elegance.',
    keywords: 'luxury bags, handbags, clutches, wallets, handcrafted accessories, VERA by Kamakshi'
  },
  '/collections': {
    title: 'Shop Collections',
    description: 'Browse the full collection of premium handbags, crossbody bags, clutches, totes, and accessories.',
    keywords: 'shop handbags, luxury bag collection, crossbody bags, totes, clutches'
  },
  '/search': {
    title: 'Search Products',
    description: 'Search the VERA by Kamakshi catalog to find handbags and accessories by name, category, or style.',
    keywords: 'search handbags, find products, luxury bags catalog'
  },
  '/cart': {
    title: 'Shopping Cart',
    description: 'Review the handbags and accessories in your cart before checkout.',
    keywords: 'shopping cart, checkout bag, cart review'
  },
  '/wishlist': {
    title: 'Wishlist',
    description: 'Save your favorite handbags and accessories for later.',
    keywords: 'wishlist, saved bags, favorite handbags'
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about the story, craftsmanship, and design philosophy behind VERA by Kamakshi.',
    keywords: 'about VERA by Kamakshi, luxury craftsmanship, handbag brand story'
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with VERA by Kamakshi for product support, order help, and brand inquiries.',
    keywords: 'contact VERA by Kamakshi, customer support, luxury bag contact'
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    description: 'Read our shipping timelines, delivery coverage, charges, and order tracking information.',
    keywords: 'shipping policy, delivery policy, order tracking'
  },
  '/return-policy': {
    title: 'Return and Refund Policy',
    description: 'Review our return, exchange, and refund terms for VERA by Kamakshi orders.',
    keywords: 'return policy, refund policy, exchange policy'
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Understand how VERA by Kamakshi collects, uses, and protects your personal information.',
    keywords: 'privacy policy, data protection, customer privacy'
  },
  '/terms': {
    title: 'Terms and Conditions',
    description: 'Read the terms, policies, and usage conditions for shopping with VERA by Kamakshi.',
    keywords: 'terms and conditions, shopping terms, website policy'
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about orders, shipping, returns, products, and payments.',
    keywords: 'FAQ, shipping questions, returns questions, payment help'
  },
  '/checkout': {
    title: 'Secure Checkout',
    description: 'Complete your purchase securely with delivery details and payment options.',
    keywords: 'secure checkout, pay online, order payment'
  },
  '/profile': {
    title: 'My Profile',
    description: 'Manage your profile details, saved addresses, and account information.',
    keywords: 'user profile, saved addresses, account settings'
  },
  '/orders': {
    title: 'My Orders',
    description: 'Track your orders, view purchase history, and check delivery status.',
    keywords: 'my orders, order history, order tracking'
  },
  '/admin': {
    title: 'Admin Dashboard',
    description: 'Manage products, orders, inventory, coupons, users, and analytics.',
    keywords: 'admin dashboard, order management, inventory management'
  }
};

const updateMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== 'content') {
        tag.setAttribute(key, value);
      }
    });
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', attributes.content);
};

const updateLinkTag = (selector, rel, href) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', href);
};

const getRouteMeta = (pathname, search) => {
  if (pathname.startsWith('/product/')) {
    return {
      title: 'Product Details',
      description: 'Explore product details, images, reviews, and delivery information.',
      keywords: 'product details, luxury handbags, bag reviews'
    };
  }

  if (pathname.startsWith('/orders/')) {
    return {
      title: 'Order Details',
      description: 'View the latest updates, items, and timeline for your order.',
      keywords: 'order details, order status, tracking'
    };
  }

  if (pathname.startsWith('/order-confirmation/')) {
    return {
      title: 'Order Confirmation',
      description: 'Your order has been placed successfully. Review the order summary and next steps.',
      keywords: 'order confirmation, purchase success, order summary'
    };
  }

  if (pathname === '/search') {
    const query = new URLSearchParams(search).get('q');
    return {
      ...ROUTE_META['/search'],
      title: query ? `Search Results for "${query}"` : ROUTE_META['/search'].title,
      description: query
        ? `Browse search results for "${query}" in the VERA by Kamakshi collection.`
        : ROUTE_META['/search'].description
    };
  }

  return ROUTE_META[pathname] || {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    keywords: 'VERA by Kamakshi, luxury handbags, accessories'
  };
};

function SeoManager() {
  const location = useLocation();

  const meta = useMemo(
    () => getRouteMeta(location.pathname, location.search),
    [location.pathname, location.search]
  );

  useEffect(() => {
    const pageTitle = meta.title === SITE_NAME ? SITE_NAME : `${meta.title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${location.pathname}${location.search}`;

    document.title = pageTitle;

    updateMetaTag('meta[name="description"]', { name: 'description', content: meta.description || DEFAULT_DESCRIPTION });
    updateMetaTag('meta[name="keywords"]', { name: 'keywords', content: meta.keywords || '' });
    updateMetaTag('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large' });

    updateMetaTag('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    updateMetaTag('meta[property="og:description"]', { property: 'og:description', content: meta.description || DEFAULT_DESCRIPTION });
    updateMetaTag('meta[property="og:type"]', { property: 'og:type', content: location.pathname.startsWith('/product/') ? 'product' : 'website' });
    updateMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    updateMetaTag('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE });
    updateMetaTag('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });

    updateMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    updateMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    updateMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description || DEFAULT_DESCRIPTION });
    updateMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE });

    updateLinkTag('link[rel="canonical"]', 'canonical', canonicalUrl);
  }, [location.pathname, location.search, meta]);

  return null;
}

export default SeoManager;