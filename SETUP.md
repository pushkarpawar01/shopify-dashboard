# GitHub Setup Instructions

## Initial Setup

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   ```

2. **Add all files to Git**:
   ```bash
   git add .
   ```

3. **Create initial commit**:
   ```bash
   git commit -m "Initial commit: Shopify Order Dashboard"
   ```

4. **Create repository on GitHub**:
   - Go to https://github.com/new
   - Create a new repository named `shopify-order-dashboard`
   - Don't initialize with README (we already have one)

5. **Add remote origin and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shopify-order-dashboard.git
   git branch -M main
   git push -u origin main
   ```

## Verification Steps

After pushing, verify:
- [ ] All files are uploaded to GitHub
- [ ] README.md renders correctly
- [ ] Repository structure is visible
- [ ] No sensitive data in commits

## Environment Setup

### Backend Setup
1. Copy `.env.example` to `.env` in backend folder
2. Update with your actual credentials
3. Run `npm install` in backend folder
4. Run `npm run setup-db` to initialize database

### Frontend Setup
1. Copy `.env.example` to `.env` in frontend folder
2. Update with your API URL
3. Run `npm install` in frontend folder

## Development Commands

### Start both frontend and backend:
```bash
npm run dev
```

### Start individually:
```bash
npm run dev:backend
npm run dev:frontend
```

### Install all dependencies:
```bash
npm run install:all
