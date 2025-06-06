# Observer Frontend

A modern, responsive dashboard application for healthcare data visualization and analysis.

## 🚀 Features

- **Interactive Dashboards**: Visualize healthcare metrics and patient data
- **Multi-Modal Data Analysis**: Analyze clinical data across various modalities
- **User Authentication**: Secure login and role-based access control
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Mode**: Support for different color schemes

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [npm](https://www.npmjs.com/) (v8.x or higher)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/kbjohnson-penn/observer_frontend.git
cd observer_frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy the example environment file and update it with your settings:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your specific configuration values.

## 🖥️ Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Development Tools

- **Linting**:

  ```bash
  npm run lint
  ```

- **Type checking**:
  ```bash
  npm run type-check
  ```

## 🏗️ Building for Production

1. **Generate production build**

```bash
npm run build
```

2. **Start production server**

```bash
npm run start
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 🐳 Docker Deployment

1. **Build the Docker image**

```bash
docker build -t observer_frontend .
```

2. **Run the container**

```bash
docker run -p 3000:3000 observer_frontend
```

For a production environment, consider using Docker Compose with appropriate environment variables.

## 🧩 Project Structure

```
src/
├── app/               # Next.js application pages and layouts
├── components/        # Reusable UI components
├── contexts/          # React context providers
├── interfaces/        # TypeScript interfaces and type definitions
├── lib/               # Utility functions and API client
├── constants.ts       # Application constants and configuration
└── middleware.ts      # Request/response middleware for auth and routing
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 Changelog

For version details and update history, see [CHANGELOG.md](CHANGELOG.md).

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🙏 Acknowledgements

This project is built using modern web technologies and frameworks to deliver a robust healthcare data visualization platform.
