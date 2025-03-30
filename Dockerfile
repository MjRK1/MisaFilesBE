# Default image
FROM node:20-alpine

# Installing work directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installing
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files into container

COPY . .

# Build project
RUN npm run build

# Run app in production mode
CMD ["npm", "run", "start:prod"]

# Open app port
EXPOSE 5002
