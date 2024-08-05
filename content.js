// Log when the content script starts
console.log('Content script loaded');

// Variables to track selection and translation box
let currentSelection = '';
let translationBox = null;

// Function to handle selection change
function handleSelectionChange() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && selectedText !== currentSelection) {
        currentSelection = selectedText;
        console.log('Text selected:', currentSelection);

        // Send a message to the background script
        chrome.runtime.sendMessage({ type: 'selection', text: currentSelection }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
            } else {
                console.log('Response from background:', response);
            }
        });
    } else if (!selectedText) {
        if (translationBox) {
            translationBox.remove();
            translationBox = null;
        }
        currentSelection = '';
    }
}

// Listen for mouseup events to detect selection changes
document.addEventListener('mouseup', handleSelectionChange);

// Listen for keyup events to detect selection changes
document.addEventListener('keyup', handleSelectionChange);

// Listen for messages from the background script to display translation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'showTranslation') {
        console.log('Translation received:', request.text);
        displayTranslationBox(request.text);
    }
});

// Function to display the translation in a small box
function displayTranslationBox(translatedText) {
    // Remove existing translation box if it exists
    if (translationBox) {
        translationBox.remove();
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Create a box to show the translation
    translationBox = document.createElement('div');
    translationBox.id = 'translation-box';
    translationBox.innerText = translatedText;

    // Apply CSS styles
    translationBox.style.position = 'absolute';
    translationBox.style.left = `${rect.left + window.scrollX}px`;
    translationBox.style.top = `${rect.bottom + window.scrollY + 5}px`;
    translationBox.style.backgroundColor = '#ffffff';
    translationBox.style.border = '1px solid #000000';
    translationBox.style.borderRadius = '10px';
    translationBox.style.padding = '5px';
    translationBox.style.zIndex = '10000';
    translationBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    translationBox.style.fontSize = '14px';
    translationBox.style.fontFamily = 'Arial, sans-serif';
    translationBox.style.maxWidth = '300px';
    translationBox.style.wordWrap = 'break-word';

    document.body.appendChild(translationBox);

    console.log('Translation box displayed');
}
