
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

@app.route("/SetDownloadArgs",methods=['GET'])
def SetDownloadArgs():
    PyPredict.args["alpaca_key"]=request.args.get("Alpaca_key",type=str)
    PyPredict.args["alpaca_secret"]=request.args.get("Alpaca_secret",type=str)
    tickers = request.args.get("Tickers")
    tickers=[x.replace(" ","") for x in tickers.split(',')]
    print(tickers)
    print(type(tickers))
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
    OBJ = QuantumManager.Financial_Algorithms(Qubits=6)
    OBJ.Grovers()
    results = QuantumManager.RunCircuit(
        OBJ.Circuit,
        True
    )
    return{
        "payload":results,
        "error":None
    }

@app.route("/FetchJSON",methods=['GET'])
def FetchJSON():

    #read JSON files
    ticker = (request.args.get("ticker")+"_data.json").encode('utf-8')
    lib = ctypes.CDLL("./lib/ReadJSON.dll")
    get = lib.Fetch
    get.argtypes = [ctypes.c_char_p]
    get.restype = ctypes.c_char_p
    JSON_String = get(ticker)
    Marshalled=json.loads(JSON_String.decode("utf-8"))
    Open = PyPredict.np.array([x["open"] for x in Marshalled],dtype=PyPredict.np.float64)
    lib = ctypes.CDLL("./lib/MA_Models.dll")
    carray = Open.ctypes.data_as(
        ctypes.POINTER(ctypes.c_double)
    )


    #moving average 
    lib = ctypes.CDLL("./lib/Statistics.dll")
    ptr = lib.GetArrayPointer
    ptr.argtypes = [ctypes.c_int]
    ptr.restype = ctypes.POINTER(ctypes.c_double)
    open_pointer = ptr(0)
    Initializer = lib.InitializeOHLC
    Initializer.argtypes = [ctypes.POINTER(ctypes.c_double),ctypes.POINTER(ctypes.c_double)]
    Initializer(
        open_pointer,
        carray
    )
    ATR = lib.ATR
    ATR.restype=ctypes.c_double
    return{ 
        "payload":ATR(),
        "error":None
    }

if __name__=="__main__":
    app.run(debug=True,ssl_context=('cert.pem', 'key.pem'))