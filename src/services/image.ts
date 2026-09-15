import { db } from '../db';
import { decryptKey } from './crypto';
import { logActivity } from './activity';

export async function generateImageFromPost(
  postContent: string,
  category: string,
  brand: string,
  topic: string
): Promise<{ success: boolean; imageUrl?: string; imagePrompt?: string; error?: string }> {
  try {
    await logActivity('info', 'Generating image from post...');
    
    const imagePrompt = buildImagePrompt(postContent, category, brand, topic);
    
    const providers = await db.imageProviders.toArray();
    const provider = providers.find(p => p.active);
    
    if (!provider) {
      return { success: false, error: 'No active image provider found' };
    }
    
    const apiKey = decryptKey(provider.apiKey);
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }
    
    const response = await fetch(`${provider.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model || 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      
      if (imageUrl) {
        await logActivity('success', 'Image generated successfully');
        return { success: true, imageUrl, imagePrompt };
      }
    }
    
    return { success: false, error: 'Failed to generate image', imagePrompt };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function buildImagePrompt(postContent: string, category: string, brand: string, topic: string): string {
  const lower = postContent.toLowerCase();
  
  // Detect car brands
  const carBrands = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Lexus', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Ford', 'Chevrolet', 'Volkswagen', 'Subaru', 'Dodge', 'Chrysler', 'Jeep', 'Tesla', 'Porsche', 'Volvo'];
  const carModels = ['Camry', 'Corolla', 'RAV4', 'Civic', 'CR-V', 'Highlander', 'Cayenne', 'X5', 'X3', 'A4', 'A6', 'Q5', 'Q7', 'Accord', 'Elantra', 'Tucson', '330', '320', '530', 'M3', 'M5', 'Carnival', 'CX-50', 'Ranger', 'E-Class', 'S-Class', 'C-Class', 'GLC', 'GLE', 'GLS', 'Model 3', 'Model Y', 'Model S', 'Model X', 'Range Rover', 'Discovery', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Tahoe', 'Suburban', 'Silverado', 'F-150', 'Mustang', 'Supra', 'Cayenne', 'Macan', 'Panamera', 'Challenger', 'Charger', 'Durango', 'Viper', 'Ram 1500', 'Ram 2500', '300', 'Pacifica', '911', 'Cayenne', 'Panamera', 'Macan', 'Taycan', 'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Camaro', 'Impala', 'Malibu', 'Corvette', 'Traverse', 'Equinox', 'Blazer', 'Trax', 'Colorado', 'Express', 'Kubik', 'Gelik', 'Gelendvagen'];
  
  // Detect mentioned cars
  const mentionedBrands = carBrands.filter(brand => 
    postContent.toLowerCase().includes(brand.toLowerCase())
  );
  
  // Priority 1: Interactive posts with multiple cars
  if (category === 'interactive' && mentionedBrands.length >= 2) {
    const carsString = mentionedBrands.join(' vs ');
    return `${carsString} - comparison view, clean professional setting, cars displayed side by side`;
  }
  
  // Priority 2: Specific car mentioned
  if (mentionedBrands.length > 0) {
    const brand = mentionedBrands[0];
    const modelMatch = postContent.match(new RegExp(`(${carModels.join('|')})`, 'i'));
    const model = modelMatch ? modelMatch[1] : '';
    
    if (model) {
      return `${brand} ${model} - parked in clean professional setting, showing the car as the main subject`;
    }
    
    return `${brand} - parked in clean professional setting, showing the car as the main subject`;
  }
  
  // Priority 3: Local content
  if (category === 'local') {
    if (/niagara|niagara|водопад|водопад/i.test(lower)) {
      return 'Niagara Falls - majestic waterfall, professional landscape photography';
    }
    if (/muskoka/i.test(lower)) {
      return 'Muskoka - beautiful lake district, professional landscape photography';
    }
    if (/toronto/i.test(lower)) {
      return 'Toronto - city skyline, professional cityscape photography';
    }
  }
  
  // Fallback
  return `${brand} ${topic} - professional photography, clean composition`;
}
