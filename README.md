# Peek a browser-based GUI
![logo](react_gui/public/logo.png)


## What is the goal of this project?
The goal of Peek is to provide an upgraded experience to using the Alpaca API seemlessly through a dashboard-style interface.
Alpaca's native dashboard is a great tool for performing market analysis with classical metrics like market indicators, however I felt the dashboard lacked some tools that are just as valuable in the real of machine learning and statistics as a whole with some added experimental tools from quantum computing. As of now there is not a whole lot that can be done with the GUI itself right now. Only consisting of a univariate LSTM, 4 linear regression model's, an interface with the Alpaca API, a line chart for displaying downloaded JSON data from the Alpaca API, a OpenQASM 2.0 editor, 3 quantum algorithms, and  a quantum circuit display from Qiskit. As the project develops it will eventually evolve into a full dashboard with multiple machine learning models, statistical measures, tests, diagnostics, and linear regression models, interactive data display and interface, and a practical quantum finance environment.

## Prerequisites
Since this project is built out of Python and React using Node, you are going to need `Python 3.1.5` and `Node.js v22.5.1` installed to continue. There are also external dependencies that need to be installed on both sides:

For Python:

* `Torch 2.2.2+cu118`
* `statsmodels 0.14.0`
* `numpy 1.24.3`
* `pandas 1.5.3`
* `matplotlib 3.7.1`
* `qiskit 0.45.0`
* `qiskit_algorithms 0.3.0`
* `qiskit_finance 0.4.1`
* `alpaca 0.8.2`

For Node:

* `react ^18.3.1`
* `react-calendar ^5.0.0`
* `react-dropdown ^1.11.0`

## How do I operate the dashboard?
Its pretty straight-forward, the only consideration that needs to be made before jumping into using the different tools available is making sure the data is loaded. In the data tab you are going to need an Alpaca API key and secret pair and paste them into the corresponding input boxes. From here either you can add more tickers to the input list to the right or continue to the calendar selection and choose a start and end download date then download the selected tickers. After the download is complete you can mess around with any of the other functions across the rest of the GUI.