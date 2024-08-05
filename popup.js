document.addEventListener('DOMContentLoaded', () => {
    const autoTranslateCheckbox = document.getElementById('autoTranslateCheckbox');
    const sourceLanguageSelect = document.getElementById('sourceLanguageSelect');
    const languageSelect = document.getElementById('languageSelect');

    // Get current settings from storage
    chrome.storage.sync.get(['autoTranslate', 'sourceLanguage', 'targetLanguage'], (data) => {
        autoTranslateCheckbox.checked = data.autoTranslate || false;
        sourceLanguageSelect.value = data.sourceLanguage || 'en'; // Default to English
        languageSelect.value = data.targetLanguage || 'ar'; // Default to Arabic
    });

    // Save changes to the automatic translation checkbox
    autoTranslateCheckbox.addEventListener('change', () => {
        const isChecked = autoTranslateCheckbox.checked;
        chrome.storage.sync.set({ autoTranslate: isChecked }, () => {
            console.log('Automatic translation mode:', isChecked);
            chrome.runtime.sendMessage({ type: 'modeChange', autoTranslate: isChecked });
        });
    });

    // Save changes to the source language selection
    sourceLanguageSelect.addEventListener('change', () => {
        const selectedSourceLanguage = sourceLanguageSelect.value;
        chrome.storage.sync.set({ sourceLanguage: selectedSourceLanguage }, () => {
            console.log('Source language set to:', selectedSourceLanguage);
            chrome.runtime.sendMessage({ type: 'sourceLanguageChange', sourceLanguage: selectedSourceLanguage });
        });
    });

    // Save changes to the target language selection
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        chrome.storage.sync.set({ targetLanguage: selectedLanguage }, () => {
            console.log('Target language set to:', selectedLanguage);
            chrome.runtime.sendMessage({ type: 'languageChange', targetLanguage: selectedLanguage });
        });
    });
});
