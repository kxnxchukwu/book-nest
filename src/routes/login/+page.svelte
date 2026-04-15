<script lang="ts">
	import { AuthForm } from '$components/index.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<AuthForm isRegistration={false} {form} />
