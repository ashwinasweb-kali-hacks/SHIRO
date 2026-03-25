document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // 1. NAVIGATION — Switch between studios
    // =========================================================
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target]');
    const studioViews = document.querySelectorAll('.studio-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            studioViews.forEach(view => {
                view.classList.remove('active-view');
                if (view.id === targetId) view.classList.add('active-view');
            });
        });
    });

    // =========================================================
    // 2. SETTINGS MODAL — open/close
    // =========================================================
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');

    // Find Settings nav item by its ID (robust)
    const settingsBtn = document.getElementById('settings-btn');

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.add('active');
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) settingsModal.classList.remove('active');
        });
    }

    // Save/load Endpoint URL
    const endpointInput = document.getElementById('api-endpoint-input');
    if (endpointInput) {
        const saved = localStorage.getItem('shiro_ollama_endpoint');
        if (saved) endpointInput.value = saved;
        endpointInput.addEventListener('change', (e) => {
            localStorage.setItem('shiro_ollama_endpoint', e.target.value.trim());
        });
    }

    // =========================================================
    // 3. CHAT STUDIO — File upload + Ollama integration
    // =========================================================
    const chatInput      = document.getElementById('chat-input');
    const sendChatBtn    = document.getElementById('send-chat-btn');
    const chatHistory    = document.getElementById('chat-history');
    const attachFileBtn  = document.getElementById('attach-file-btn');
    const chatFileInput  = document.getElementById('chat-file-input');
    const filePrevCont   = document.getElementById('file-preview-container');
    const filePrevIcon   = document.getElementById('file-preview-icon');
    const imgPreview     = document.getElementById('image-preview');
    const filePrevName   = document.getElementById('file-preview-name');
    const removeFileBtn  = document.getElementById('remove-file-btn');

    let currentFile        = null;
    let currentFileContent = null;
    let isImageFile        = false;

    // Attach button opens file picker
    if (attachFileBtn) {
        attachFileBtn.addEventListener('click', () => chatFileInput && chatFileInput.click());
    }

    // File selected
    if (chatFileInput) {
        chatFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            currentFile = file;
            filePrevName.textContent = file.name;
            filePrevCont.style.display = 'flex';

            const isImg = file.type.startsWith('image/');
            isImageFile = isImg;

            if (isImg) {
                filePrevIcon.style.display = 'none';
                imgPreview.style.display = 'block';
                const reader = new FileReader();
                reader.onload = ev => {
                    imgPreview.src = ev.target.result;
                    currentFileContent = ev.target.result.split(',')[1];
                };
                reader.readAsDataURL(file);
            } else {
                imgPreview.style.display = 'none';
                filePrevIcon.style.display = 'block';
                const reader = new FileReader();
                reader.onload = ev => { currentFileContent = ev.target.result; };
                reader.readAsText(file);
            }
        });
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', clearFilePreview);
    }

    function clearFilePreview() {
        currentFile = null;
        currentFileContent = null;
        isImageFile = false;
        if (chatFileInput) chatFileInput.value = '';
        if (filePrevCont) filePrevCont.style.display = 'none';
    }

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            if (this.value === '') this.style.height = 'auto';
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
            }
        });
    }

    if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendChat);

    async function handleSendChat() {
        const text = chatInput ? chatInput.value.trim() : '';
        if (!text && !currentFile) return;

        let finalPrompt  = text;
        let imagesPayload = null;

        if (currentFile) {
            if (isImageFile) {
                imagesPayload = [currentFileContent];
                finalPrompt  = text || 'Describe this image in detail.';
            } else {
                finalPrompt = `File: '${currentFile.name}'\n\n---\n${currentFileContent}\n---\n\n${text || 'Please analyze this file.'}`;
            }
        }

        // Build user message HTML
        let userHtml = text || '';
        if (currentFile) {
            if (isImageFile) {
                userHtml = `<img src="data:image/*;base64,${currentFileContent}" style="max-width:200px;border-radius:8px;margin-bottom:5px;display:block;">${userHtml}`;
            } else {
                userHtml = `<div style="padding:8px 12px;background:rgba(0,0,0,0.25);border-left:3px solid #555;font-size:0.82em;margin-bottom:6px;border-radius:4px;"><i class="fa-solid fa-file"></i> ${currentFile.name}</div>${userHtml}`;
            }
        }

        appendMessage('user', userHtml);
        if (chatInput) { chatInput.value = ''; chatInput.style.height = 'auto'; }
        clearFilePreview();

        const messageId = `msg-${Date.now()}`;
        appendMessage('ai', '<div class="typing-dots"><span></span><span></span><span></span></div>', messageId);

        // Determine base URL: try saved endpoint, fallback to direct Ollama
        const baseUrl = (endpointInput && endpointInput.value.trim()) || 'http://localhost:11434';

        const targetModel = (isImageFile && imagesPayload) ? 'llava' : 'llama3.2';
        const body = { model: targetModel, prompt: finalPrompt, stream: false };
        if (imagesPayload) body.images = imagesPayload;

        try {
            const res = await fetch(`${baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const data = await res.json();
            updateAiMessage(messageId, formatAIResponse(data.response || '(empty response)'));

        } catch (err) {
            console.error('Chat error:', err);
            updateAiMessage(messageId,
                `<span style="color:#ff5f56;"><strong>⚠ Connection Error</strong></span><br>
                Could not reach the AI backend.<br><br>
                <strong>Fix:</strong><br>
                1. Make sure <code>ollama serve</code> is running.<br>
                2. Run <code>ollama pull llama3.2</code> if not done.<br>
                3. Or start the Node bridge: <code>node server.js</code> in the Ollama folder.<br><br>
                <em style="font-size:0.8em;color:#888;">Error: ${err.message}</em>`
            );
        }
    }

    function appendMessage(role, content, id = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-message`;
        if (id) msgDiv.id = id;

        const avatar = document.createElement('div');
        avatar.className = `avatar ${role === 'ai' ? 'ai-avatar' : ''}`;
        avatar.innerHTML = role === 'ai' ? '<i class="fa-solid fa-brain"></i>' : 'A';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(contentDiv);
        if (chatHistory) {
            chatHistory.appendChild(msgDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }

    function updateAiMessage(id, newContent) {
        const msgDiv = document.getElementById(id);
        if (msgDiv) {
            msgDiv.querySelector('.message-content').innerHTML = newContent;
            if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }

    function formatAIResponse(text) {
        return text
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // =========================================================
    // 4. IMAGE STUDIO — local Python backend (port 8000)
    // =========================================================
    setupStudio('generate-image-btn', 'image-prompt', 'image-gallery', 'image');
    setupStudio('generate-video-btn', 'video-prompt', 'video-gallery', 'video');
    setupStudio('generate-qr-btn',   'qr-url',        'qr-gallery',   'QR');

    function setupStudio(buttonId, inputId, galleryId, type) {
        const btn     = document.getElementById(buttonId);
        const input   = document.getElementById(inputId);
        const gallery = document.getElementById(galleryId);
        if (!btn || !input || !gallery) return;

        btn.addEventListener('click', async () => {
            const prompt = input.value.trim() || 'Generated output';

            // Show loading spinner
            gallery.innerHTML = `
                <div class="generated-image-container" style="text-align:center;padding:2rem;">
                    <span class="loader"></span>
                    <p style="margin-top:20px;color:#a0aec0;">Generating your ${type}...</p>
                    <p style="font-size:0.8rem;color:#ffd700;margin-top:8px;padding:0 20px;">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        First time? The backend may be downloading the AI model (~1GB). Please wait — don't close the browser!
                    </p>
                </div>`;

            if (type === 'image') {
                await generateImage(prompt, gallery);
            } else if (type === 'video') {
                await generateVideo(prompt, gallery);
            } else if (type === 'QR') {
                generateQR(prompt, gallery);
            }
        });
    }

    async function generateImage(prompt, gallery) {
        try {
            const res  = await fetch('http://localhost:8000/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                gallery.innerHTML = `
                    <div class="generated-image-container animation-fade-in" style="text-align:center;">
                        <img src="${data.image_base64}" alt="Generated" style="width:100%;max-height:420px;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                        <h3 style="margin-top:16px;">✨ Image Generated!</h3>
                        <p style="font-size:0.9rem;opacity:0.7;margin:8px 0 16px;">Prompt: "${prompt}"</p>
                        <a href="${data.image_base64}" download="shiro-ai-art.png" style="display:inline-block;padding:10px 24px;border-radius:50px;text-decoration:none;background:linear-gradient(135deg,#6c63ff,#ff0080);color:white;font-weight:600;">
                            <i class="fa-solid fa-download"></i> Download Image
                        </a>
                    </div>`;
            } else {
                throw new Error(data.detail || data.message || 'Backend returned failure.');
            }
        } catch (err) {
            showStudioError(gallery, err.message, 'Python backend (port 8000) must be running. Run <code>python main.py</code> in the Backend folder.');
        }
    }

    async function generateVideo(prompt, gallery) {
        try {
            const res  = await fetch('http://localhost:8000/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                gallery.innerHTML = `
                    <div class="generated-image-container animation-fade-in" style="text-align:center;">
                        <video src="${data.video_base64}" autoplay loop controls style="width:100%;max-height:420px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);"></video>
                        <h3 style="margin-top:16px;">🎬 Video Generated!</h3>
                        <p style="font-size:0.9rem;opacity:0.7;margin:8px 0 16px;">Prompt: "${prompt}"</p>
                        <a href="${data.video_base64}" download="shiro-ai-video.mp4" style="display:inline-block;padding:10px 24px;border-radius:50px;text-decoration:none;background:linear-gradient(135deg,#6c63ff,#ff0080);color:white;font-weight:600;">
                            <i class="fa-solid fa-download"></i> Download Video
                        </a>
                    </div>`;
            } else {
                throw new Error(data.detail || data.message || 'Backend returned failure.');
            }
        } catch (err) {
            showStudioError(gallery, err.message, 'Python backend (port 8000) must be running. Run <code>python main.py</code> in the Backend folder.');
        }
    }

    function generateQR(prompt, gallery) {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(prompt)}&color=6c63ff&bgcolor=0d0d1a`;
            gallery.innerHTML = `
                <div class="generated-image-container animation-fade-in" style="text-align:center;">
                    <img src="${qrUrl}" alt="QR Code" style="width:280px;height:280px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                    <h3 style="margin-top:16px;">📱 QR Code Generated!</h3>
                    <p style="font-size:0.9rem;opacity:0.7;margin:8px 0 16px;">URL: <code>${prompt}</code></p>
                    <a href="${qrUrl}" target="_blank" download="shiro-qr.png" style="display:inline-block;padding:10px 24px;border-radius:50px;text-decoration:none;background:linear-gradient(135deg,#6c63ff,#ff0080);color:white;font-weight:600;">
                        <i class="fa-solid fa-download"></i> Save QR Code
                    </a>
                </div>`;
        } catch (err) {
            showStudioError(gallery, err.message, 'Check the URL entered.');
        }
    }

    function showStudioError(gallery, msg, hint) {
        gallery.innerHTML = `
            <div class="generated-image-container" style="color:#ff5f56;border:1px solid rgba(255,95,86,0.3);background:rgba(255,95,86,0.05);padding:2rem;text-align:center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem;margin-bottom:1rem;"></i>
                <p style="font-weight:600;font-size:1.1rem;">Generation Failed</p>
                <p style="font-size:0.85rem;margin-top:10px;color:#ccc;">${msg}</p>
                <p style="font-size:0.8rem;margin-top:8px;color:#888;">${hint}</p>
            </div>`;
    }

    // =========================================================
    // 5. LOGOUT
    // =========================================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('shiro_auth_token');
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = 'login.html'; }, 400);
        });
    }

    // =========================================================
    // 6. PAGE TRANSITIONS
    // =========================================================
    document.querySelectorAll('.nav-link-fade').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = target; }, 400);
        });
    });

    // =========================================================
    // 7. FADE IN on page load
    // =========================================================
    document.body.classList.add('fade-in');

});
