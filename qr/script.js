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
        generateQRCode(decodedText);
    }

    // Generate QR code button
    generateBtn.addEventListener('click', function() {
        const text = qrInput.value.trim();
        if (text) {
            generateQRCode(text);
        } else {
            alert('Please enter some text or URL');
        }
    });

    // Enter key in input field
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateBtn.click();
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
            alert('Please enter some text first');
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
        qrInput.focus();
    });

    function generateQRCode(text) {
        // Clear previous QR code by clearing the canvas content
        qrCanvas.innerHTML = '';
        
        // Generate new QR code using the correct API
        new QRCode(qrCanvas, {
            text: text,
            width: 512,
            height: 512,
            colorDark: '#000000',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
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
