document.addEventListener('DOMContentLoaded', () => {
    const fileListContainer = document.getElementById('file-list');

    // Fetch and display files
    async function loadFiles() {
        try {
            // Fetch directly from the static JSON file (Works on GitHub Pages)
            // Add cache bypassing query param to ensure latest data is fetched
            const response = await fetch(`board_data.json?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Data fetch failed');
            const files = await response.json();

            fileListContainer.innerHTML = ''; // Clear loading state

            if (files.length === 0) {
                fileListContainer.innerHTML = '<div class="empty-state">등록된 자료가 없습니다.</div>';
                return;
            }

            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'resource-item fade-up';
                item.innerHTML = `
                    <div class="col-title">
                        <span class="file-icon">📄</span>
                        <span class="file-name">${file.title}</span>
                    </div>
                    <div class="col-date">${file.date}</div>
                    <div class="col-size">${file.size}</div>
                    <div class="col-action">
                        <!-- Normalize Korean strings to NFC so Chrome doesn't fallback to UUIDs for NFD strings -->
                        <a href="uploads/${encodeURI(file.filename.normalize('NFC'))}" download="${(file.originalName || file.filename).normalize('NFC')}" class="download-btn">
                            <span class="download-icon">↓</span>
                        </a>
                    </div>
                `;
                fileListContainer.appendChild(item);
            });

            // Trigger animations
            setTimeout(() => {
                document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
            }, 50);

        } catch (error) {
            console.error('Error fetching files:', error);
            fileListContainer.innerHTML = '<div class="empty-state">자료를 불러오는데 실패했습니다.</div>';
        }
    }

    // Initial load
    loadFiles();
});
