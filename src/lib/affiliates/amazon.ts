interface AmazonUrlComponents {
  domain: string;
  productId: string;
}

async function resolveShortUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    });
    return response.url;
  } catch (error) {
    console.error('Error resolving shortened URL:', error);
    return null;
  }
}

export function parseAmazonUrl(url: string): AmazonUrlComponents | null {
  try {
    const urlObj = new URL(url);
    
    // Check if it's an Amazon URL
    if (!urlObj.hostname.includes('amazon') && !urlObj.hostname.includes('amzn')) {
      return null;
    }

    // Extract the domain (e.g., amazon.co.uk, amazon.com, amzn.eu)
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

export async function createAffiliateUrl(url: string, associateId: string): Promise<string | null> {
  try {
    let targetUrl = url;

    // Check if it's a shortened URL
    if (url.includes('amzn.')) {
      const resolvedUrl = await resolveShortUrl(url);
      if (!resolvedUrl) {
        console.error('Failed to resolve shortened URL:', url);
        return null;
      }
      targetUrl = resolvedUrl;
    }

    const components = parseAmazonUrl(targetUrl);
    
    if (!components) {
      return null;
    }

    // Extract the main domain from the hostname
    const mainDomain = components.domain.split('.').slice(-2).join('.');
    
    // Construct the affiliate URL using the main domain
    return `https://www.amazon.${mainDomain}/dp/${components.productId}?tag=${associateId}`;
  } catch (error) {
    console.error('Error creating affiliate URL:', error);
    return null;
  }
}