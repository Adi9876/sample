const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const GEMINI_TEXT_MODEL = 'gemini-1.5-flash'
const GEMINI_IMAGE_MODEL = 'gemini-1.5-flash'

// Generate text response using Gemini
export async function generateTextResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No text generated')
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Error generating text response:', error)
    throw new Error('Failed to generate text response')
  }
}

// Generate image using Gemini (Image generation)
export async function generateImageResponse(prompt: string): Promise<string> {
  try {
    // For image generation, we'll use a different approach
    // Since Gemini doesn't directly generate images, we'll use a text-to-image prompt
    const imagePrompt = `Create a detailed description for an AI image generator based on this prompt: "${prompt}". Make it vivid and specific for image generation.`
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: imagePrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No image description generated')
    }

    // Since we can't actually generate images with the free Gemini API,
    // we'll return a placeholder image URL with the generated description
    // const description = data.candidates[0].content.parts[0].text
    
    // Use Unsplash as a placeholder for generated images
    const imageUrl = `https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=512&h=512&fit=crop&crop=center`
    
    return imageUrl
  } catch (error) {
    console.error('Error generating image response:', error)
    throw new Error('Failed to generate image response')
  }
}