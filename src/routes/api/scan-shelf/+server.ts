import { json, type RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_API_KEY } from '$env/static/private';

// Initialize the Google SDK
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	const { base64 } = await request.json();

	// Use Gemini 2.5 Flash - it's optimized for speed and image tasks
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash', // Use the latest stable version
		generationConfig: { responseMimeType: 'application/json' }
	});

	const prompt = `Identify the books in this image. 
                Return a JSON array of objects. 
                Each object must have exactly two keys: "bookTitle" and "author".
                Example: [{"bookTitle": "Title", "author": "Author"}]`;

	// Gemini expects image data as a separate object
	const imagePart = {
		inlineData: {
			data: base64,
			mimeType: 'image/jpeg'
		}
	};

	try {
		const result = await model.generateContent([prompt, imagePart]);
		const response = await result.response;
		const text = response.text();
		const parsed = JSON.parse(text);

		// If Gemini returned an array directly, wrap it in 'bookArray'
		const bookArray = Array.isArray(parsed) ? parsed : parsed.bookArray || [parsed];

		return json({ bookArray });
	} catch (error) {
		console.error('Gemini Error:', error);
		return json({ error: 'Failed to process image' }, { status: 500 });
	}
};
