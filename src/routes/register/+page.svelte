<script>
	import { AuthForm } from '$components/index.svelte.js';
	let { form } = $props();
</script>

<AuthForm isRegistration={true} {form} />
