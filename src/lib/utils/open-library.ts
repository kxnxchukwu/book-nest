export interface OpenLibraryBook {
	key: string;
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	isbn?: string[];
	cover_i?: number;
	subject?: string[];
	first_sentence?: { value: string }[] | string;
}

interface OpenLibrarySearchResponse {
	docs: OpenLibraryBook[];
}

const GENRE_MAP: [string, string][] = [
	['science fiction', 'Science Fiction'],
	['fantasy', 'Fantasy'],
	['mystery', 'Mystery'],
	['romance', 'Romance'],
	['biography', 'Biography'],
	['history', 'History'],
	['self-help', 'Self-Help'],
	['horror', 'Horror'],
	['thriller', 'Thriller'],
	['non-fiction', 'Non-Fiction'],
	['fiction', 'Fiction']
];

export function getCoverUrl(book: OpenLibraryBook): string | undefined {
	if (book.cover_i) {
		return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
	}
	const isbn13 = book.isbn?.find((i) => i.length === 13);
	const isbn10 = book.isbn?.find((i) => i.length === 10);
	const isbn = isbn13 ?? isbn10;
	return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : undefined;
}

export function inferGenre(subjects: string[] = []): string {
	const lower = subjects.map((s) => s.toLowerCase());
	for (const [keyword, label] of GENRE_MAP) {
		if (lower.some((s) => s.includes(keyword))) return label;
	}
	return '';
}

export function getDescription(book: OpenLibraryBook): string {
	if (!book.first_sentence) return '';
	if (typeof book.first_sentence === 'string') return book.first_sentence;
	return book.first_sentence[0]?.value ?? '';
}

export function getIsbn(book: OpenLibraryBook): string | undefined {
	return book.isbn?.find((i) => i.length === 13) ?? book.isbn?.find((i) => i.length === 10);
}

export async function searchOpenLibrary(query: string): Promise<OpenLibraryBook[]> {
	const q = encodeURIComponent(query.trim());
	const res = await fetch(
		`https://openlibrary.org/search.json?q=${q}&limit=8&fields=key,title,author_name,first_publish_year,isbn,cover_i,subject,first_sentence`
	);
	if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
	const data: OpenLibrarySearchResponse = await res.json();
	return data.docs ?? [];
}
