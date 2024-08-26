import ctypes
import os
import numpy as np

filesystem="\\" if os.name=="nt" else "/"

def CompileCode(filename):
    source = os.getcwd()+f"{filesystem}Src{filesystem}{filename}"
    os.system(f"{os.getcwd()}\\CraftDLL.bat {source} {source.split('.')[0]}" if filesystem=="\\" else f"{os.getcwd()}/CraftDLL.bash {source}")

CompileCode("Statistics.c")

DLLs=[
    f".{filesystem}Src{filesystem}Statistics.dll"
]

loaded_dlls={}

for file in DLLs:
    loaded_dlls[file]=ctypes.CDLL(file)

    
Matrix = np.random.rand(100000,7)

stats=loaded_dlls[f".{filesystem}Src{filesystem}Statistics.dll"]

Array_Pointer = ctypes.POINTER(ctypes.c_float).in_dll(stats,"Array")
AOP = ctypes.POINTER(ctypes.POINTER(ctypes.c_float)).in_dll(stats,"Matrix")


CRow=(ctypes.c_float*Matrix.shape[0])(*Matrix)
CColumn = (ctypes.c_float*Matrix.shape[1])(*Matrix)

Initialization = stats.SetGlobals
Initialization.restype = ctypes.c_void_p
Initialization.argtypes=[ctypes.Array,ctypes.c_int]
Initialization(Clist,len(L))

EWE = stats.EWE
EWE.restype = ctypes.c_void_p
EWE.argtypes = [ctypes.Array]