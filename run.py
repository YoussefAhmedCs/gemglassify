#!/usr/bin/env python3
"""
Quick Start Script for CNN Image Classification
Runs both API server and frontend web server
"""

import os
import sys
import time
import threading
import webbrowser
from pathlib import Path

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    """Print welcome header"""
    header = f"""
    {Colors.BOLD}{Colors.CYAN}
    ╔══════════════════════════════════════════════════════╗
    ║  🎨 CNN Image Classification - Web Interface        ║
    ║  Gemstone Recognition with AI                       ║
    ╚══════════════════════════════════════════════════════╝
    {Colors.RESET}
    """
    print(header)

def check_requirements():
    """Check if required packages are installed"""
    print(f"{Colors.BLUE}Checking requirements...{Colors.RESET}")
    
    required_packages = ['tensorflow', 'uvicorn', 'fastapi', 'PIL']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package if package != 'PIL' else 'PIL')
            print(f"  {Colors.GREEN}✓{Colors.RESET} {package}")
        except ImportError:
            print(f"  {Colors.RED}✗{Colors.RESET} {package} (missing)")
            missing.append(package)
    
    if missing:
        print(f"\n{Colors.YELLOW}Warning: Missing packages: {', '.join(missing)}{Colors.RESET}")
        print(f"Install with: pip install -r requirements.txt\n")
        return False
    
    print(f"{Colors.GREEN}✓ All requirements met{Colors.RESET}\n")
    return True

def run_api_server():
    """Run the FastAPI server"""
    print(f"{Colors.BLUE}[API Server] Starting...{Colors.RESET}")
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            access_log=False
        )
    except Exception as e:
        print(f"{Colors.RED}[API Server] Error: {e}{Colors.RESET}")
        sys.exit(1)

def run_web_server():
    """Run the web server for frontend"""
    print(f"{Colors.BLUE}[Web Server] Starting...{Colors.RESET}")
    
    try:
        import http.server
        import socketserver
        
        PORT = 8080
        Handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"{Colors.GREEN}[Web Server] Running on port {PORT}{Colors.RESET}")
            httpd.serve_forever()
    except Exception as e:
        print(f"{Colors.RED}[Web Server] Error: {e}{Colors.RESET}")
        sys.exit(1)

def main():
    """Main entry point"""
    print_header()
    
    # Check if running in correct directory
    if not Path("index.html").exists():
        print(f"{Colors.RED}Error: index.html not found in current directory{Colors.RESET}")
        print("Please run this script from the project root directory\n")
        sys.exit(1)
    
    # Check requirements
    if not check_requirements():
        print(f"{Colors.YELLOW}Continue anyway? (y/n): {Colors.RESET}", end="")
        if input().lower() != 'y':
            sys.exit(0)
    
    print(f"{Colors.BOLD}Starting Services...{Colors.RESET}\n")
    
    # Start API server in a thread
    api_thread = threading.Thread(target=run_api_server, daemon=True)
    api_thread.start()
    
    # Wait for API to start
    time.sleep(2)
    
    # Start web server in a thread
    web_thread = threading.Thread(target=run_web_server, daemon=True)
    web_thread.start()
    
    # Wait for web server to start
    time.sleep(1)
    
    # Print startup info
    print(f"\n{Colors.BOLD}{Colors.GREEN}✓ Services Started Successfully!{Colors.RESET}\n")
    print(f"{Colors.CYAN}╔════════════════════════════════════════════╗{Colors.RESET}")
    print(f"{Colors.CYAN}║  API Server:      http://localhost:8000   ║{Colors.RESET}")
    print(f"{Colors.CYAN}║  Frontend:        http://localhost:8080   ║{Colors.RESET}")
    print(f"{Colors.CYAN}║  API Docs:        http://localhost:8000/docs  ║{Colors.RESET}")
    print(f"{Colors.CYAN}╚════════════════════════════════════════════╝{Colors.RESET}\n")
    
    # Open browser
    try:
        print(f"{Colors.BLUE}Opening browser...{Colors.RESET}")
        webbrowser.open('http://localhost:8080')
    except:
        print(f"{Colors.YELLOW}Could not open browser automatically{Colors.RESET}")
        print(f"Visit: http://localhost:8080\n")
    
    # Instructions
    print(f"{Colors.BOLD}Usage:{Colors.RESET}")
    print(f"  1. Upload images using the web interface at http://localhost:8080")
    print(f"  2. View API documentation at http://localhost:8000/docs")
    print(f"  3. Use the backend API directly at http://localhost:8000\n")
    
    print(f"{Colors.YELLOW}Press Ctrl+C to stop services{Colors.RESET}\n")
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Shutting down...{Colors.RESET}")
        sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Services stopped{Colors.RESET}")
        sys.exit(0)
    except Exception as e:
        print(f"{Colors.RED}Error: {e}{Colors.RESET}")
        sys.exit(1)
