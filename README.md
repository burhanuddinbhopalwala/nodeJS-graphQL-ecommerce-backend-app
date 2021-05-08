#nodeJS #ecommerceBackend #graphQL #RESTful #redis #amazonS3 #messagingQueues #bestPractices #scalableArchitecture #testCases #travis

# Ecommerce backend (nodeJS + grapgQL)

This project consists of entire backend set of RESTful API's, that are required for an Ecommerce. Below are the details implementation functionalities that has been implemented by leveraging nodeJS and graphQL.

## Implementation includes:

- graphQL implementation for all product APIs

- Service integrations of: redis (for api responses, with write-through cache invalidation strategy), amazonS3 (for product images), messagingQueues (producer-consumer, for order processing to ERP)

- Authentication (JWT/ Bearer scheme) + Advanced Authentication (reset password etc.)

- Order pipelines core functionalities

- Payment/ Payment line handling (Strip, with your private key)

- Email integration using Sendgrid

- Pagination for all the major GET API's

- Error handling using express at it's the best way

- Advanced server-side validators handling for all the Non-GET API's

- Optimized code + Best practices (every line) + Scalable architecture/ structure

- Security by using nodeJS HELMET security headers

- Logging using MORGAN, for all the requests

- Unit test cases for functional testing

- CI using Travis CI
  ![ScreenShot](/data/travis/build-2019-06-01.png)

## Getting started

1: Install [nodeJS + npm](https://nodejs.org/en/download/) first

2: Clone the repo, to get the project code

3: Run `npm install` by going onto the project root directory

4: Connect with your local [mySQL](https://dev.mysql.com/downloads/) database

5: Run `npm start` for starting the server

## Usage

Find entire backend API WSDL (total 25 REST + 5 REST With graphQL) [Postman](https://bit.ly/2MPEq2L)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

## Authors

- **Burhanuddin Bhopalwala** - _Initial work_ - [GitHub](https://github.com/burhanuddinbhopalwala)

## Acknowledgments

- https://bit.ly/2FeFYgT
- https://bit.ly/2WKXfZS
- https://flaviocopes.com/express-validate-input/

## License

[MIT](https://choosealicense.com/licenses/mit/)
