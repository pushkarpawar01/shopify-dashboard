# Shopify Order Dashboard

A comprehensive dashboard for managing and analyzing Shopify orders with real-time updates and detailed analytics.

## 🚀 Features

- **Real-time Order Management**: Sync and manage Shopify orders in real-time
- **Detailed Analytics**: Comprehensive order analytics and insights
- **Order Details**: Deep dive into individual order information
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **RESTful API**: Clean and scalable backend architecture

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Shopify API** - Order synchronization

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shopify-order-dashboard.git
cd shopify-order-dashboard
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopify_orders
DB_USER=your_username
DB_PASSWORD=your_password
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_STORE_NAME=your-store-name
```

#### Frontend Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
cd backend
npm run setup-db
```

### 5. Start Development Servers

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
shopify-order-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── README.md
└── .gitignore
```

## 🔧 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Initialize database schema

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders/sync` - Sync orders from Shopify

### Analytics
- `GET /api/analytics/summary` - Get order summary
- `GET /api/analytics/trends` - Get order trends

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Run database migrations
3. Deploy using your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting platform (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Shopify API documentation
- React community
- Tailwind CSS team
