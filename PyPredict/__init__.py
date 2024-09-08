print("Initializing Python environment...")
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import torch
import json
import ctypes

import matplotlib
from matplotlib.lines import Line2D

matplotlib.use('Agg')

filesystem="\\" if os.name=="nt" else "/"
plt.style.use(f"react_gui{filesystem}public{filesystem}Assets{filesystem}Matplotlib_style_sheet.mplstyle")
plt.grid()
filesystem="\\" if os.name=="nt" else "/"

#defined top-level to pass down to the rest
#of the module, React will provide the stateupdates through
#a flask rout refrencing args
args = {
    "Epochs":100,
    "Batch_Size":32,
    "Window_Size":5,
    "Learning_Rate":0.1,
    "Normalization_Method":"Logarithmic",
    "Train-Test-Validation-Split":(.6,.3,.1),
    "Time_Shift":1,#add to react
    "Label_Size": 1,#add to react
    #the label size will be determined by how many variables are selected
    #in a check-box of available variables to window 
    "Targeted_Ticker":"",
    "Targeted_Variable":"",
    "Cell_Count": 10, #add to react Machine Learning
    "to":[],
    "from": [],
    "tickers":[],
    "alpaca_key":"",
    "alpaca_secret":"",
    "Omit_Cache":False,#add
    "OPENQASM_Script":"OPENQASM 2.0;\ninclude 'qelib1.inc';\ncreg q[4];\ncreg c[4];"
}
print("Initialization complete")