
import os
import json
import ctypes
from flask import Flask,request
from flask_cors import CORS

import PyPredict
from PyPredict import API_Interface
from PyPredict import ML
from PyPredict import QuantumManager

app_dir = os.getcwd()
app=Flask(__name__)
CORS(app)
ReadJSON = ctypes.CDLL("./lib/ReadJSON.dll")

@app.route("/SetDownloadArgs",methods=['GET'])
def SetDownloadArgs():
    PyPredict.args["alpaca_key"]=request.args.get("Alpaca_key",type=str)
    PyPredict.args["alpaca_secret"]=request.args.get("Alpaca_secret",type=str)
    tickers = request.args.get("Tickers")
    tickers=[x.replace(" ","") for x in tickers.split(',')]
    PyPredict.args["tickers"]=tickers
    PyPredict.args["from"]=json.loads(request.args.getlist("from")[0])
    PyPredict.args["to"]=json.loads(request.args.getlist("to")[0])
    return{
        "payload": "All download parameters are set",
        "error":None
    }

@app.route("/DownloadData",methods=['GET'])
def DownloadData():
    API_Interface.load()
    return{
        "payload":PyPredict.args["tickers"],
        "error":None
    }

@app.route("/FetchTickerData",methods=['GET'])
def FetchTickerData():
    data=API_Interface.FetchJSON(request.args.get("Ticker",type=str))
    return{
        "payload":data,
        "error":None
    }

@app.route("/SetMLArgs",methods=['GET'])
def SetMLArgs():
    PyPredict.args["Epochs"]=request.args.get("Epochs",type=int)
    PyPredict.args["Batch_Size"]=request.args.get("Batch_Size",type=int)
    PyPredict.args["Window_Size"]=request.args.get("Window_Size",type=int)
    PyPredict.args["Learning_Rate"]=request.args.get("Learning_Rate",type=float)
    PyPredict.args["Train-Test-Split"]=(
        request.args.get("Train_Ratio",type=float),
        request.args.get("Test_Ratio",type=float),
        request.args.get("Validation_Ratio",type=float)
    )
    PyPredict.args["Targeted_Ticker"]=request.args.get("Targeted_Ticker",type=str)
    PyPredict.args["Targeted_Variable"]=request.args.get("Targeted_Variable",type=str)
    PyPredict.args["Cell_Count"]=request.args.get("Cell_Count",type=int)
    PyPredict.args["Normalization_Method"]=request.args.get("Normalization_Method",type=str)
    return{
        "payload":"All machine learning parameters are set",
        "error": None
    }

@app.route("/Train_Univar",methods=['GET'])
def TrainUniVar():

    Normalized = ML.Normalize(
        PyPredict.args["Normalization_Method"],
        Matrix=API_Interface.data[PyPredict.args["Targeted_Ticker"]]
    )

    Splitter = ML.LSTM_Prep(
        ratio=PyPredict.args["Train-Test-Validation-Split"],
        time_shift=PyPredict.args["Time_Shift"],
        label_size=PyPredict.args["Label_Size"]
    )

    Split_Data = Splitter.split(Normalized)

    Windowed_Data = Splitter.window(Split_Data)

    LSTM = ML.LSTM(
        X=Windowed_Data[0],
        Y=Windowed_Data[1],
        cell_count=PyPredict.args["Cell_Count"],
        output_size=PyPredict.args["LSTM_Output_Size"],
        layers=PyPredict.args["Layers"],
        filename=f"{PyPredict.args['Targeted_Ticker']}_univariate.pt",
        MTO=True if PyPredict.args["LSTM_Output_Size"]==1 else False,
        Multivariate=False,
        variable_count=None
    )
    LSTM.train()
    LSTM.predict(Windowed_Data[0][2])

@app.route("/Run_QASM",methods=['GET'])
def Run_QASM():
    results = QuantumManager.RunCircuit(
        None,
        True,
        True,
        request.args.get("Script")
    )
    return{
        "payload": results,
        "error": None
    }

@app.route("/Run_Grovers",methods=['GET'])
def Run_Grovers():
    FA = QuantumManager.Financial_Algorithms(Qubits=6)
    FA.Grovers()
    results = QuantumManager.RunCircuit(
        FA.Circuit,
        True
    )
    return{
        "payload":results,
        "error":None
    }

@app.route("/FetchJSON",methods=['GET'])
def FetchJSON():
    ticker = (f"./MarketData/{request.args.get('ticker')}_data.json").encode('utf-8')
    get = ReadJSON.Fetch
    get.argtypes = [ctypes.c_char_p]
    get.restype = ctypes.c_char_p
    JSON_String = get(ticker)
    Marshalled=json.loads(JSON_String.decode("utf-8"))

    return{ 
        "payload":Marshalled,
        "error":None
    }

@app.route("/QAE",methods=['GET'])
def QAE():
    QAE_Type=request.args.get("type",type=str)
    Qubits=request.args.get("Qubits",type=int)
    Probability=request.args.get("Probability",type=float)
    QAE_Args=request.args.get("Args")
    QAE_Args=[x.replace(" ","") for x in QAE_Args.split(',')]
    FA = QuantumManager.Financial_Algorithms(Qubits)
    results = FA.QAE(probability=Probability,QAE_Type=QAE_Type,args=QAE_Args)
    return {
        "payload":results,
        "error":None
    }

@app.route("/TestCWindow",methods=['GET'])
def TestCWindow():
    API_Interface.load()
    Prep=ML.LSTM_Prep(API_Interface.data["LMT"]["open"])
    SplitSet=Prep.split(API_Interface.data["LMT"]["open"])
    WindowedSet=Prep.window(SplitSet=SplitSet)
    return{
        "payload":WindowedSet,
        "error":None
    }

if __name__=="__main__":
    app.run(debug=True, ssl_context=('Peek.crt','Peek.key'))