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

/**
 * Enhanced Processing: Converts text into spans for hover preview
 */
function processText() {
    const selection = window.getSelection();
    let range = null;
    let offset = 0;

    // Try to save cursor position before re-rendering
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        offset = range.startOffset;
    }

    let rawText = editor.innerText;
    if (censoredWords.length === 0) {
        updateStats(rawText, 0);
        return;
    }

    const pattern = new RegExp(`\\b(${censoredWords.join('|')})\\b`, 'gi');
    let matches = 0;
    const charToUse = (currentStyle === 'custom') ? customChar : currentStyle;

    // Replace matches with spans for visual and hover effect
    const newHTML = rawText.replace(pattern, (match) => {
        matches++;
        const replacement = charToUse.repeat(match.length);
        return `<span class="censor-span" data-original="${match}">${replacement}</span>`;
    });

    if (editor.innerHTML !== newHTML) {
        editor.innerHTML = newHTML;
        
        // Basic cursor restore (moving to end to prevent jump issues in contenteditable)
        const newRange = document.createRange();
        newRange.selectNodeContents(editor);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    
    updateStats(rawText, matches);
}

function updateStats(text, matches) {
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('wordCount').innerText = wordCount;
    document.getElementById('charCount').innerText = text.length;
    document.getElementById('censorCount').innerText = matches;
}

editor.addEventListener('input', processText);

function clearText() { editor.innerText = ''; processText(); }

async function copyText() {
    // Copy the innerText to get the actual censored string (e.g. █ characters)
    await navigator.clipboard.writeText(editor.innerText);
    const n = document.getElementById('notification');
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
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
