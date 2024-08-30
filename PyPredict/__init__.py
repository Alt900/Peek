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
    "Train-Test-Split":(.7,.3),#add to react
    #for data-preprocessing in React add a dropdown 
    #same with normalization linked to C code
    "Train-Test-Validation-Split":(.6,.3,.1),#add to react Machine Learning
    "Targeted_Ticker":"",
    "Targeted_Variable":"",
    "Cell_Count": 10, #add to react Machine Learning
    "to":[],#fix calendar
    "from": [],#fix calendar
    "tickers":[],
    "alpaca_key":"",#add
    "alpaca_secret":"",#add
    "Omit_Cache":False,#add
    "OPENQASM_Script":"OPENQASM 2.0;\ninclude 'qelib1.inc';\ncreg q[4];\ncreg c[4];"
}
print("Initialization complete")