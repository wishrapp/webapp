interface AmazonUrlComponents {
  domain: string;
  productId: string;
}

export function parseAmazonUrl(url: string): AmazonUrlComponents | null {
  try {
    const urlObj = new URL(url);
    
    // Check if it's an Amazon URL
    if (!urlObj.hostname.includes('amazon')) {
      return null;
    }

    // Extract the domain (e.g., amazon.co.uk, amazon.com)
    const domain = urlObj.hostname;

    // Try to extract product ID from different URL formats
    let productId: string | null = null;

    // Format: /dp/PRODUCTID
    const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
    if (dpMatch) {
      productId = dpMatch[1];
    }

    // Format: /gp/product/PRODUCTID
    const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (!productId && gpMatch) {
      productId = gpMatch[1];
    }

    // Format: /*/PRODUCTID (fallback)
    const generalMatch = url.match(/\/([A-Z0-9]{10})(?:\/|\?|$)/i);
    if (!productId && generalMatch) {
      productId = generalMatch[1];
    }

    if (!productId) {
      return null;
    }

    return {
      domain,
      productId
    };
  } catch (error) {
    console.error('Error parsing Amazon URL:', error);
    return null;
  }
}

export function createAffiliateUrl(url: string, associateId: string): string | null {
  const components = parseAmazonUrl(url);
  
  if (!components) {
    return null;
  }

  const { domain, productId } = components;
  return `https://${domain}/dp/${productId}?tag=${associateId}`;
}