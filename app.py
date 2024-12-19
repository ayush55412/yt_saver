from flask import Flask, render_template, request, jsonify, send_file
import yt_dlp
import os
import logging

app = Flask(__name__)

# Setup logging
logging.basicConfig(level=logging.DEBUG)

def get_video_info(url):
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "file_size": info.get("filesize_approx") / (1024 * 1024),  # Approximate size in MB
            "file_path": os.path.join('downloads', info.get("title") + '.' + info.get("ext"))
        }

def download_video(url, download_path, format_choice):
    if format_choice == 'mp3':
        ydl_opts = {
            'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
    else:  # Default to mp4 video
        ydl_opts = {
            'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
            'format': 'bestvideo+bestaudio/best',
        }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filepath = ydl.prepare_filename(info)
        file_size = os.path.getsize(filepath) / (1024 * 1024)  # in MB
        return filepath, file_size

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview', methods=['POST'])
def preview():
    url = request.form.get('url')
    if not url:
        return jsonify({"error": "Please provide a valid URL"}), 400

    try:
        video_info = get_video_info(url)
        return jsonify(video_info)
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/download', methods=['POST'])
def download():
    url = request.form.get('url')
    format_choice = request.form.get('format')
    if not url:
        return "Please provide a valid URL."

    download_path = 'downloads'
    os.makedirs(download_path, exist_ok=True)

    try:
        filepath, file_size = download_video(url, download_path, format_choice)
        return jsonify({"filepath": filepath, "file_size": file_size})
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete', methods=['POST'])
def delete_file():
    file_path = request.form.get('file_path')
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "File deleted successfully"})
        else:
            return jsonify({"error": "File does not exist"}), 400
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
