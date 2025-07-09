# Production Deployment Guide

This guide covers the production deployment and CI/CD pipeline setup for the Wisdom Oracle I-Ching application.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

The Wisdom Oracle I-Ching application is a React/TypeScript SPA built with Vite, featuring:

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     CDN         │    │   Monitoring    │
│   (Nginx/K8s)  │    │  (CloudFlare)   │    │ (Prometheus)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │              Application Layer                      │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
         │  │   App Pod   │  │   App Pod   │  │   App Pod   │  │
         │  │  (Nginx +   │  │  (Nginx +   │  │  (Nginx +   │  │
         │  │  React App) │  │  React App) │  │  React App) │  │
         │  └─────────────┘  └─────────────┘  └─────────────┘  │
         └─────────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │              Data Layer                             │
         │  ┌─────────────┐                ┌─────────────┐     │
         │  │ PostgreSQL  │                │    Redis    │     │
         │  │ (Primary)   │                │   (Cache)   │     │
         │  └─────────────┘                └─────────────┘     │
         └─────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development

```bash
# Clone and setup
git clone <repository-url>
cd wisdom-oracle-iching

# Install dependencies
npm install

# Start development server
npm run dev

# Or use Docker
docker-compose --profile dev up
```

### Production Deployment (Docker)

```bash
# Build and deploy
docker-compose --profile prod up -d

# Or use the deployment script
./scripts/deployment/deploy.sh production
```

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Required environment variables for production:

```bash
# Application
NODE_ENV=production
PORT=3000

# API Configuration
VITE_API_URL=https://api.wisdom-oracle.app
VITE_CLAUDE_API_KEY=your_claude_api_key

# Database
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://wisdom_oracle:password@postgres:5432/wisdom_oracle_db

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### 2. Domain Configuration

Update the following files with your actual domain:

- `nginx.conf` - Update server_name
- `docker-compose.yml` - Update environment variables
- `k8s/base/ingress.yaml` - Update host
- `.github/workflows/ci-cd.yml` - Update deployment URLs

## Docker Deployment

### Single Server Deployment

1. **Prepare the server:**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy the application:**
   ```bash
   # Set environment variables
   export POSTGRES_PASSWORD=your_secure_password
   
   # Deploy
   docker-compose --profile prod up -d
   
   # Check status
   docker-compose ps
   docker-compose logs app
   ```

3. **Verify deployment:**
   ```bash
   curl -f http://localhost/health
   ```

### Multi-Environment Setup

#### Staging Environment
```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml --profile staging up -d

# Or use the deployment script
./scripts/deployment/deploy.sh staging
```

#### Production Environment
```bash
# Deploy to production
./scripts/deployment/deploy.sh production

# Check deployment
./scripts/deployment/deploy.sh production --dry-run
```

### Deployment Script Options

```bash
# Basic deployment
./scripts/deployment/deploy.sh production

# Skip tests (faster deployment)
./scripts/deployment/deploy.sh production --skip-tests

# Dry run (see what would be deployed)
./scripts/deployment/deploy.sh production --dry-run

# Rollback to previous version
./scripts/deployment/deploy.sh production --rollback
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.21+)
- kubectl configured
- Nginx Ingress Controller
- cert-manager (for SSL certificates)

### 1. Setup Cluster Components

```bash
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 2. Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/base/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

### 3. Configure SSL Certificates

```bash
# Create cluster issuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 4. Scaling

```bash
# Scale application
kubectl scale deployment wisdom-oracle-app --replicas=5

# Auto-scaling
kubectl autoscale deployment wisdom-oracle-app --cpu-percent=70 --min=3 --max=10
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Configure Secrets:**
   Go to GitHub repository → Settings → Secrets and add:
   
   ```
   DOCKER_USERNAME      # Docker registry username
   DOCKER_PASSWORD      # Docker registry password
   KUBECONFIG          # Kubernetes cluster config (base64 encoded)
   POSTGRES_PASSWORD   # Database password
   CLAUDE_API_KEY      # Claude AI API key
   SENTRY_DSN          # Error tracking DSN
   SNYK_TOKEN          # Security scanning token
   SLACK_WEBHOOK_URL   # Deployment notifications
   ```

2. **Branch Strategy:**
   - `main` → Production deployment
   - `develop` → Staging deployment
   - `feature/*` → Development builds and tests

3. **Pipeline Stages:**
   - **Test**: Linting, unit tests, coverage
   - **Security**: Dependency audit, vulnerability scanning
   - **Build**: Docker image build and push
   - **Deploy**: Environment-specific deployment
   - **Verify**: Health checks and smoke tests

### Manual Deployment

```bash
# Trigger deployment manually
gh workflow run ci-cd.yml -f environment=production

# Check workflow status
gh run list --workflow=ci-cd.yml
```

## Monitoring and Logging

### Prometheus + Grafana Setup

1. **Deploy monitoring stack:**
   ```bash
   # Using Docker Compose
   docker-compose -f docker-compose.staging.yml --profile monitoring up -d
   
   # Access Grafana
   open http://localhost:3001
   # Default: admin / staging_grafana
   ```

2. **Key Metrics:**
   - Application response time
   - Error rates
   - Memory and CPU usage
   - Request volume
   - Database connections

### Application Logs

```bash
# View application logs
docker-compose logs -f app

# View specific service logs
docker-compose logs postgres redis

# Kubernetes logs
kubectl logs -f deployment/wisdom-oracle-app
kubectl logs -f -l app=wisdom-oracle
```

### Health Checks

- **Application**: `GET /health`
- **Database**: Connection test
- **Redis**: Ping test

## Security

### Security Headers

The nginx configuration includes security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

### SSL/TLS

- Let's Encrypt certificates via cert-manager
- TLS 1.2+ only
- HSTS headers
- SSL redirect

### Container Security

- Non-root user execution
- Read-only root filesystem
- Minimal base images
- Security context constraints

### Regular Updates

```bash
# Update dependencies weekly
npm audit fix
docker pull node:18-alpine
docker pull nginx:alpine

# Security scanning
npm audit --audit-level high
docker scan wisdom-oracle:latest
```

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   # Check logs
   docker-compose logs app
   
   # Verify environment variables
   docker-compose config
   
   # Check health endpoint
   curl -v http://localhost/health
   ```

2. **Database connection issues:**
   ```bash
   # Check database status
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U wisdom_oracle -d wisdom_oracle_db -c "SELECT 1;"
   ```

3. **Performance issues:**
   ```bash
   # Check resource usage
   docker stats
   
   # Monitor application metrics
   curl http://localhost:9090  # Prometheus
   ```

### Debug Commands

```bash
# Enter application container
docker-compose exec app /bin/sh

# Check nginx configuration
docker-compose exec app nginx -t

# Reload nginx configuration
docker-compose exec app nginx -s reload

# Check DNS resolution
docker-compose exec app nslookup postgres
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Update dependencies
   - Security scan
   - Backup verification
   - Performance review

2. **Monthly:**
   - OS security updates
   - Docker image updates
   - Certificate renewal check
   - Capacity planning

3. **Quarterly:**
   - Disaster recovery test
   - Security audit
   - Performance optimization
   - Documentation review

### Backup and Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U wisdom_oracle wisdom_oracle_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U wisdom_oracle wisdom_oracle_db < backup_20231201.sql

# Application data backup
docker-compose exec app tar -czf /tmp/app_backup.tar.gz /usr/share/nginx/html
```

### Updates and Rollbacks

```bash
# Update to new version
git pull origin main
./scripts/deployment/deploy.sh production

# Rollback if needed
./scripts/deployment/deploy.sh production --rollback

# Check current version
docker images wisdom-oracle
```

## Support

For issues and questions:

1. Check this documentation
2. Review application logs
3. Check GitHub Issues
4. Contact the development team

---

**Last Updated**: December 2023  
**Version**: 1.0.0