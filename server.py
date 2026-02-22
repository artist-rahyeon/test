import http.server
import socketserver
import json
import os
import time
from datetime import datetime

PORT = 8080
DIRECTORY = "."
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class BoardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # API exact match
        if self.path == '/api/files':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            
            files_data = []
            if os.path.exists(UPLOAD_DIR):
                for filename in os.listdir(UPLOAD_DIR):
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    if os.path.isfile(filepath) and not filename.startswith('.'):
                        stat = os.stat(filepath)
                        size_bytes = stat.st_size
                        size_mb_float = float(size_bytes) / (1024.0 * 1024.0)
                        if size_mb_float >= 0.1:
                            size_str = f"{size_mb_float:.2f} MB"
                        else:
                            size_str = f"{int(size_bytes / 1024.0)} KB"
                        date_str = datetime.fromtimestamp(stat.st_mtime).strftime("%Y.%m.%d")
                        
                        files_data.append({
                            "title": filename, # Using filename as title
                            "filename": filename,
                            "originalName": filename,
                            "size": size_str,
                            "date": date_str,
                            "timestamp": stat.st_mtime
                        })
            
            # Sort by date descending
            files_data.sort(key=lambda x: x['timestamp'], reverse=True)
            
            self.wfile.write(json.dumps(files_data).encode('utf-8'))
            return
            
        return super().do_GET()

Handler = BoardHandler

print(f"Server starting on http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
