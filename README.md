# Peek a browser-based GUI
![logo](react_gui/public/logo.png)




## What is the goal of this project?
The goal of Peek is to provide an upgraded experience to using the Alpaca API seamlessly through a dashboard-style interface.
Alpaca's native dashboard is a great tool for performing market analysis with classical metrics like market indicators, however I felt the dashboard lacked some tools that are just as valuable in the realm of machine learning and statistics as a whole with some added experimental tools from quantum computing. As of now there is not a whole lot that can be done with the GUI itself right now. Only consisting of a univariate LSTM, 4 linear regression model's, an interface with the Alpaca API, a line chart for displaying downloaded JSON data from the Alpaca API, a OpenQASM 2.0 editor, 3 quantum algorithms, and  a quantum circuit display from Qiskit. As the project develops it will eventually evolve into a full dashboard with multiple machine learning models, statistical measures, tests, diagnostics, and linear regression models, interactive data display and interface, and a practical quantum finance environment.


## Prerequisites
As previously mentioned this project is an extension of the Alpaca experience so you will need an account with Alpaca and a developer API key/secret pair in order to download and access data. You can get started for free [here](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://app.alpaca.markets/signup&ved=2ahUKEwi71ZGAzOSIAxU-TjABHSP3EzQQFnoECBUQAQ&usg=AOvVaw3KEEvNarSrf7zuOuNYReTL). Since this project is built out of Python and React using Node, you are going to need `Python 3.1.5` and `Node.js v22.5.1` installed to continue alongside their respective package managers, pip and npm. There are also external dependencies that need to be installed on both sides:

## Limitations
Since the API is built out of Flask and is hosted on another port in localhost, you will need to add a security exception to `https:127.0.0.1:5000` where the Flask API is hosted. 

### Brave and Chrome:
* Navigate to `brave://settings/` or `chrome://settings/`
* Search settings for `certificate`
* In security click `Manage certificates`
* In the pop-up certificate manager window click `Import`
* In the certificate import wizard click `next` then `browser`
* Navigate to the directory where peek is installed and click on `Peek.cert`
* Continue through the wizard with default settings and complete the import

### Firefox
* Search settings for `certificate`
* Click `View Certificates...`
* Click `Add Exception...`
* Enter in `https://127.0.0.1:5000`
* Click `Get Certificate`
* Click `Confirm Security Exception` 

### Edge and Opera
* Search settings for `certificate`
* In security click `Manage certificates`
* In the pop-up certificate manager window click `Import`
* In the certificate import wizard click `next` then `browser`
* Navigate to the directory where peek is installed and click on `Peek.cert`
* Continue through the wizard with default settings and complete the import

### Python:
#### (Torches actual version is 2.2.2+cu118)
```
pip3 install Torch 2.2.2`
pip3 install statsmodels 0.14.0
pip3 install numpy 1.24.3
pip3 install pandas 1.5.3
pip3 install matplotlib 3.7.1
pip3 install qiskit 0.45.0
pip3 install qiskit_algorithms 0.3.0
pip3 install qiskit_finance 0.4.1
pip3 install alpaca 0.8.2
```
### Node:
```
npm install react@18.3.1 react-dom@18.3.1
npm install react-calendar@^5.0.0
npm install react-dropdown@^1.11.0
```
## How do I launch the application?
If you are Windows there are two batch files called `StartAPI.bat` and `StartApp.bat`, launch them both and when React is ready it will pop a new tab with the application. If you are on Linux or MAC the three commands to start the app are `python API.py`, `cd ./react_gui`, and `npm start`.


## How do I operate the dashboard?
It's pretty straight-forward, the only consideration that needs to be made before jumping into using the different tools available is making sure the data is loaded. In the data tab you are going to need an Alpaca API key and secret pair and paste them into the corresponding input boxes. From here either you can add more tickers to the input list to the right or continue to the calendar selection and choose a start and end download date then download the selected tickers. After the download is complete you can mess around with any of the other functions across the rest of the GUI.


## There is a bug!!...or I have an idea?
If there are any bugs with the program please leave any screenshots of react runtime errors with a description of the bug and what you had to do to create the bug in a new issue. As for suggestions just write down any ideas you want to see implemented in a new issue. 