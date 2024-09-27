
import os
import json
from flask import Flask,request,Response, stream_with_context
from flask_cors import CORS

import PyPredict
from PyPredict import API_Interface,ML,QuantumManager,Statistics

#CPython
from CPy_Lib import ReadJSON, CStats, Normalization

app_dir = os.getcwd()
app=Flask(__name__)
CORS(app)

metrics_dispatcher = {
    "Mean": CStats.Mean,
    "Mode": CStats.Mode,
    "Median": CStats.Median,
    "Variance": CStats.Variance,
    "STD": CStats.STD,
    "EMA": CStats.EMA,
    "ATR": CStats.ATR,
    "AMA": CStats.AMA
}

normalization_dispatcher = {
    "Z Score":Normalization.Z_Score,
    "Min Max":Normalization.MinMax,
    "Difference":Normalization.Diff,
    "Logarithmic":Normalization.Logarithm
}

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

@app.route("/DownloadData")
def DownloadData():
    API_Interface.load()
    return {
        "payload": "Download complete",
        "error": None
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
    PyPredict.args["LSTM_Output_Size"]=request.args.get("LSTM_Output_Size",type=int)
    return{
        "payload":"All machine learning parameters are set",
        "error": None
    }

@app.route("/Train_Univar",methods=['GET'])
def TrainUniVar():

    method = request.args.get("NormMethod",type=str)
    ticker = request.args.get("ticker",type=str)
    #variable = request.args.get("variable",type=str)
    method = normalization_dispatcher[method]
    Normalized = method(list(API_Interface.data[ticker]["open"]))

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
    predicted = LSTM.predict(Windowed_Data[0][2])
    return {
        "payload": predicted,
        "error": None
    }

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

@app.route("/Grovers",methods=['GET'])
def Grovers():
    qubits=request.args.get("qubits",type=int)
    algo=QuantumManager.Grovers_Algorithm(qubits)
    results = algo.Call()
    return{
        "payload":results,
        "error":None
    }

@app.route("/QAE",methods=['GET'])
def QAE():
    qubits = request.args.get("qubits",type=int)
    typeof_qae = request.args.get("typeof",type=str)
    probability = request.args.get('probability',type=float)
    algo = QuantumManager.QAE(qubits)
    print(algo.Qubits)
    results = algo.Call(probability,typeof_qae)
    return {
        "payload": results,
        "error": None
    }

@app.route("/FIP",methods=['GET'])
def FIP():
    high = eval(request.args.get("high"))
    low = eval(request.args.get("low"))
    cf = eval(request.args.get("cf"))
    epsilon=request.args.get("epsilon",type=float)
    alpha=request.args.get("alpha",type=float)
    algo = QuantumManager.Fixed_Income_Pricing(low,high,cf,epsilon,alpha)
    results=algo.Call()
    return{
        "payload":results,
        "error":None
    }

@app.route("/FetchJSON",methods=['GET'])
def FetchJSON():
    ticker = f"./MarketData/{request.args.get('ticker')}_data.json"
    JSON_String = ReadJSON.Fetch(ticker)
    Marshalled=json.loads(JSON_String)

    return{ 
        "payload":Marshalled,
        "error":None
    }

@app.route("/Run_ARIMA",methods=['GET'])
def Run_ARIMA():
    order = eval(request.args.get("order"))
    seasonal_order = eval(request.args.get("seasonal_order",type=str))
    trend = request.args.get("trend")
    enforce_stationarity = request.args.get("enforce_stationarity",type=bool)
    enforce_invertibility = request.args.get("enforce_invertibility",type=bool)
    concentrate_scale = request.args.get("concentrate_scale",type=bool)
    trend_offset = request.args.get("trend_offset",type=int)
    validate_specification = request.args.get("validate_specification",type=bool)
    missing = request.args.get("missing")
    frequency = request.args.get("frequency")
    ticker = request.args.get("ticker",type=str)#add dropdown
    dependent_variable=request.args.get("dependent",type=str)#add dropdown
    independent_variable = request.args.get("independent",type=str)#add dropdown
    independent_set = API_Interface.data[ticker][independent_variable]
    dependent_set = API_Interface.data[ticker][dependent_variable]


    obj = Statistics.Regression_Models(dependent_set,independent_set)
    result = obj.ARIMA(
        order,
        seasonal_order,
        trend,
        enforce_stationarity,
        enforce_invertibility,
        concentrate_scale,
        trend_offset,
        validate_specification,
        missing,
        frequency
    )

    return {
        "payload": "\n\n"+str(result.summary()),
        "error": None
    }

@app.route("/Run_Theta",methods=['GET'])
def Run_Theta():
    period=request.args.get("period",type=str)
    deseasonalize=request.args.get("deseasonalize",type=bool)
    toforecast = request.args.get("toforecast",type=int)#add to react
    use_test=request.args.get("use_test",type=bool)
    method=request.args.get("method",type=str)
    difference=request.args.get("difference",type=bool)
    ticker = request.args.get("ticker",type=str)#add dropdown
    dependent = request.args.get("dependent",type=str)
    independent = request.args.get("independent",type=str)

    dependent_set = API_Interface.data[ticker][dependent]
    independent_set = API_Interface.data[ticker][independent]

    obj = Statistics.Regression_Models(dependent_set,independent_set)

    result = obj.Theta(
        period=period if period=="None" else int(period),
        future_steps=toforecast,
        deseasonalize=deseasonalize,
        use_test=use_test,
        method=method,
        difference=difference
        )

    return {
        "payload": "\n\n"+str(result.summary()),
        "error": None
    }

@app.route("/Run_OLS",methods=['GET'])
def Run_OLS():
    ticker = request.args.get("ticker",type=str)#add dropdown
    dependent_variable=request.args.get("dependent",type=str)#add dropdown
    independent_variable = request.args.get("independent",type=str)#add dropdown
    missing = request.args.get("missing",type=str)
    hasconst = request.args.get("hasconst")

    independent_set = API_Interface.data[ticker][independent_variable]
    dependent_set = API_Interface.data[ticker][dependent_variable]

    obj = Statistics.Regression_Models(dependent_set,independent_set)

    result = obj.Ordinary_least_squares(missing,hasconst)

    return {
        "payload": "\n\n"+result.as_text(),
        "error": None
    }

@app.route("/Run_ClassicLR",methods=['GET'])
def RunClassicLR():
    ticker= request.args.get("ticker",type=str)
    dependent_variable=request.args.get("dependent",type=str)
    independent_variable = request.args.get("independent",type=str)
    independent_set = API_Interface.data[ticker][independent_variable]
    dependent_set = API_Interface.data[ticker][dependent_variable]

    obj = Statistics.Regression_Models(dependent_set,independent_set)
    result = obj.quick_regression()
    return {
        "payload":"\n\n"+str(result),
        "error":None
    }

@app.route("/FetchMetric",methods=['GET'])
def FetchMetric():
    method = request.args.get("method",type=str)
    ticker = request.args.get("ticker",type=str)
    variable = request.args.get("variable",type=str)

    dataset = API_Interface.data[ticker][variable]

    result = metrics_dispatcher[method](dataset)

    return {
        "payload": result,
        "error": None
    }

if __name__=="__main__":
    app.run(debug=True, threaded=True, ssl_context=('Peek.crt','Peek.key'))