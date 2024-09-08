from .API_Interface import args,filesystem
from . import torch,os,np,pd,ctypes,args

import statsmodels
from datetime import datetime as dt

window_size = args["Window_Size"]
epochs = args["Epochs"]

device = (
    "cuda"#NVIDIA GPU
    if torch.cuda.is_available()
    else "mps"#AMD GPU
    if torch.backends.mps.is_available()
    else "cpu"
)

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
        "Logarithmic":Lib.Logarithmic_Normalization,
        "Z Score":Lib.Z_Score_Normalization,
        "Min Max":Lib.Min_Max_Normalization,
        "Difference": Lib.Difference_Normalization,
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

class LSTM_Model(torch.nn.Module):
    def __init__(self,
            cell_count=32,
            output_size=1,
            layers=1,
            MTO=False,#many to one, else many to many output
            Multivariate=False,
            variable_count=None
        ):
        self.MTO=MTO
        super().__init__()
        
        self.layers=layers
        self.cell_count=cell_count

        if Multivariate:
            self.LSTM_1=torch.nn.LSTM(variable_count,cell_count,layers,batch_first=True)
        else:
            self.LSTM_1=torch.nn.LSTM(1,cell_count,layers,batch_first=True)
        self.dropout_1=torch.nn.Dropout(p=0.2)
        self.LSTM_2=torch.nn.LSTM(cell_count,cell_count,layers,batch_first=True)
        self.dropout_2=torch.nn.Dropout(p=0.05)
        self.linear=torch.nn.Linear(cell_count,output_size)#change to None,1 for StO and None,window_size,1 for STS

    def forward(self, x):
        batch_size = x.shape[0]

        hidden_state_1 = torch.zeros(self.layers, batch_size, self.cell_count, dtype=torch.float32)
        cell_state_1 = torch.zeros(self.layers, batch_size, self.cell_count, dtype=torch.float32)
        hidden_state_2 = torch.zeros(self.layers, batch_size, self.cell_count, dtype=torch.float32)
        cell_state_2 = torch.zeros(self.layers, batch_size, self.cell_count, dtype=torch.float32)

        hidden_state_1, cell_state_1 = self.LSTM_1(x,(hidden_state_1,cell_state_1))
        hidden_state_1 = self.dropout_1(hidden_state_1)
        hidden_state_2, cell_state_2 = self.LSTM_2(hidden_state_1,(hidden_state_2,cell_state_2))
        hidden_state_2 = self.dropout_2(hidden_state_2)

        output=self.linear(hidden_state_2)
        if self.MTO:
            output=output[:,-1,...]

        return output

class LSTM():
    def __init__(self, X, Y, cell_count=20, output_size=1, layers=1, filename=None, MTO=False, Multivariate=False, variable_count=None):
        
        self.filename=filename

        self.model = LSTM_Model(cell_count=cell_count, output_size=output_size, layers=layers, MTO=MTO, Multivariate=Multivariate, variable_count=variable_count)
        if args["ML"][0]["load_model"]:
            self.model.load_state_dict(torch.load(f"{os.getcwd()}{filesystem}Assets{filesystem}Models{filesystem}{filename}.pt"))
            self.model.eval()

        self.optimizer = torch.optim.Adam(self.model.parameters())
        self.LossFunction = torch.nn.MSELoss()

        self.train_x, self.train_y = torch.from_numpy(X[0]), torch.from_numpy(Y[0])
        self.test_x, self.test_y = torch.from_numpy(X[1]), torch.from_numpy(Y[1])

        self.TrainingLoader = torch.utils.data.DataLoader(
            torch.utils.data.TensorDataset(self.train_x,self.train_y),
            batch_size=args["ML"][0]["batch_size"],
            shuffle=True
        )

    def train(self):
        for epoch in range(epochs):
            for X_train, Y_train in self.TrainingLoader:
                self.model.train()#sets the model training mode for dropout and batch norm layers
                y_predicted = self.model(X_train)#get predicted time step -1 from last linear single-prediction cell
                loss=self.LossFunction(y_predicted, Y_train)#calculate the MSE loss between predicted and real values
                self.optimizer.zero_grad()#initialize the gradient's at zero
                loss.backward()#backpropagate the loss through the network
                self.optimizer.step()#begin optimization

            print(f"epoch - {epoch}\nRMSE loss: {loss}")

            if epoch%100!=0:#if the epoch is 0, the first training iteration, then the gradient will be zerod/initialized for backprop
                continue

            self.model.eval()#sets the model training mode for dropout and batch norm layers

            with torch.no_grad():
                y_predicted = self.model(torch.tensor(self.train_x))#perform a single forward pass on training data
                train_rmse=(torch.sqrt(self.LossFunction(y_predicted,self.train_y)))#root mean squared error for training data
                y_predicted=self.model(self.test_x)#perform a single forward pass on testing data
                test_rmse=(torch.sqrt(self.LossFunction(y_predicted,self.test_y)))#root mean squared error for testing data

            print(f"epoch - {epoch}\nTrain RMSE: {train_rmse}\nTest RMSE: {test_rmse}")

        if args["ML"][0]["save_model"]:
            torch.save(self.model.state_dict(),f"{os.getcwd()}{filesystem}Assets{filesystem}Models{filesystem}{self.filename}")

    def predict(self,x):
        predicted=self.model(torch.tensor(x))
        return predicted.flatten().tolist()
    
class Ensemble_LSTM(torch.nn.Module):
    def __init__(self,model_dispatch,axis_dispatch):
        super(Ensemble_LSTM, self).__init__()
        self.model_dispatch=model_dispatch
        self.XAxis_dispatch=axis_dispatch
        self.output_dispatch={}
        self.VotingResults = torch.nn.Linear(32,len(axis_dispatch))

    def forward(self):
        for x in self.model_dispatch.keys():
            self.output_dispatch[x]=self.model_dispatch[x](self.XAxis_dispatch[x])

        Votes=torch.cat((x for x in self.output_dispatch),dim=1)
        return self.VotingResults(Votes)