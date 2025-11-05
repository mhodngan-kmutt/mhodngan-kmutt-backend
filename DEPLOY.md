# MhodNgan - Google Cloud Run Deployment Guide

## Prerequisites

1. **Install Google Cloud SDK**
   ```bash
   # macOS (using Homebrew)
   brew install google-cloud-sdk

   # Or download from
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Login and Configure Project**
   ```bash
   # Login to Google Cloud
   gcloud auth login

   # Create a new project (or use existing one)
   gcloud projects create YOUR-PROJECT-ID --name="Mhodngan Backend"

   # Set the project to use
   gcloud config set project YOUR-PROJECT-ID

   # Enable required APIs
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

3. **Configure Region (choose the closest region)**
   ```bash
   # For Thailand, asia-southeast1 (Singapore) is recommended
   gcloud config set run/region asia-southeast1
   ```

## Deployment Methods

### Method 1: Deploy with Google Cloud Build (Recommended)

```bash
# Build and Deploy in a single command
gcloud run deploy mhodngan-backend \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080
```

**Explanation:**
- `--source .` = Build from source code in current directory
- `--platform managed` = Use fully managed Cloud Run
- `--region asia-southeast1` = Deploy to Singapore (closest to Thailand)
- `--allow-unauthenticated` = Allow public access without authentication
- `--port 8080` = Specify the port the container will run on

### Method 2: Build Docker Image Manually then Deploy

```bash
# 1. Set variables
export PROJECT_ID=YOUR-PROJECT-ID
export SERVICE_NAME=mhodngan-backend
export REGION=asia-southeast1

# 2. Build Docker image and push to Google Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 3. Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080
```

## Configuring Environment Variables (if needed)

```bash
gcloud run deploy mhodngan-backend \
  --source . \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=your-db-url" \
  --allow-unauthenticated
```

## Viewing Deployed Services

```bash
# List services
gcloud run services list

# View service details
gcloud run services describe mhodngan-backend --region asia-southeast1

# Open URL in browser
gcloud run services describe mhodngan-backend --region asia-southeast1 --format="value(status.url)"
```

## Updating the Service

```bash
# Deploy new version (use the same command as initial deployment)
gcloud run deploy mhodngan-backend --source .
```

## Deleting the Service

```bash
gcloud run services delete mhodngan-backend --region asia-southeast1
```

## Related File Structure

- `Dockerfile` - Instructions for building Docker image
- `.dockerignore` - Files to exclude from Docker image
- `src/index.ts` - Modified to support PORT environment variable

## References

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Elysia.js Deployment Patterns](https://elysiajs.com/patterns/deploy)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
