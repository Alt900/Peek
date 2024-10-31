# Peek Version 0.1.2
# Change Log

- ## Machine Learning
- Changed the machine learning dash to render components dynamically based on a dropdown of choices for machine learning architectures (currently only OHLC multivariate LSTM)

- ## Data Handling
- Switched API's from Alpaca to Yahoo
- Merged multivariate and univariate windowing and splitting into a general function capable of handling both.
- Removed LSTM_Preprocessing object
- Added a candlestick chart for OHLC data with scrollable and scalable X and Y. axes 

- ## Utils
- Changed the `FetchRoute` function to instead accept only the route URL itself rather than accepting the dispatcher, indexing the requested route, and adding overhead to the function args. 
- Added Univariate, Multivariate, and OHLC candlestick charts completely based on `CanvasRenderingContext2D` for performance purposes.

- ## Networking
- Fixed CORS by adding `http;127.0.0.1:5000` to proxy and routing requests as `/route?args` instead of `http:127.0.0.1:5000/route?args`

- ## Python
- Removed arg dict, arguments are passed directly into classes/methods
- Removed CORS from Flask


- ## Ease-of-use
- No longer need to add security exceptions with certificates from Flask
- No Alpaca account is required to use the dashboard 