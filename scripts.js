document.getElementById('previewForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const urlInput = document.getElementById('url').value.trim();

    if (!urlInput) {
        document.getElementById('message').textContent = "Please enter a valid URL!";
        return;
    }

    document.getElementById('message').textContent = "Fetching video details...";

    try {
        const response = await fetch('/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ url: urlInput }),
        });

        if (!response.ok) {
            throw new Error("Error fetching video details");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        document.getElementById('message').textContent = "";
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('thumbnail').src = data.thumbnail;
        document.getElementById('title').textContent = `Title: ${data.title}`;
        document.getElementById('duration').textContent = `Duration: ${data.duration} seconds`;
        document.getElementById('fileSize').textContent = `File Size: ${data.file_size.toFixed(2)} MB`;
    } catch (error) {
        document.getElementById('message').textContent = `An error occurred: ${error.message}`;
    }
});

document.getElementById('downloadForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const urlInput = document.getElementById('url').value.trim();
    const formatInput = document.getElementById('format').value;

    if (!urlInput || !formatInput) {
        document.getElementById('message').textContent = "Please select a valid URL and format!";
        return;
    }

    document.getElementById('message').textContent = "Downloading video...";

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ url: urlInput, format: formatInput }),
        });

        if (!response.ok) {
            throw new Error("Error downloading video");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        document.getElementById('message').textContent = "Download complete!";
        const a = document.createElement('a');
        a.href = data.filepath;
        a.download = data.title + (formatInput === 'mp3' ? '.mp3' : '.mp4');
        a.click();
    } catch (error) {
        document.getElementById('message').textContent = `An error occurred: ${error.message}`;
    }
});

document.getElementById('deleteForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const filePathInput = document.getElementById('filePath').value.trim();

    if (!filePathInput) {
        document.getElementById('message').textContent = "Please enter a valid file path!";
        return;
    }

    document.getElementById('message').textContent = "Deleting file...";

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ file_path: filePathInput }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        document.getElementById('message').textContent = data.message;
    } catch (error) {
        document.getElementById('message').textContent = `An error occurred: ${error.message}`;
    }
});
