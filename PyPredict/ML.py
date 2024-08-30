from .API_Interface import args,filesystem
from . import torch,os,np
import ctypes

window_size = args["Window_Size"]
epochs = args["Epochs"]

device = (
    "cuda"#NVIDIA GPU
    if torch.cuda.is_available()
    else "mps"#AMD GPU
    if torch.backends.mps.is_available()
    else "cpu"
)

##add a class of model diagnostic tools that includes:
#f1 score for comparing different models with different configurations on the same dataset
#

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