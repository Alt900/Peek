from . import np, pd, ctypes, args
from . import torch
import statsmodels
from datetime import datetime as dt

def dt_to_int(dtcolumn):
    return [
        int(dt.strptime(str(x)[:19],'%Y-%m-%d %H:%M:%S').timestamp()) for x in dtcolumn
    ]

def int_to_dt(dtcolumn):
    return [
        dt.fromtimestamp(x) for x in dtcolumn
    ]

windowsize=args["Window_Size"]

class LSTM_Prep():
    def __init__(self,
        ratio=(.7,.3),
        time_shift=1,
        label_size=1
        ):
        
        self.ratio=ratio
        self.time_shift = time_shift
        self.label_size = label_size

    def split(self,df):
        n=len(df)
        s_i=0
        result=[]
        for x in self.ratio:
            RtoI=int(n*x) #ratio to index location
            result.append(df[s_i:s_i+RtoI])
            s_i+=RtoI #adds the previously calculated index location as a starting point for the next
        return result

    def window(self,SplitSet):
        Windowed=[]
        print(type(SplitSet))
        for x in range(len(SplitSet.index)):
            size=len(SplitSet[x])
            indexes=[]
            labels=[]
            initial_rows=int((size-windowsize)/self.time_shift)
            indexes = [y for y in range(0,size,self.time_shift)]

            indexes=indexes[0:initial_rows]#filters out non-valid windows
            matrix=np.zeros((len(indexes)-1,windowsize))

            for y in range(len(indexes)):
                try:
                    labels.append([SplitSet[x][indexes[y]+windowsize+self.label_size]])#a label needs to be present in order to complete the set
                    matrix[y]=SplitSet[x][indexes[y]:indexes[y]+windowsize]
                except IndexError:#if one cannot be grabbed due to the index being out of bounds the windowed set will be dropped
                    pass

            Windowed.append([matrix[:,:,np.newaxis],np.array(labels)[:,np.newaxis]])

        Windowed_x=[Windowed[0][0].astype(np.float32),Windowed[1][0].astype(np.float32)]
        Windowed_y=[Windowed[0][1].astype(np.float32),Windowed[1][1].astype(np.float32)]
        return Windowed_x,Windowed_y
    
    def multivariate_window(self,SplitFrame):
        #Split Matrix needs to be size (len(set)-1,variables)
        #Windowed Matrix needs to be size (len(set)-1,window_size,variables)
        #Split Tensor passes size len(ratio)
        #Windowed Tensor passes size [len(ratio),(len(set)-1,window_size,variables)] 4D tensor
        Windowed_Matrix=[]
        for y in SplitFrame[0].keys():
            Windowed_Matrix.append(self.window([SplitFrame[x][y] for x in range(len(SplitFrame))]))
        return Windowed_Matrix

class Feature_Engineering():
    def __init__(self,
        time_series:pd.DataFrame,
        min:float,
        max:float
        ):
        self.torched_series=torch.Tensor(time_series)
        self.time_series=time_series
        self.min = min
        self.max = max

    def seasonal_decompose(self,period=5):
        return statsmodels.tsa.seasonal.seasonal_decompose(self.time_series,model="additive",period=period)

    def standard_clip(self):
        return torch.clamp(self.torched_series,self.min,self.max)
    
    def MAD(self,threshold):
        median = np.median(self.time_series)
        mad = np.median(abs(self.time_series-median))
        lower_cut = median-threshold*mad
        upper_cut = median+threshold*mad
        return torch.clamp(torch.Tensor(self.time_series),min=lower_cut,max=upper_cut)
    
    def difference(self):
        return self.time_series.diff().fillna(0)
    
#normalization is handled by C
def Normalize(Method,Array=None,Matrix=None):
    Lib = ctypes.CDLL('./Lib/Normalization.dll')
    dispatcher = {
        "Logarithmic_Normalization":Lib.Logarithmic_Normalization,
        "Z_Score_Normalization":Lib.Z_Score_Normalization,
        "Min_Max_Normalization":Lib.Min_Max_Normalization,
        "Difference_Normalization": Lib.Difference_Normalization,
    }
    Function=dispatcher[Method]
    if Array!=None and Matrix==None:
        Lib.Array=CArray
        Lib.size=len(Array)
        CArray = Array.ctypes.data_as(
            ctypes.POINTER(ctypes.c_long)
        )

    if Matrix!=None and Array==None:
        row_count=Matrix.shape[0]
        size=Matrix.shape[1]
        Lib.size=size
        Lib.row_count=row_count
        Lib.FlattenMatrix(
            Matrix.ctypes.data_as(
                ctypes.POINTER(
                    ctypes.POINTER(ctypes.c_long)
                )
            )
        )#automatically sets Array

    Function()#void, sets array
    return np.ndarray(
        (Lib.size,),'f',Lib.Array,'C'
    )