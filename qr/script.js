// Wait for QRCode library to load
function waitForQRCode() {
    if (typeof QRCode !== 'undefined') {
        initApp();
    } else {
        setTimeout(waitForQRCode, 100);
    }
}

function initApp() {
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrSection = document.getElementById('qr-section');
    const qrCanvas = document.getElementById('qr-canvas');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const clearBtn = document.getElementById('clear-btn');
    const shareInfo = document.getElementById('share-info');
    const shareLinkInput = document.getElementById('share-link-input');
    const shareTextInput = document.getElementById('share-text-input');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const copyTextBtn = document.getElementById('copy-text-btn');
    const charCounter = document.getElementById('char-counter');

    // Check for URL parameter on page load
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
        // Decode base64 parameter to get the original text
        let decodedText;
        try {
            decodedText = atob(codeParam);
        } catch (e) {
            // If base64 decoding fails, try URL decoding as fallback
            try {
                decodedText = decodeURIComponent(codeParam);
            } catch (e2) {
                // If both fail, use the original parameter
                decodedText = codeParam;
            }
        }
        
        qrInput.value = decodedText;
        // Update character counter for URL parameter
        const length = decodedText.length;
        charCounter.textContent = `${length} / 2,953 characters`;
        if (length > 2657) { // 90% of max
            charCounter.style.color = '#dc3545';
        } else if (length > 2067) { // 70% of max
            charCounter.style.color = '#ffc107';
        } else {
            charCounter.style.color = '#6c757d';
        }
        generateQRCode(decodedText);
    }

    // Generate QR code button
    generateBtn.addEventListener('click', function() {
        const text = qrInput.value.trim();
        if (text) {
            generateQRCode(text);
        } else {
            showError('Please enter some text or URL to generate a QR code.');
        }
    });

    // Enter key in input field
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    // Character counter
    qrInput.addEventListener('input', function() {
        const length = this.value.length;
        const maxLength = 2953;
        charCounter.textContent = `${length} / ${maxLength} characters`;
        
        // Change color based on length
        if (length > maxLength * 0.9) {
            charCounter.style.color = '#dc3545'; // Red when approaching limit
        } else if (length > maxLength * 0.7) {
            charCounter.style.color = '#ffc107'; // Yellow when getting close
        } else {
            charCounter.style.color = '#6c757d'; // Default gray
        }
    });

    // Download QR code
    downloadBtn.addEventListener('click', function() {
        const img = qrCanvas.querySelector('img');
        if (img) {
            const link = document.createElement('a');
            link.download = 'qr-code.png';
            link.href = img.src;
            link.click();
        }
    });

    // Share button
    shareBtn.addEventListener('click', function() {
        const text = qrInput.value.trim();
        if (text) {
            // Generate the share link using base64 encoding
            const currentUrl = window.location.origin + window.location.pathname;
            const encodedText = btoa(text);
            const shareLink = `${currentUrl}?code=${encodedText}`;
            
            // Update the share info
            shareLinkInput.value = shareLink;
            shareTextInput.value = text;
            
            // Show the share info section
            shareInfo.style.display = 'block';
            
            // Scroll to share info
            shareInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            console.log('Share button clicked, text:', text, 'link:', shareLink);
        } else {
            showError('Please enter some text first to create a shareable link.');
        }
    });

    // Copy link button
    copyLinkBtn.addEventListener('click', function() {
        const textToCopy = shareLinkInput.value;
        copyToClipboard(textToCopy, copyLinkBtn);
    });

    // Copy text button
    copyTextBtn.addEventListener('click', function() {
        const textToCopy = shareTextInput.value;
        copyToClipboard(textToCopy, copyTextBtn);
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
        qrInput.value = '';
        qrSection.style.display = 'none';
        shareInfo.style.display = 'none';
        charCounter.textContent = '0 / 2,953 characters';
        charCounter.style.color = '#6c757d';
        qrInput.focus();
    });

    function generateQRCode(text) {
        // Clear previous QR code by clearing the canvas content
        qrCanvas.innerHTML = '';
        
        // Validate text length
        if (text.length > 2953) { // Maximum for QR Code version 40 with L correction level
            showError('The text is too long for a QR code. Please shorten it to less than 2,953 characters.');
            return;
        }
        
        try {
            // Generate new QR code with lower correction level to fit more data
            new QRCode(qrCanvas, {
                text: text,
                width: 512,
                height: 512,
                colorDark: '#000000',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.L // Changed from H to L for more data capacity
            });
            
            // Show the QR code section
            qrSection.style.display = 'block';
            
            // Update the URL with the generated code using base64 encoding
            const currentUrl = window.location.origin + window.location.pathname;
            const encodedText = btoa(text);
            const newUrl = `${currentUrl}?code=${encodedText}`;
            window.history.pushState({ text: text }, '', newUrl);
            
            // Scroll to QR code section
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('QR Code generation error:', error);
            showError('Failed to generate QR code. The text might be too long or contain unsupported characters. Please try shortening it.');
        }
    }

    function showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background-color: #f8d7da;
                color: #721c24;
                padding: 12px;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                margin: 10px 0;
                font-size: 14px;
                line-height: 1.4;
            `;
            
            // Insert after the input section
            const inputSection = document.querySelector('.input-section');
            inputSection.parentNode.insertBefore(errorDiv, inputSection.nextSibling);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
        
        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showCopyFeedback(button, message) {
        const originalText = button.textContent;
        button.textContent = message;
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#6c757d';
        }, 1500);
    }

    async function copyToClipboard(text, button) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                // Use modern clipboard API
                await navigator.clipboard.writeText(text);
                showCopyFeedback(button, 'Copied!');
            } else {
                // Fallback for older browsers
                shareLinkInput.select();
                document.execCommand('copy');
                showCopyFeedback(button, 'Copied!');
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            showCopyFeedback(button, 'Failed!');
        }
    }

    // Auto-focus input field
    qrInput.focus();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', waitForQRCode);
