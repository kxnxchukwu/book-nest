<script lang="ts">
	import { goto } from '$app/navigation';
	import { Header } from '$components';
	import favicon from '$lib/assets/favicon.svg';
	import './../app.css';
	import { invalidate } from '$app/navigation';
	import { setUserState } from '$lib/state/user-state.svelte.js';
	import { page } from '$app/stores';

	let { children, data } = $props();
	let { session, supabase } = $derived(data);

	let userState = setUserState({ session: data.session, supabase: data.supabase, user: data.user });

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			userState.updateState({ session: newSession, supabase, user: newSession?.user ?? null });
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}

			// On sign-in, navigate to dashboard if not already in private area
			if (event === 'SIGNED_IN' && newSession) {
				const currentPath = $page.url.pathname;
				if (!currentPath.startsWith('/private')) {
					goto('/private/dashboard');
				}
			}

			// On sign-out, navigate to home
			if (event === 'SIGNED_OUT') {
				goto('/');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />

{@render children()}
