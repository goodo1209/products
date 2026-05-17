class LottoNumbers extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set numbers(numbers) {
        const style = `
            .lotto-numbers {
                display: flex;
                gap: 1rem;
            }
            .number {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 1.5rem;
                font-weight: bold;
                color: #fff;
            }
        `;

        const numberElements = numbers.map(number => {
            const ball = document.createElement('div');
            ball.classList.add('number');
            ball.textContent = number;
            ball.style.backgroundColor = this.getColor(number);
            return ball;
        });

        this.shadowRoot.innerHTML = `<style>${style}</style>`;
        const container = document.createElement('div');
        container.classList.add('lotto-numbers');
        numberElements.forEach(el => container.appendChild(el));
        this.shadowRoot.appendChild(container);
    }

    getColor(number) {
        if (number <= 10) return '#fbc400';
        if (number <= 20) return '#69c8f2';
        if (number <= 30) return '#ff7272';
        if (number <= 40) return '#aaa';
        return '#b0d840';
    }
}

customElements.define('lotto-numbers', LottoNumbers);

const generateBtn = document.getElementById('generate-btn');
const historyList = document.getElementById('history-list');
const lottoNumbersElement = document.querySelector('lotto-numbers');
const themeToggle = document.getElementById('theme-toggle');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});

initTheme();

let history = [];

function generateNumbers() {
    const numbers = new Set();
    while(numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sortedNumbers = [...numbers].sort((a,b) => a-b);
    
    lottoNumbersElement.numbers = sortedNumbers;

    addToHistory(sortedNumbers);
}

function addToHistory(numbers) {
    const li = document.createElement('li');
    li.textContent = numbers.join(', ');
    historyList.prepend(li);
    if (historyList.children.length > 10) {
        historyList.lastChild.remove();
    }
}

generateBtn.addEventListener('click', generateNumbers);

generateNumbers();
