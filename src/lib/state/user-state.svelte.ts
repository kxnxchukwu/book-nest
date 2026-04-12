import type { Database } from '$lib/types/database.types';
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
export class UserState {
	session = $state<Session | null>(null);
	supabase = $state<SupabaseClient<Database> | null>(null);
	user = $state<User | null>(null);
	userName = $state<string | null>(null);
	allBooks = $state<Book[]>([]);

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

		const [booksResponse, userNameResponse] = await Promise.all([
			await this.supabase.from('books').select('*').eq('user_id', userId),
			await this.supabase.from('user_names').select('name').eq('user_id', userId).single()
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

		this.allBooks = booksResponse.data;
		this.userName = userNameResponse.data.name;
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

	async logout() {
		await this.supabase?.auth.signOut();
	}
}

const USER_STATE_KEY = Symbol('USER_STATE');

export function setUserState(data: UserStateData) {
	return setContext(USER_STATE_KEY, new UserState(data));
}

export function getUserState() {
	return getContext<ReturnType<typeof setUserState>>(USER_STATE_KEY);
}
