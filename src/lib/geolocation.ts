// Function to get country from IP using ipapi.co (free tier, no API key needed)
export async function getCountryFromIP(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch country');
    }
    const data = await response.json();
    return data.country_code || 'US'; // Default to US if not found
  } catch (error) {
    console.error('Error detecting country:', error);
    return 'US'; // Default to US on error
  }
}