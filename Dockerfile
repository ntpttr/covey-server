FROM node:15.2-alpine
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json ./
RUN npm install
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 3000
CMD [ "node", "app.js" ]
