import { json, type RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const prompt = `Identify every book visible in this image.
Return a JSON array of objects with exactly these keys:
- "bookTitle": the full title of the book
- "author": the author's full name
- "genre": the primary genre (e.g. "Fiction", "Science Fiction", "Biography", "Fantasy", "Self-Help", "History", "Mystery", "Romance", "Non-Fiction")
- "description": a 1-2 sentence description of what the book is about

Example:
[{
  "bookTitle": "The Alchemist",
  "author": "Paulo Coelho",
  "genre": "Fiction",
  "description": "A young shepherd named Santiago travels from Spain to Egypt in search of treasure. A philosophical novel about following your dreams and listening to your heart."
}]

Return only the JSON array, no other text.`;

interface GeminiBook {
	bookTitle: string;
	author: string;
	genre?: string;
	description?: string;
}

interface EnrichedBook extends GeminiBook {
	isbn?: string;
	cover_image?: string;
}

interface GeminiError {
	status?: number;
	message?: string;
}

function isGeminiError(error: unknown): error is GeminiError {
	return typeof error === 'object' && error !== null && 'status' in error;
}

// Look up a book on Open Library and return its ISBN + cover URL
async function enrichWithOpenLibrary(book: GeminiBook): Promise<EnrichedBook> {
	try {
		const query = encodeURIComponent(`${book.bookTitle} ${book.author}`);
		const res = await fetch(
			`https://openlibrary.org/search.json?q=${query}&limit=1&fields=isbn,cover_i,title,author_name`
		);

		if (!res.ok) return book;

		const data = await res.json();
		const doc = data.docs?.[0];
		if (!doc) return book;

		// Prefer ISBN-13, fall back to ISBN-10
		const isbn13 = doc.isbn?.find((i: string) => i.length === 13);
		const isbn10 = doc.isbn?.find((i: string) => i.length === 10);
		const isbn = isbn13 || isbn10;

		// Use cover_i (cover ID) if available — more reliable than ISBN covers
		const cover_image = doc.cover_i
			? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
			: isbn
				? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
				: undefined;

		return {
			...book,
			...(isbn ? { isbn } : {}),
			...(cover_image ? { cover_image } : {})
		};
	} catch {
		// Never fail the whole request if enrichment fails for one book
		return book;
	}
}

async function tryGenerate(base64: string, retries = 2): Promise<string> {
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash', // Use the latest stable version
		generationConfig: { responseMimeType: 'application/json' }
	});

	const imagePart = { inlineData: { data: base64, mimeType: 'image/jpeg' } };

	try {
		const result = await model.generateContent([prompt, imagePart]);
		return result.response.text();
	} catch (error) {
		if (retries > 0 && isGeminiError(error) && (error.status === 503 || error.status === 429)) {
			await new Promise((r) => setTimeout(r, 1500));
			return tryGenerate(base64, retries - 1);
		}
		throw error;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { base64 } = await request.json();

	try {
		const text = await tryGenerate(base64);
		const parsed = JSON.parse(text);
		const geminiBooks: GeminiBook[] = Array.isArray(parsed) ? parsed : parsed.bookArray || [parsed];

		// Enrich all books in parallel
		const bookArray = await Promise.all(geminiBooks.map((book) => enrichWithOpenLibrary(book)));

		return json({ bookArray });
	} catch (error) {
		console.error('Scan error:', error);
		const is503 = isGeminiError(error) && error.status === 503;
		return json(
			{
				error: is503
					? 'Gemini is currently overloaded. Please try again in a moment.'
					: 'Failed to process image. Please try again.'
			},
			{ status: is503 ? 503 : 500 }
		);
	}
};
