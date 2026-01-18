// Optimized Image Component with Lazy Loading
export class OptimizedImage extends HTMLElement {
    constructor() {
        super();
        this.observer = null;
    }

    connectedCallback() {
        const src = this.getAttribute('src');
        const alt = this.getAttribute('alt') || '';
        const width = this.getAttribute('width') || 'auto';
        const height = this.getAttribute('height') || 'auto';
        
        this.innerHTML = `
            <img 
                data-src="${src}" 
                alt="${alt}"
                loading="lazy"
                class="lazy-image"
                style="width: ${width}; height: ${height};"
            >
        `;
        
        const img = this.querySelector('img');
        
        // Use Intersection Observer for better lazy loading control
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.add('loaded');
                        this.observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '50px' // Start loading 50px before entering viewport
            });
            
            this.observer.observe(img);
        } else {
            // Fallback for browsers without Intersection Observer
            img.src = img.dataset.src;
        }
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

customElements.define('optimized-image', OptimizedImage);
