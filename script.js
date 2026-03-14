const DEFAULT_WORDS = ['badword', 'offensive', 'censorme'];
let censoredWords = JSON.parse(localStorage.getItem('censoredWords')) || [...DEFAULT_WORDS];
let currentStyle = localStorage.getItem('censorStyle') || '█';
let customChar = localStorage.getItem('customChar') || '$';

const textInput = document.getElementById('textInput');
const styleSelect = document.getElementById('censorStyle');
const wordListDisplay = document.getElementById('wordListDisplay');
const customInput = document.getElementById('customCharInput');

// Init UI
styleSelect.value = currentStyle;
customInput.value = customChar;
if (currentStyle === 'custom') customInput.style.display = 'block';
if (localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');

function displayWordList() {
    wordListDisplay.innerHTML = censoredWords.map((word, i) => `
        <span class="word-tag">${word}<button class="delete-tag-btn" onclick="removeWord(${i})">✕</button></span>
    `).join('');
}

function updateCensorStyle() {
    currentStyle = styleSelect.value;
    localStorage.setItem('censorStyle', currentStyle);
    customInput.style.display = (currentStyle === 'custom') ? 'block' : 'none';
    processText();
}

customInput.addEventListener('input', () => {
    customChar = customInput.value || '█';
    localStorage.setItem('customChar', customChar);
    processText();
});

function addNewWord() {
    const input = document.getElementById('newWordInput');
    const word = input.value.trim().toLowerCase();
    if (word && !censoredWords.includes(word)) {
        censoredWords.push(word);
        save();
        input.value = '';
    }
}

function removeWord(i) {
    censoredWords.splice(i, 1);
    save();
}

function save() {
    localStorage.setItem('censoredWords', JSON.stringify(censoredWords));
    displayWordList();
    processText();
}

function resetWordList() {
    if (confirm("Reset word list?")) {
        censoredWords = [...DEFAULT_WORDS];
        save();
    }
}

function processText() {
    const cursor = textInput.selectionStart;
    const original = textInput.value;
    if (censoredWords.length === 0) { updateStats(original, 0); return; }

    const pattern = new RegExp(`\\b(${censoredWords.join('|')})\\b`, 'gi');
    let matches = 0;
    const charToUse = (currentStyle === 'custom') ? customChar : currentStyle;

    const result = original.replace(pattern, (match) => {
        matches++;
        return charToUse.repeat(match.length);
    });

    if (result !== original) {
        textInput.value = result;
        textInput.setSelectionRange(cursor, cursor);
    }
    updateStats(result, matches);
}

function updateStats(text, matches) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').innerText = words;
    document.getElementById('charCount').innerText = text.length;
    document.getElementById('censorCount').innerText = matches;
}

textInput.addEventListener('input', processText);

function clearText() { textInput.value = ''; processText(); }

async function copyText() {
    await navigator.clipboard.writeText(textInput.value);
    const n = document.getElementById('notification');
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
}

function downloadText() {
    const blob = new Blob([textInput.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'censored_text.txt';
    a.click();
}

function toggleTheme() {
    const isDark = document.body.hasAttribute('data-theme');
    const btn = document.getElementById('themeToggle');
    if (isDark) {
        document.body.removeAttribute('data-theme');
        btn.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

displayWordList();
