const DADATA_API_KEY = process.env.NEXT_PUBLIC_DADATA_API_KEY;
const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

export interface AddressSuggestion {
  value: string;           
  unrestricted_value: string; 
  data: {
    city?: string;
    street?: string;
    house?: string;
    flat?: string;
    postal_code?: string;
    region?: string;
  };
}

export async function fetchAddressSuggestions(
  query: string
): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const response = await fetch(DADATA_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${DADATA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query.trim(),
        count: 5, 
        from_bound: { value: "city" },
        to_bound: { value: "flat" },
      }),
    });

    if (!response.ok) {
      throw new Error(`DaData error: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Address fetch error:", error);
    return [];
  }
}