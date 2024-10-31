FROM node:22.5.1
COPY package.json package-lock.json ./
RUN npm install
COPY ..
RUN npx react-scripts build
EXPOSE 3000
CMD ["npx","react-scripts","start"]

