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

// Animal Face Test Logic
const URL = "https://teachablemachine.withgoogle.com/models/liF0sV3RN/";
let model, labelContainer, maxPredictions;

const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const facePreview = document.getElementById('face-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const resultContainer = document.getElementById('result-container');
const predictionText = document.getElementById('prediction-text');
const resultLabels = document.getElementById('label-container');

async function initModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

uploadBtn.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        facePreview.src = event.target.result;
        imagePreviewContainer.classList.remove('hidden');
        resultContainer.classList.remove('hidden');
        predictionText.textContent = "Analyzing...";
        resultLabels.innerHTML = '';
        
        // Ensure model is loaded
        if (!model) await initModel();
        
        // Small delay to allow image to render
        setTimeout(() => predict(), 100);
    };
    reader.readAsDataURL(file);
});

async function predict() {
    const prediction = await model.predict(facePreview);
    
    // Sort by probability
    prediction.sort((a, b) => b.probability - a.probability);
    
    const topResult = prediction[0];
    predictionText.textContent = `You look like a ${topResult.className}!`;
    
    resultLabels.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i];
        const percent = (classPrediction.probability * 100).toFixed(0);
        
        const barHtml = `
            <div class="bar-container">
                <div class="bar-fill" style="width: ${percent}%"></div>
                <span class="bar-label">${classPrediction.className}</span>
                <span class="bar-percent">${percent}%</span>
            </div>
        `;
        resultLabels.insertAdjacentHTML('beforeend', barHtml);
    }
}

initModel();
