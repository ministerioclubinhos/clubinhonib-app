# Deployment & Infrastructure

This project uses **AWS CloudFormation** and **AWS Amplify** for infrastructure and deployment management.

## ☁️ Infrastructure as Code (IaC)

The `cloudformation/` directory contains the templates defining our cloud resources.

- **`amplify-app.yaml`**: Defines the Amplify App settings, build settings, and environment variables.
- **`route53-dns.yaml`**: Manages DNS records and domain routing.
- **`parameters.json`**: Parameter files for CloudFormation stacks.

## 🚀 Deployment Pipeline

The project is configured for continuous deployment via AWS Amplify.

1. **Push to Git**: Pushing code to specific branches triggers the pipeline.
    - `main`: Deploys to Production.
    - `staging`: Deploys to Staging environment.
2. **Build**: Amplify runs `npm ci` and `npm run build`.
3. **Deploy**: The build artifacts are deployed to the S3 hosting bucket and CloudFront cache is invalidated.

## 🛠️ Local Development vs Production

- **Local**: specific `.env.local` files for pointing to local or staging backends.
- **Production**: Environment variables are managed securely via the Amplify Console and injected during build time.

## 📜 Deployment Script (`deploy.sh`)

The `cloudformation/deploy.sh` script automates the stack update process. It handles:

- Updating the CloudFormation stack.
- Wait logic for stack completion.
- Checking for parameter overrides.
