# Observer Frontend

## Installation

Clone the repository

```bash
git clone https://github.com/kbjohnson-penn/observer_frontend.git
cd observer_frontend
```

### Configuration

Before running the project, configure your environment variables:

Copy `.env.local.example` to `.env` and fill in the necessary settings.

## Development Environment

1. Install [Node.js](https://nodejs.org/en/download/package-manager)

### Running the Project

1. Install NPM packages

```bash
npm install
```

2. Run development server.

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

## Production Environment

### Self-Hosting

1. Install [Node.js](https://nodejs.org/en/download/package-manager)

2. Install NPM packages

```bash
npm install
```

3. Build application

```bash
npm run build
```

4. Start the Node.js server

```bash
npm run start
```

The application is now accessible via port **3000**.

### Docker Image

1. Install [Docker](https://docs.docker.com/get-docker/) on your machine.

2. Build the container

```bash
docker build -t observer_frontend .
```

3. Run the container

```bash
docker run -p 3000:3000 observer_frontend
```

## Contributing

Please read [CONTRIBUTING](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Changelog

Check [CHANGELOG](CHANGELOG.md) to get the version details.
