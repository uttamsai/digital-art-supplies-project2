$ErrorActionPreference = 'Stop'
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Client build failed.' }
gcloud run deploy digital-art-supplies-project2 --source=. --project=my-resume-506923 --region=us-west1 --service-account=digital-art-project2@my-resume-506923.iam.gserviceaccount.com --set-env-vars='NODE_ENV=production,MONGODB_DB=digital_art_supplies_project2,TAX_RATE=0.095' --set-secrets='MONGODB_URI=digital-art-supplies-mongodb-uri:1,SESSION_SECRET=digital-art-supplies-project2-session:1' --allow-unauthenticated --min-instances=0 --max-instances=2 --memory=512Mi --cpu=1 --concurrency=20 --timeout=60 --quiet
if ($LASTEXITCODE -ne 0) { throw 'Cloud deployment failed. Check the build and service logs.' }
