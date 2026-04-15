import { goto } from '$app/navigation';
import type { Database } from '$lib/types/database.types';
import { addToast } from '$lib/utils/toasts.svelte';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { getContext, setContext } from 'svelte';

interface UserStateData {
	session: Session | null;
	supabase: SupabaseClient | null;
	user: User | null;
}

export interface Book {
	author: string | null;
	cover_image: string | null;
	created_at: string;
	description: string | null;
	finished_reading_on: string | null;
	genre: string | null;
	id: number;
	rating: number | null;
	started_reading_on: string | null;
	title: string;
	user_id: string;
}

export interface ReadingLog {
	id: number;
	user_id: string;
	date: string; // 'YYYY-MM-DD'
	minutes_read: number;
	created_at: string;
}

export interface ScannedBook {
	bookTitle: string;
	author: string;
	genre?: string;
	description?: string;
	isbn?: string;
	cover_image?: string;
}

type UpdatableBookFields = Omit<Book, 'id' | 'user_id' | 'created_at'>;
export class UserState {
	session = $state<Session | null>(null);
	supabase = $state<SupabaseClient<Database> | null>(null);
	user = $state<User | null>(null);
	userName = $state<string | null>(null);
	allBooks = $state<Book[]>([]);
	readingLogs = $state<ReadingLog[]>([]);

	constructor(data: UserStateData) {
		this.updateState(data);
	}

	updateState(data: UserStateData) {
		this.session = data.session;
		this.supabase = data.supabase;
		this.user = data.user;
		this.fetchUserData();
	}

	async fetchUserData() {
		if (!this.user || !this.supabase) {
			return;
		}

		const userId = this.user.id;

		const [booksResponse, userNameResponse, logsResponse] = await Promise.all([
			await this.supabase.from('books').select('*').eq('user_id', userId),
			await this.supabase.from('user_names').select('name').eq('user_id', userId).single(),
			await this.supabase
				.from('reading_logs')
				.select('*')
				.eq('user_id', userId)
				.order('date', { ascending: false })
		]);

		if (
			booksResponse.error ||
			!booksResponse.data ||
			userNameResponse.error ||
			!userNameResponse.data
		) {
			console.error('Error fetching user data:');
			return;
		}

		if (!logsResponse.error && logsResponse.data) {
			this.readingLogs = logsResponse.data;
		}

		this.allBooks = booksResponse.data;
		this.userName = userNameResponse.data.name;
	}

	async logReadingSession(date: string, minutes: number) {
		if (!this.supabase || !this.user) {
			return;
		}

		const { data, error } = await this.supabase
			.from('reading_logs')
			.upsert(
				{ user_id: this.user.id, date, minutes_read: minutes },
				{ onConflict: 'user_id,date' }
			)
			.select()
			.single();

		if (!error && data) {
			const idx = this.readingLogs.findIndex((l) => l.date === date);
			if (idx !== -1) {
				this.readingLogs[idx] = data;
			} else {
				this.readingLogs = [data, ...this.readingLogs];
			}
			addToast(
				`${minutes} min logged for ${new Date(date + 'T00:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}`
			);
		} else if (error) {
			addToast('Failed to log reading session', 'error');
		}
	}

	getLogForDate(date: string): ReadingLog | undefined {
		return this.readingLogs.find((l) => l.date === date);
	}

	getCurrentStreak(): number {
		if (!this.readingLogs.length) return 0;
		const dates = new Set(this.readingLogs.map((l) => l.date));
		let streak = 0;
		const today = new Date();
		for (let i = 0; i < 365; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const key = d.toISOString().split('T')[0];
			if (dates.has(key)) {
				streak++;
			} else if (i > 0) {
				break;
			}
		}
		return streak;
	}

	getLongestStreak(): number {
		if (!this.readingLogs.length) return 0;
		const dates = [...new Set(this.readingLogs.map((l) => l.date))].sort();
		let longest = 1;
		let current = 1;
		for (let i = 1; i < dates.length; i++) {
			const prev = new Date(dates[i - 1]);
			const curr = new Date(dates[i]);
			const diff = (curr.getTime() - prev.getTime()) / 86400000;
			if (diff === 1) {
				current++;
				longest = Math.max(longest, current);
			} else {
				current = 1;
			}
		}
		return longest;
	}

	getHighestRatedBooks() {
		return this.allBooks
			.filter((book) => book.rating)
			.toSorted((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
			.slice(0, 9);
	}

	getUnreadBooks() {
		return this.allBooks
			.filter((book) => !book.started_reading_on)
			.toSorted((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
			.slice(0, 9);
	}

	getStartedBooks() {
		return this.allBooks
			.filter((book) => book.started_reading_on && !book.finished_reading_on)
			.toSorted((a, b) => Date.parse(b.started_reading_on!) - Date.parse(a.started_reading_on!));
	}

	getAllBooksSorted() {
		return this.allBooks.toSorted((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
	}

	getFavoriteGenre() {
		if (this.allBooks.filter((book) => book.genre).length === 0) {
			return '';
		}
		const genreCounts: { [key: string]: number } = {};

		this.allBooks.forEach((book) => {
			const genres = book.genre ? book.genre.split(',') : [];
			genres.forEach((genre) => {
				const trimmedGenre = genre.trim();
				if (trimmedGenre) {
					if (!genreCounts[trimmedGenre]) {
						genreCounts[trimmedGenre] = 1;
					} else {
						genreCounts[trimmedGenre]++;
					}
				}
			});
		});

		const mostCommonGenre = Object.keys(genreCounts).reduce((a, b) =>
			genreCounts[a] > genreCounts[b] ? a : b
		);

		return mostCommonGenre || '';
	}

	getBooksFromFavoriteGenre() {
		const mostCommonGenre = this.getFavoriteGenre();

		return this.allBooks
			.filter((book) => book.genre?.includes(mostCommonGenre))
			.toSorted((a, z) => {
				const ratingA = a.rating || 0;
				const ratingZ = z.rating || 0;
				return ratingZ - ratingA;
			});
	}

	getBookById(bookId: number) {
		return this.allBooks.find((book) => book.id === bookId);
	}

	async updateBook(bookId: number, updateObject: Partial<UpdatableBookFields>) {
		if (!this.supabase) {
			return;
		}

		const { status, error } = await this.supabase
			.from('books')
			.update(updateObject)
			.eq('id', bookId);

		if (status === 204 && !error) {
			this.allBooks = this.allBooks.map((book) => {
				if (book.id === bookId) {
					return { ...book, ...updateObject };
				} else {
					return book;
				}
			});
			// Only toast for meaningful edits, not silent status/rating updates
			const silentKeys = ['started_reading_on', 'finished_reading_on', 'rating', 'cover_image'];
			const isSilent = Object.keys(updateObject).every((k) => silentKeys.includes(k));
			if (!isSilent) addToast('Changes saved');
		} else if (error) {
			addToast('Failed to save changes', 'error');
		}
	}

	async uploadBookCover(file: File, bookId: number) {
		if (!this.user || !this.supabase) {
			return;
		}

		// Use Date.now() instead of new Date().getTime()
		const filePath = `${this.user.id}/${Date.now()}_${file.name}`;

		const { error: uploadError } = await this.supabase.storage
			.from('book-covers')
			.upload(filePath, file);

		if (uploadError) {
			return console.log(uploadError);
		}

		const {
			data: { publicUrl }
		} = this.supabase.storage.from('book-covers').getPublicUrl(filePath);

		await this.updateBook(bookId, { cover_image: publicUrl });
	}

	async deleteBookFromLibrary(bookId: number) {
		if (!this.supabase) {
			return;
		}

		const { error, status } = await this.supabase.from('books').delete().eq('id', bookId);
		if (!error && status === 204) {
			this.allBooks = this.allBooks.filter((book) => book.id !== bookId);
			addToast('Book removed from library');
			goto('/private/dashboard');
		} else {
			addToast('Failed to delete book', 'error');
		}
	}

	async addBooksToLibrary(booksToAdd: ScannedBook[]) {
		if (!this.supabase || !this.user) {
			return;
		}

		const userId = this.user.id;

		const processedBooks = booksToAdd.map((book) => ({
			title: book.bookTitle,
			author: book.author,
			user_id: userId,
			...(book.genre ? { genre: book.genre } : {}),
			...(book.description ? { description: book.description } : {}),
			...(book.cover_image ? { cover_image: book.cover_image } : {})
		}));

		const { error } = await this.supabase.from('books').insert(processedBooks);
		if (error) {
			addToast('Failed to add books', 'error');
			throw new Error(error.message);
		} else {
			await this.fetchUserData();
			const count = processedBooks.length;
			addToast(
				count === 1
					? `"${processedBooks[0].title}" added to library`
					: `${count} books added to library`
			);
		}
	}

	async updateAccountData(email: string, userName: string) {
		if (!this.session) {
			return;
		}

		try {
			const response = await fetch('/api/update-account', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.session.access_token}`
				},
				body: JSON.stringify({
					email,
					userName
				})
			});

			if (response.ok) {
				this.userName = userName;
			}
		} catch (error) {
			console.log(`Failed to delete account:`, error);
		}
	}

	async logout() {
		await this.supabase?.auth.signOut();
		goto('/');
	}

	async deleteAccount() {
		if (!this.session) {
			return;
		}

		try {
			const response = await fetch('/api/delete-account', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.session.access_token}`
				}
			});

			if (response.ok) {
				await this.logout();
				goto('/');
			}
		} catch (error) {
			console.log('Failed to delete account:', error);
		}
	}
}

const USER_STATE_KEY = Symbol('USER_STATE');

export function setUserState(data: UserStateData) {
	return setContext(USER_STATE_KEY, new UserState(data));
}

export function getUserState() {
	return getContext<ReturnType<typeof setUserState>>(USER_STATE_KEY);
}
