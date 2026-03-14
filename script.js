const DEFAULT_WORDS = ['badword', 'inappropriate', 'offensive', 'censorme', 'banned'];
let censoredWords = JSON.parse(localStorage.getItem('censoredWords')) || [...DEFAULT_WORDS];

let totalCensorCount = 0;
const textInput = document.getElementById('textInput');
const wordCountEl = document.getElementById('wordCount');
const charCountEl = document.getElementById('charCount');
const censorCountEl = document.getElementById('censorCount');
const wordListDisplay = document.getElementById('wordListDisplay');

// Initialize Theme from Storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').textContent = '☀️ Light Mode';
}

function displayWordList() {
    wordListDisplay.innerHTML = censoredWords
        .map(word => `<span class="word-tag">${word}</span>`)
        .join('');
}

function createCensorPattern() {
    const pattern = censoredWords
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    const isDark = body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        body.removeAttribute('data-theme');
        btn.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

function addNewWord() {
    const input = document.getElementById('newWordInput');
    const word = input.value.trim().toLowerCase();
    if (word && !censoredWords.includes(word)) {
        censoredWords.push(word);
        localStorage.setItem('censoredWords', JSON.stringify(censoredWords));
        displayWordList();
        input.value = '';
        textInput.dispatchEvent(new Event('input'));
    }
}

function resetWordList() {
    if (confirm("Reset the word list to default?")) {
        censoredWords = [...DEFAULT_WORDS];
        localStorage.setItem('censoredWords', JSON.stringify(censoredWords));
        displayWordList();
        textInput.dispatchEvent(new Event('input'));
    }
}

textInput.addEventListener('input', function() {
    const cursorPosition = this.selectionStart;
    const originalText = this.value;
    const pattern = createCensorPattern();
    
    let currentMatchCount = 0;
    const censoredText = originalText.replace(pattern, (match) => {
        currentMatchCount++;
        return '█'.repeat(match.length);
    });

    if (censoredText !== originalText) {
        this.value = censoredText;
        this.setSelectionRange(cursorPosition, cursorPosition);
        totalCensorCount += currentMatchCount;
    }

    const words = censoredText.trim().split(/\s+/).filter(w => w.length > 0);
    wordCountEl.textContent = words.length;
    charCountEl.textContent = censoredText.length;
    censorCountEl.textContent = totalCensorCount;
});

function clearText() {
    textInput.value = '';
    totalCensorCount = 0;
    wordCountEl.textContent = '0';
    charCountEl.textContent = '0';
    censorCountEl.textContent = '0';
    textInput.focus();
}

function copyText() {
    if (!textInput.value) return;
    navigator.clipboard.writeText(textInput.value).then(() => {
        const note = document.getElementById('notification');
        note.classList.add('show');
        note.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            note.classList.remove('show');
            note.setAttribute('aria-hidden', 'true');
        }, 2500);
    });
}

function downloadText() {
    const text = textInput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.download = 'censored-content.txt';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
    window.URL.revokeObjectURL(anchor.href);
}

document.getElementById('newWordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewWord();
});

displayWordList();
