"""
Simple HTTP server for the frontend
Run this in the frontend folder to serve the dashboard
"""
import http.server
import socketserver
import os
from pathlib import Path

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

os.chdir(Path(__file__).parent)

print(f"\n✓ Frontend server starting on http://localhost:{PORT}")
print(f"✓ Open http://localhost:{PORT} in your browser\n")
print("Make sure the backend is running on http://localhost:5000\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
