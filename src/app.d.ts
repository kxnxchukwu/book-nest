// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Database } from '$lib/types/database.types';
import { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			user: User | null;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
