<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	interface StatusCode {
		statusCode: number;
		name: string;
		description: string;
	}

	interface StatusCodesData {
		statusCodes: StatusCode[];
	}

	let statusCodes = $state<StatusCode[]>([]);
	let selectedStatusCode = $state<StatusCode | null>(null);
	let dialogOpen = $state(false);
	let imageErrors = $state<Set<number>>(new Set());
	let isDark = $state(false);
	let selectedGroup = $state<string | undefined>(undefined);

	function getStatusCodeGroup(statusCode: number): string {
		if (statusCode >= 100 && statusCode < 200) return '1xx';
		if (statusCode >= 200 && statusCode < 300) return '2xx';
		if (statusCode >= 300 && statusCode < 400) return '3xx';
		if (statusCode >= 400 && statusCode < 500) return '4xx';
		if (statusCode >= 500) return '5xx';
		return '';
	}

	function getFilteredStatusCodes(): StatusCode[] {
		const validGroups = ['1xx', '2xx', '3xx', '4xx', '5xx'];
		if (!selectedGroup || !validGroups.includes(selectedGroup)) return statusCodes;
		return statusCodes.filter((code) => getStatusCodeGroup(code.statusCode) === selectedGroup);
	}

	function toggleTheme() {
		isDark = !isDark;
		if (typeof document !== 'undefined') {
			const html = document.documentElement;
			if (isDark) {
				html.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				html.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			}
		}
	}

	function getImagePath(statusCode: number): string {
		return `/HttpPlatypus/assets/${statusCode}.png`;
	}

	function getMdnUrl(statusCode: number): string {
		return `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/${statusCode}`;
	}

	function getStatusCodeColor(statusCode: number): string {
		if (statusCode >= 100 && statusCode < 200) return 'bg-blue-100 dark:bg-blue-900/30';
		if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 dark:bg-green-900/30';
		if (statusCode >= 300 && statusCode < 400) return 'bg-yellow-100 dark:bg-yellow-900/30';
		if (statusCode >= 400 && statusCode < 500) return 'bg-red-100 dark:bg-red-900/30';
		if (statusCode >= 500) return 'bg-purple-100 dark:bg-purple-900/30';
		return 'bg-gray-100 dark:bg-gray-900/30';
	}

	function openDialog(statusCode: StatusCode) {
		selectedStatusCode = statusCode;
		dialogOpen = true;
	}

	function handleImageError(statusCode: number) {
		imageErrors = new Set(imageErrors);
		imageErrors.add(statusCode);
	}

	function hasImageError(statusCode: number): boolean {
		return imageErrors.has(statusCode);
	}

	onMount(async () => {
		if (typeof document !== 'undefined') {
			const savedTheme = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
			
			if (isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}

		try {
			const response = await fetch('/HttpPlatypus/data/HttpStatusCodes.json');
			const data: StatusCodesData = await response.json();
			statusCodes = data.statusCodes;
		} catch (error) {
			console.error('Failed to load status codes:', error);
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-8">
		<span></span>
		<h1 class="text-2xl md:text-4xl font-bold">HTTP Platypuses</h1>
		<button
			onclick={toggleTheme}
			class="p-2 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
			aria-label="Toggle theme"
		>
			{#if isDark}
				<SunIcon class="size-5" />
			{:else}
				<MoonIcon class="size-5" />
			{/if}
		</button>
	</div>
	
	<div class="mb-6 w-full">
		<ToggleGroup.Root size="lg" type="single" bind:value={selectedGroup} class="w-full">
			<ToggleGroup.Item value="1xx" aria-label="Filter 1xx status codes" class="flex-1 data-[state=on]:bg-blue-100 data-[state=on]:dark:bg-blue-900/30 data-[state=on]:text-blue-900 data-[state=on]:dark:text-blue-100">
				<span class="px-2">1xx</span>
			</ToggleGroup.Item>
			<ToggleGroup.Item value="2xx" aria-label="Filter 2xx status codes" class="flex-1 data-[state=on]:bg-green-100 data-[state=on]:dark:bg-green-900/30 data-[state=on]:text-green-900 data-[state=on]:dark:text-green-100">
				<span class="px-2">2xx</span>
			</ToggleGroup.Item>
			<ToggleGroup.Item value="3xx" aria-label="Filter 3xx status codes" class="flex-1 data-[state=on]:bg-yellow-100 data-[state=on]:dark:bg-yellow-900/30 data-[state=on]:text-yellow-900 data-[state=on]:dark:text-yellow-100">
				<span class="px-2">3xx</span>
			</ToggleGroup.Item>
			<ToggleGroup.Item value="4xx" aria-label="Filter 4xx status codes" class="flex-1 data-[state=on]:bg-red-100 data-[state=on]:dark:bg-red-900/30 data-[state=on]:text-red-900 data-[state=on]:dark:text-red-100">
				<span class="px-2">4xx</span>
			</ToggleGroup.Item>
			<ToggleGroup.Item value="5xx" aria-label="Filter 5xx status codes" class="flex-1 data-[state=on]:bg-purple-100 data-[state=on]:dark:bg-purple-900/30 data-[state=on]:text-purple-900 data-[state=on]:dark:text-purple-100">
				<span class="px-2">5xx</span>
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
	
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
		{#each getFilteredStatusCodes() as statusCode}
			<button
				onclick={() => openDialog(statusCode)}
				class="group relative aspect-square overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
			>
				<div class="relative w-full h-full">
					{#if !hasImageError(statusCode.statusCode)}
						<img
							src={getImagePath(statusCode.statusCode)}
							alt="{statusCode.statusCode} - {statusCode.name}"
							onerror={() => handleImageError(statusCode.statusCode)}
							class="w-full h-full object-cover"
						/>
					{/if}
					{#if hasImageError(statusCode.statusCode)}
						<div
							class="w-full h-full flex items-center justify-center {getStatusCodeColor(statusCode.statusCode)}"
						>
							<div class="text-center p-4">
								<div class="text-4xl font-bold mb-2">{statusCode.statusCode}</div>
								<div class="text-sm font-medium">{statusCode.name}</div>
							</div>
						</div>
					{/if}
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
						<div class="absolute bottom-0 left-0 right-0 p-4 text-white">
							<div class="text-2xl font-bold">{statusCode.statusCode}</div>
							<div class="text-sm">{statusCode.name}</div>
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>

{#if selectedStatusCode}
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title class="text-3xl font-bold">
					{selectedStatusCode.statusCode} - {selectedStatusCode.name}
				</Dialog.Title>
				<Dialog.Description class="text-lg mt-2">
					{selectedStatusCode.description}
				</Dialog.Description>
			</Dialog.Header>
			
			<div class="mt-6">
				<div class="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border bg-muted">
					{#if selectedStatusCode && !hasImageError(selectedStatusCode.statusCode)}
						<img
							src={getImagePath(selectedStatusCode.statusCode)}
							alt="{selectedStatusCode.statusCode} - {selectedStatusCode.name}"
							onerror={() => selectedStatusCode && handleImageError(selectedStatusCode.statusCode)}
							class="w-full h-full object-contain"
						/>
					{/if}
					{#if selectedStatusCode && hasImageError(selectedStatusCode.statusCode)}
						<div
							class="w-full h-full flex items-center justify-center {getStatusCodeColor(selectedStatusCode.statusCode)}"
						>
							<div class="text-center p-8">
								<div class="text-8xl font-bold mb-4">{selectedStatusCode.statusCode}</div>
								<div class="text-2xl font-medium">{selectedStatusCode.name}</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-6 p-4 bg-muted rounded-lg">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<div class="text-sm text-muted-foreground">Status Code</div>
						<div class="text-xl font-semibold">{selectedStatusCode.statusCode}</div>
					</div>
					<div>
						<div class="text-sm text-muted-foreground">Name</div>
						<div class="text-xl font-semibold">{selectedStatusCode.name}</div>
					</div>
					<div class="col-span-2">
						<div class="text-sm text-muted-foreground">Description</div>
						<div class="text-base">{selectedStatusCode.description}</div>
					</div>
					<div class="col-span-2 pt-2">
						<div class="text-sm text-muted-foreground mb-2">Documentation</div>
						<a
							href={getMdnUrl(selectedStatusCode.statusCode)}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-primary hover:underline"
						>
							<span>View more information about this status code on MDN</span>
							<ExternalLinkIcon class="size-4" />
						</a>
					</div>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}