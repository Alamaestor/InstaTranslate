let autoTranslate = false;
let sourceLanguage = 'en'; // Default source language
let targetLanguage = 'ar'; // Default target language

// Get initial settings from storage
chrome.storage.sync.get(['autoTranslate', 'sourceLanguage', 'targetLanguage'], (data) => {
    autoTranslate = data.autoTranslate || false;
    sourceLanguage = data.sourceLanguage || 'en';
    targetLanguage = data.targetLanguage || 'ar';
});

// Listen for messages from popup to change settings
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'modeChange') {
        autoTranslate = request.autoTranslate;
        sendResponse({ status: 'modeChanged' });
    } else if (request.type === 'sourceLanguageChange') {
        sourceLanguage = request.sourceLanguage;
        console.log('Source language updated to:', sourceLanguage);
        sendResponse({ status: 'sourceLanguageChanged' });
    } else if (request.type === 'languageChange') {
        targetLanguage = request.targetLanguage;
        console.log('Target language updated to:', targetLanguage);
        sendResponse({ status: 'languageChanged' });
    }
    return true; // Keeps the message channel open for async responses
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'selection') {
        const selectedText = request.text;
        console.log('Selected text:', selectedText);

        if (autoTranslate) {
            try {
                const translatedText = await translateText(selectedText, sourceLanguage, targetLanguage);
                console.log('Translated text:', translatedText);

                chrome.tabs.sendMessage(sender.tab.id, { type: 'showTranslation', text: translatedText }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message to content script:', chrome.runtime.lastError.message);
                    }
                });
                sendResponse({ status: 'success' });
            } catch (error) {
                console.error('Translation error:', error);
                sendResponse({ status: 'error', message: error.message });
            }
        } else {
            sendResponse({ status: 'autoTranslateDisabled' });
        }
    }
    return true; // Keeps the message channel open for async responses
});

// Create context menu for translating text manually
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
        id: "translate",
        title: "Translate to Target Language",
        contexts: ["selection"]
    });
});

// Handle context menu click for manual translation
chrome.contextMenus.onClicked.addListener(async function(info, tab) {
    if (!autoTranslate && info.menuItemId === "translate" && info.selectionText) {
        try {
            const translatedText = await translateText(info.selectionText, sourceLanguage, targetLanguage);
            console.log('Translated text:', translatedText);

            chrome.tabs.sendMessage(tab.id, { type: 'showTranslation', text: translatedText }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message to content script:', chrome.runtime.lastError.message);
                }
            });
        } catch (error) {
            console.error('Translation error:', error);
        }
    }
});

// Function to translate text using the MyMemory API
async function translateText(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.responseData.translatedText;
}
