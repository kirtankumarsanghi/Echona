# ECHONA Scripts

This folder contains utility scripts for development and deployment.

## 🚀 Startup Scripts

### Windows (PowerShell)
- **start-echona.ps1** - Start all services (recommended)
- **stop-echona.ps1** - Stop all services
- **start-echona-complete.ps1** - Complete startup with checks

### Windows (Batch)
- **start-echona.bat** - Simple batch startup
- **stop-echona.bat** - Simple batch shutdown

## 🔧 Utility Scripts

- **health-check.ps1** - Check if all services are running
- **validate-system.ps1** - Validate system requirements

## 📦 Quick Start

### Start Everything
```powershell
.\scripts\start-echona.ps1
```

### Stop Everything
```powershell
.\scripts\stop-echona.ps1
```

### Health Check
```powershell
.\scripts\health-check.ps1
```

## 🐧 Linux/Mac Users

Create shell script equivalents or run services manually:

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && node server.js

# Terminal 3 - ML Service
python api.py
```

## ⚙️ Configuration

Scripts use configuration from:
- `.env` in root directory
- `service-config.json` for service ports

## 🛠️ Development

To create new scripts:
1. Add script to this folder
2. Update this README
3. Test on multiple environments
4. Document prerequisites and usage
