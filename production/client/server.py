#!/usr/bin/env python3
"""
Smoocho Bill - Production Client Server
Properly serves the React SPA with correct routing and MIME types
"""

import http.server
import socketserver
import os
import sys
import mimetypes
from urllib.parse import urlparse, unquote

class SmoochoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to serve from
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def guess_type(self, path):
        """Override to provide correct MIME types for modern web assets"""
        # Handle JavaScript modules with correct MIME type
        if path.endswith('.js'):
            return 'application/javascript'
        # Handle CSS files
        elif path.endswith('.css'):
            return 'text/css'
        # Handle HTML files
        elif path.endswith('.html'):
            return 'text/html'
        # Handle JSON files
        elif path.endswith('.json'):
            return 'application/json'
        # Handle manifest files
        elif path.endswith('.webmanifest'):
            return 'application/manifest+json'
        # Handle service worker
        elif path.endswith('sw.js'):
            return 'application/javascript'
        # Handle registerSW.js
        elif path.endswith('registerSW.js'):
            return 'application/javascript'
        # Handle workbox files
        elif 'workbox' in path and path.endswith('.js'):
            return 'application/javascript'
        # For other files, use the default mimetypes module
        else:
            return mimetypes.guess_type(path)[0] or 'application/octet-stream'
    
    def do_GET(self):
        """Handle GET requests with proper SPA routing"""
        # Parse the URL
        parsed_url = urlparse(self.path)
        path = unquote(parsed_url.path)
        
        # Handle API requests (forward to backend)
        if path.startswith('/api/'):
            self.send_error(404, "API requests should go to backend server")
            return
        
        # Handle static assets - serve these normally
        if (path.startswith('/assets/') or 
            path.startswith('/manifest') or 
            path.startswith('/sw.js') or 
            path.endswith('sw.js') or
            path.endswith('registerSW.js') or
            path.endswith('workbox') or
            path.startswith('/vite.svg') or
            path.startswith('/favicon') or
            path.endswith('.js') or
            path.endswith('.css') or
            path.endswith('.png') or
            path.endswith('.jpg') or
            path.endswith('.jpeg') or
            path.endswith('.gif') or
            path.endswith('.svg') or
            path.endswith('.ico') or
            path.endswith('.woff') or
            path.endswith('.woff2') or
            path.endswith('.ttf') or
            path.endswith('.eot')):
            
            # Check if file exists
            if os.path.exists(path) and os.path.isfile(path):
                # Set the correct MIME type before serving
                content_type = self.guess_type(path)
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.end_headers()
                
                # Read and serve the file content
                with open(path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                # File not found, serve index.html
                self.path = '/index.html'
                super().do_GET()
                return
        
        # For all other routes (including hard refreshes), serve index.html
        # This ensures SPA routing works correctly
        self.path = '/index.html'
        super().do_GET()
    
    def end_headers(self):
        """Add CORS and cache headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Add cache control for static assets
        if self.path.startswith('/assets/') or self.path.endswith(('.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot')):
            # Cache static assets for 1 year
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        else:
            # No cache for HTML and other files
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom logging with better formatting"""
        # Extract the actual path being served
        if hasattr(self, 'path'):
            actual_path = self.path
            if actual_path == '/index.html':
                actual_path = f"{self.path} (SPA route)"
        else:
            actual_path = "unknown"
        
        print(f"[Smoocho Server] {format % args} -> {actual_path}")

def start_server(port=3000):
    """Start the server"""
    try:
        # Change to the client directory
        client_dir = os.path.join(os.path.dirname(__file__))
        os.chdir(client_dir)
        
        print(f"🚀 Starting Smoocho Client Server...")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"🌐 URL: http://localhost:{port}")
        print(f"📱 SPA Mode: Enabled (all routes serve index.html)")
        print(f"🔧 Static Assets: /assets/, .js, .css, images, fonts")
        print(f"⚡ API Requests: Forwarded to backend server")
        print(f"🔄 Hard Refresh: Fixed (always serves index.html)")
        print(f"🎯 MIME Types: Fixed for JavaScript modules")
        print("-" * 50)
        
        # Create server
        with socketserver.TCPServer(("", port), SmoochoHandler) as httpd:
            print(f"✅ Server started successfully on port {port}")
            print(f"🔄 Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
