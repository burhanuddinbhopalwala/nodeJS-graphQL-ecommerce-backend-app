FROM node:10.9.0
WORKDIR /usr/src/nodeJS-graphQL-ecommerce-backend-app/
COPY ./package.json ./
RUN npm install
COPY ./ ./
EXPOSE 3500
CMD npm run start 

#* docker build -t nodeJS-graphQL-ecommerce-backend-app:latest . 
#* docker run -it -p 3500:3500 nodeJS-graphQL-ecommerce-backend-app
