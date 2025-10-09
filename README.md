# 🔒 Live Typing Censor Tool

A real-time text censoring tool that automatically replaces inappropriate words with asterisks as you type. Perfect for content moderation, safe typing environments, or educational purposes.

## ✨ Features

- **⚡ Real-time Censoring** - Words are instantly replaced with asterisks as you type
- **🎯 Smart Cursor Positioning** - Maintains cursor position even after word replacement
- **📊 Live Statistics** - Tracks word count, character count, and total censored words
- **👁️ Transparent Word List** - Displays all censored words at the top of the interface
- **📋 Copy to Clipboard** - One-click copying of censored text
- **🎨 Modern UI** - Clean, responsive design that works on desktop and mobile
- **🔧 Customizable** - Easily modify the word list to suit your needs
- **🚫 Case-Insensitive** - Catches censored words regardless of capitalization
- **🎯 Whole Word Matching** - Only censors complete words, not partial matches

## 🚀 Demo

Simply open `word-censor-tool.html` in any modern web browser - no installation or dependencies required!

## 💻 Usage

1. Clone or download this repository
2. Open `word-censor-tool.html` in your browser
3. Start typing in the text area
4. Watch as censored words are automatically blacked out

## 🛠️ Customization

To customize the list of censored words, edit the `censoredWords` array in the JavaScript:
```javascript
const censoredWords = [
    'badword',
    'inappropriate',
    'offensive',
    // Add your own words here
];
