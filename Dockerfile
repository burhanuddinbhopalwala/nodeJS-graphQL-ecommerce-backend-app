FROM node:10
WORKDIR /home/nodejs/nodeJS-graphQL-ecommerce-backend-app
COPY package.json /home/nodejs/nodeJS-graphQL-ecommerce-backend-app
RUN npm install
COPY . /home/nodejs/nodeJS-graphQL-ecommerce-backend-app
CMD npm start 
EXPOSE 3500

#* docker build -t nodeJS-graphQL-ecommerce-backend-app . 
#* docker run -it -p 3500:3500 nodeJS-graphQL-ecommerce-backend-app
