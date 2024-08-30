
import os
import json
from flask import Flask,request
from flask_cors import CORS
import PyPredict
from PyPredict import API_Interface
from PyPredict import DataHandler
from PyPredict import ML

app_dir = os.getcwd()
app=Flask(__name__)
CORS(app)

@app.route("/SetDownloadArgs",methods=['GET'])
def SetDownloadArgs():
    PyPredict.args["Alpaca_key"]=request.args.get("Alpaca_key",type=str)
    PyPredict.args["Alpaca_Secret"]=request.args.get("Alpaca_secret",type=str)
    PyPredict.args["Tickers"]=request.args.getlist("Tickers")[0]
    PyPredict.args["from"]=request.args.getlist("from")[0]
    PyPredict.args["to"]=request.args.getlist("to")[0]
    return{
        "payload": "All download parameters are set",
        "error":None
    }

@app.route("/DownloadData",methods=['GET'])
def DownloadData():
    API_Interface.load()
    return{
        "payload":"Completed the data download",
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
    return{
        "payload":"All machine learning parameters are set",
        "error": None
    }

@app.route("/TrainUniVar",methods=['GET'])
def TrainUniVar():
    LSTM = ML.LSTM(
        X=[],
        Y=[],
        cell_count=PyPredict.args["Cell_Count"],
        output_size=PyPredict.args["LSTM_Output_Size"],#add to react
        layers=PyPredict.args["Layers"],#add to react
        filename=f"{PyPredict.args['Targeted_Ticker']}_univariate.pt",
        MTO=True if PyPredict.args["LSTM_Output_Size"]==1 else False,
        Multivariate=False,
        variable_count=None
    )
    LSTM.train()
    LSTM.predict([])

@app.route("/Normalize",methods=["GET"])
def Normalize():

    Method = request.args.get("Method")
    Cnorm = DataHandler.Normalize(
        PyPredict.args["NormalizationMethod"]
    )

if __name__=="__main__":
    app.run(debug=True,ssl_context=('cert.pem', 'key.pem'))
