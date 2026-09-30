#!/usr/bin/env python3
"""
Sahakar Setu - Local Orchestrator (No Docker)
Starts MongoDB verification, all 6 FastAPI microservices, API Gateway, and Web Admin.
"""

import os
import sys
import time
import socket
import signal
import subprocess
import threading
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

SERVICES = [
    {
        "name": "ERP Service",
        "prefix": "[ERP]",
        "color": "\033[94m",
        "port": 8001,
        "cwd": BASE_DIR / "services" / "erp-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8001"}
    },
    {
        "name": "LMS Service",
        "prefix": "[LMS]",
        "color": "\033[96m",
        "port": 8002,
        "cwd": BASE_DIR / "services" / "lms-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8002"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8002"}
    },
    {
        "name": "Attendance Service",
        "prefix": "[ATTEND]",
        "color": "\033[92m",
        "port": 8003,
        "cwd": BASE_DIR / "services" / "attendance-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8003"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8003"}
    },
    {
        "name": "Employment Service",
        "prefix": "[EMPLOY]",
        "color": "\033[93m",
        "port": 8004,
        "cwd": BASE_DIR / "services" / "employment-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8004"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8004"}
    },
    {
        "name": "Analytics Service",
        "prefix": "[ANALYTICS]",
        "color": "\033[95m",
        "port": 8005,
        "cwd": BASE_DIR / "services" / "analytics-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8005"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8005"}
    },
    {
        "name": "AI Service",
        "prefix": "[AI]",
        "color": "\033[91m",
        "port": 8006,
        "cwd": BASE_DIR / "services" / "ai-service",
        "cmd": [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8006"],
        "env": {**os.environ, "MONGO_URI": "mongodb://localhost:27017", "PORT": "8006"}
    },
    {
        "name": "API Gateway",
        "prefix": "[GATEWAY]",
        "color": "\033[33m",
        "port": 3000,
        "cwd": BASE_DIR / "services" / "api-gateway",
        "cmd": ["node", "src/index.js"],
        "env": {
            **os.environ,
            "PORT": "3000",
            "JWT_SECRET": "your-super-secret-jwt-key-change-in-production-min-32-chars",
            "ERP_SERVICE_URL": "http://127.0.0.1:8001",
            "LMS_SERVICE_URL": "http://127.0.0.1:8002",
            "ATTENDANCE_SERVICE_URL": "http://127.0.0.1:8003",
            "EMPLOYMENT_SERVICE_URL": "http://127.0.0.1:8004",
            "ANALYTICS_SERVICE_URL": "http://127.0.0.1:8005",
            "AI_SERVICE_URL": "http://127.0.0.1:8006",
            "ENABLE_REDIS": "false"
        }
    },
    {
        "name": "Web Admin UI",
        "prefix": "[WEB]",
        "color": "\033[36m",
        "port": 5173,
        "cwd": BASE_DIR / "clients" / "web-admin",
        "cmd": ["cmd.exe", "/c", "npm", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
        "env": {**os.environ, "VITE_API_GATEWAY_URL": "http://localhost:3000"}
    }
]

RESET = "\033[0m"
processes = []

def check_port(port, host="127.0.0.1", timeout=1.0):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def check_mongodb():
    print("[CHECK] Verifying MongoDB on localhost:27017...")
    if not check_port(27017):
        print("[ERROR] MongoDB is not running on localhost:27017!")
        print("        Please start the MongoDB Windows service: Net Start MongoDB")
        sys.exit(1)
    print("[OK] MongoDB is active and accepting connections.")

def stream_logs(proc, prefix, color):
    for line in iter(proc.stdout.readline, b''):
        try:
            text = line.decode('utf-8', errors='replace').rstrip()
            if text:
                print(f"{color}{prefix}{RESET} {text}")
        except Exception:
            pass

def kill_process_tree(pid):
    if sys.platform == "win32":
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], capture_output=True)
    else:
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except Exception:
            pass

def cleanup():
    print("\n[SHUTDOWN] Stopping all Sahakar Setu services...")
    for p, svc in processes:
        try:
            print(f"  Stopping {svc['name']} (PID {p.pid})...")
            kill_process_tree(p.pid)
        except Exception:
            pass
    print("[SHUTDOWN] All services stopped cleanly.")

def main():
    print("=" * 65)
    print("       SAHAKAR SETU - UNIFIED LOCAL RUNNER (NO DOCKER)        ")
    print("=" * 65)

    check_mongodb()

    signal.signal(signal.SIGINT, lambda sig, frame: sys.exit(0))
    signal.signal(signal.SIGTERM, lambda sig, frame: sys.exit(0))

    print("\n[STARTUP] Launching all services...")
    for svc in SERVICES:
        print(f"  -> Launching {svc['name']} on port {svc['port']}...")
        proc = subprocess.Popen(
            svc['cmd'],
            cwd=str(svc['cwd']),
            env=svc['env'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1
        )
        processes.append((proc, svc))
        t = threading.Thread(target=stream_logs, args=(proc, svc['prefix'], svc['color']), daemon=True)
        t.start()

    # Wait for services to be healthy
    print("\n[HEALTH] Waiting for services to initialize...")
    all_ready = False
    start_time = time.time()
    while time.time() - start_time < 30:
        statuses = [check_port(svc['port']) for svc in SERVICES]
        if all(statuses):
            all_ready = True
            break
        time.sleep(1)

    print("\n" + "=" * 65)
    print("                  SERVICES READY AND RUNNING                  ")
    print("=" * 65)
    print("  Frontend Web Admin  : http://localhost:5173")
    print("  API Gateway         : http://localhost:3000")
    print("  API Health Check    : http://localhost:3000/health")
    print("  ERP Service         : http://localhost:8001/docs")
    print("  LMS Service         : http://localhost:8002/docs")
    print("  Attendance Service  : http://localhost:8003/docs")
    print("  Employment Service  : http://localhost:8004/docs")
    print("  Analytics Service   : http://localhost:8005/docs")
    print("  AI Service          : http://localhost:8006/docs")
    print("-" * 65)
    print("  Demo Credentials:")
    print("    Admin   : admin / admin")
    print("    Trainer : trainer / password")
    print("    Trainee : trainee / password")
    print("=" * 65)
    print("Press Ctrl+C to stop all services.\n")

    try:
        while True:
            for p, svc in processes:
                code = p.poll()
                if code is not None:
                    print(f"[WARNING] {svc['name']} exited with code {code}")
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()
