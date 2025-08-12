import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Sera's Kitchen - Authentic Kenyan Cuisine & Delicious Cakes",
  description = "Discover authentic Kenyan cuisine and delicious homemade cakes from Sera's Kitchen. Order fresh, traditional dishes and custom cakes online.",
  keywords = "Kenyan food, authentic cuisine, homemade cakes, traditional dishes, African food, Nairobi cuisine, cake delivery, Kenyan recipes, fresh cakes, local food",
  image = "/logo.png",
  url,
  type = "website",
  structuredData
}) => {
  const location = useLocation();
  const currentUrl = url || `https://your-domain.vercel.app${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updatePropertyTag('og:title', title);
    updatePropertyTag('og:description', description);
    updatePropertyTag('og:image', `https://your-domain.vercel.app${image}`);
    updatePropertyTag('og:url', currentUrl);
    updatePropertyTag('og:type', type);

    // Update Twitter tags
    updatePropertyTag('twitter:title', title);
    updatePropertyTag('twitter:description', description);
    updatePropertyTag('twitter:image', `https://your-domain.vercel.app${image}`);
    updatePropertyTag('twitter:url', currentUrl);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Add structured data if provided
    if (structuredData) {
      let script = document.querySelector('script[data-seo-structured]');
      if (script) {
        script.remove();
      }
      
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-structured', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove dynamic structured data on unmount
      const dynamicScript = document.querySelector('script[data-seo-structured]');
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;
