print("Initializing Python environment...")
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import torch
import json

import matplotlib
from matplotlib.lines import Line2D

matplotlib.use('Agg')

filesystem="\\" if os.name=="nt" else "/"
with open(f"react_gui{filesystem}public{filesystem}Assets{filesystem}Config.json","r") as F:
    args=json.load(F)
plt.style.use(f"react_gui{filesystem}public{filesystem}Assets{filesystem}Matplotlib_style_sheet.mplstyle")
plt.grid()
filesystem="\\" if os.name=="nt" else "/"