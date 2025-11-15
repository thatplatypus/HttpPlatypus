declare module 'lozad' {
	interface LozadOptions {
		loaded?: (el: Element) => void;
		root?: Element | null;
		rootMargin?: string;
		threshold?: number;
	}
	
	function lozad(selector?: string | Element, options?: LozadOptions): {
		observe: () => void;
	};
	
	export default lozad;
}

