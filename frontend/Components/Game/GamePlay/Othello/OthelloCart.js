import { router } from "/root/Router.js";

const othelloCartTemplate = document.createElement('template');

othelloCartTemplate.innerHTML = /*html*/ `
    <link rel="stylesheet" href="/Components/Game/GamePlay/Othello/styles/OthelloCart.css">
    <link rel="stylesheet" href="/Utils/utils.css">
    <div class="cart">
        <div class="cart-content">
            <div class="cart-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="35" fill="url(#othello-gradient)" stroke="var(--secondary-cyan)" stroke-width="2"/>
                    <circle cx="40" cy="40" r="30" fill="var(--dark-blue)" opacity="0.5"/>
                    <defs>
                        <linearGradient id="othello-gradient" x1="0" y1="0" x2="80" y2="80">
                            <stop offset="0%" stop-color="var(--text-white)"/>
                            <stop offset="100%" stop-color="var(--secondary-cyan)"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h2>OTHELLO</h2>
            <p class="cart-description">Strategic board game</p>
            <div class="cart-features">
                <span>🤖 AI Opponents</span>
                <span>⏱️ Time Controls</span>
                <span>🏆 Tournaments</span>
            </div>
        </div>
        <c-button class="start-btn">
            <span slot="text">START</span>
        </c-button>
    </div>
`;

export class OthelloCart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(othelloCartTemplate.content.cloneNode(true));
        
        const button = this.shadowRoot.querySelector('c-button');
        button.addEventListener('click', () => {
            // Navigate to Othello lobby for matchmaking
            router.navigate('/game/othello/lobby');
        });
        
        this.classList.add('cart-animation', 'opacity-0');
        setTimeout(() => {
            this.classList.remove('opacity-0');
            this.classList.add('opacity-1');
        }, 100);
    }
}

customElements.define('othello-cart', OthelloCart);
