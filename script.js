const DEFAULT_WORDS = ['badword', 'offensive', 'censorme'];
let censoredWords = JSON.parse(localStorage.getItem('censoredWords')) || [...DEFAULT_WORDS];
let currentStyle = localStorage.getItem('censorStyle') || '█';
let customChar = localStorage.getItem('customChar') || '$';

const editor = document.getElementById('textInput');
const styleSelect = document.getElementById('censorStyle');
const wordListDisplay = document.getElementById('wordListDisplay');
const customInput = document.getElementById('customCharInput');

// Initialize
styleSelect.value = currentStyle;
customInput.value = customChar;
if (currentStyle === 'custom') customInput.style.display = 'block';
if (localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');

/**
 * Haptic Ripple Logic
 */
document.addEventListener('mousedown', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.classList.add('haptic-ripple');
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
});

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
    censoredWords = [...DEFAULT_WORDS];
    save();
}

function processText() {
    const selection = window.getSelection();
    let offset = 0;
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        offset = range.startOffset;
    }

    let text = editor.innerText;
    if (!text) { updateStats(0, 0, 0); return; }

    const pattern = new RegExp(`\\b(${censoredWords.join('|')})\\b`, 'gi');
    let matchCount = 0;
    const charToUse = (currentStyle === 'custom') ? customChar : currentStyle;

    const html = text.replace(pattern, (match) => {
        matchCount++;
        return `<span class="censor-span" data-original="${match}">${charToUse.repeat(match.length)}</span>`;
    });

    if (editor.innerHTML !== html) {
        editor.innerHTML = html;
        const newRange = document.createRange();
        newRange.selectNodeContents(editor);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    updateStats(text.trim().split(/\s+/).length, text.length, matchCount);
}

function updateStats(w, c, m) {
    document.getElementById('wordCount').innerText = w;
    document.getElementById('charCount').innerText = c;
    document.getElementById('censorCount').innerText = m;
}

editor.addEventListener('input', processText);

function clearText() { editor.innerText = ''; processText(); }

function copyText() {
    navigator.clipboard.writeText(editor.innerText).then(() => {
        const n = document.getElementById('notification');
        n.classList.add('show');
        setTimeout(() => n.classList.remove('show'), 2000);
    });
}

function downloadText() {
    const blob = new Blob([editor.innerText], { type: 'text/plain' });
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
