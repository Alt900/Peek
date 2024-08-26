from flask import Flask
from flask_cors import CORS
from PyPredict import API_Interface
from PyPredict.API_Interface import data
from PyPredict import Graphics

import os
import json
import ctypes

yeah=ctypes.CDLL(os.getcwd()+"\\CPy\\Statistics.dll")

def DoINeedAHand(column,totalsize):
    if totalsize >= 10000:
        SetGlobals = yeah.SetGlobals
        SetGlobals.restype=ctypes.c_void_p
        SetGlobals.argtypes=[ctypes.Array,ctypes.c_int]
        Clist=(ctypes.c_float*totalsize)(*column)
        SetGlobals(Clist,totalsize)

        STD = yeah.Median
        STD.restype=ctypes.c_float
        STD.argtypes=[]

        return STD()
    else:
        return "nah"

def Generate_Graph_Src():
    json_formatted = {"Graphs": []}
    for x in os.listdir(app_dir+"\\react_gui\\public\\Assets\\Graphs"):
        if x.endswith(".png"):
            json_formatted["Graphs"].append({
                "src":f"/Assets/Graphs/{x}",
                "alt":x
            })
    json_formatted = json.dumps(json_formatted, indent=4)
    with open(f"{app_dir}\\react_gui\\src\\Graph_Src.json","w",encoding='utf-8') as F:
        F.write(json_formatted)

    return json_formatted

app = Flask(__name__)
app_dir = os.getcwd()
CORS(app)

@app.route("/Test_C_Code")
def Test_C_Code():
    column = data["NVDA"]["open"].values
    size=len(column)
    return {
        "payload": DoINeedAHand(list(column),size),
        "error": None
    }

@app.route("/Get_Graphs")
def Get_Graphs():
    return {
        "payload" : Generate_Graph_Src(),
        "error" : None
    }

@app.route("/Generate_New_Graphs")
def Generate_New_Graphs():
    Graphics.graph_df(data)
    Generate_Graph_Src()
    return {
        "payload" : "done",
        "error" : None
    }

@app.route("/Download_New_Tickers")
def Download_New_Tickers():
    API_Interface.load()
    return {
        "payload" : "done",
        "error" : None
    }

@app.route("/Train_Univariate")
def Train_Univariate():
    return {
        "payload": "Sent",
        "error": None
    }

if __name__=='__main__':
    #API_Interface.load()
    app.run(debug=False,ssl_context=('cert.pem', 'key.pem'))