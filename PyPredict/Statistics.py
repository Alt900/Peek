import statsmodels
import statsmodels.api as api
from statsmodels.tsa.forecasting.theta import ThetaModel
from statsmodels.tsa.arima.model import ARIMA
from .API_Interface import data
from . import np

class Standard_Measurements():
    def __init__(self,ticker,variable):
        self.ticker=ticker
        self.variable=variable

    def Central_Tendacy(self):
        return [
            data[self.ticker][self.variable].mean(),
            data[self.ticker][self.variable].median(),
            data[self.ticker][self.variable].mode()[0],]
                
    def standard_deviation(self):
        return data[self.ticker][self.variable].std()
    
class Diagnostics():

    def __init__(self):
        self.heteroskedasticity_tests={
            "whites": lambda resid,dependent : statsmodels.stats.diagnostic.het_white(resid, dependent),
            "breusch-pagan": lambda resid, dependent : statsmodels.stats.diagnostic.het_breuschpagan(resid, dependent),
            "goldfeld-quandt": lambda independent, dependent : statsmodels.stats.diagnostic.het_goldfeldquandt(independent,dependent)
        }

    def null_hypothesis(self,pvalue):
        if hasattr(self,"pval_threshold")==False:
            print("pval_threshold is not defined, a regression model instantizing the value needs to be called first.")
            return None
        if pvalue>self.pval_threshold:
            print(f"Null hypothesis accepted, p-value is {pvalue-self.pval_threshold} greater than the threshold.")
            print("Data has no correlation")
            self.null_hypothesis=False#if the data shares relation this will be useful for forming alternative hypothesis H1
        else:
            print(f"Null hypothesis rejected, p-value is {self.pval_threshold-pvalue} less than the threshold.")
            self.null_hypothesis=True

    def diagnose_heteroskedasticity(self,test:str):
        return self.heteroskedasticity_tests[test.lower()]

class Regression_Models():
    def __init__(self,dependent, independent):
        self.diagnostics = Diagnostics()
        self.dependent = dependent
        self.independent = independent
        self.quick_regression = lambda : np.poly1d(np.polyfit(dependent.index,dependent.values,1))

    def Ordinary_least_squares(self,pval_threshold):
        self.pval_threshold = pval_threshold
        independent=api.add_constant(self.independent)
        self.model=api.OLS(self.dependent,exog=independent).fit()
        print(dir(self.model))
    
    def Theta(self,period,future_steps):
        self.model = ThetaModel(self.dependent,period=period).fit()
        self.forecast = self.model.forecast(future_steps)
    
    def ARIMA(self,pdq):
        self.model = ARIMA(self.dependent,exog=self.independent,order=pdq).fit()

    def __setattr__(self, name: str, value):
        super().__setattr__(name,value)
        if name!="diagnostics":
            setattr(self.diagnostics,name,value)

class Technical_Indicators():
    def __init__(self,time_series):
        self.time_series=time_series

    def EWMA(self,variable,window_size):
        weights = np.exp(np.linspace(-1.,0.,window_size))
        weights /= weights.sum()
        convolution = np.convolve(variable,weights,mode='full')[:len(variable)]
        convolution[:window_size] = convolution[window_size]
        return convolution

    def ATR(self):
        length=len(self.time_series.index)
        TR=[0]

        for n in range(1,length):
            TR.append(max([
                self.time_series["high"][n]-self.time_series["low"][n],
                abs(self.time_series["high"][n]-self.time_series["close"][n-1]),
                abs(self.time_series["low"][n]-self.time_series["close"][n-1])
            ]))

        return self.EWMA(TR,14)
    
    def product(self,x):
        sub_x, sub_y = self.time_series.index, self.time_series.values
        n=len(sub_x)
        datapoint = 0
        print(f"interpolating datapoint {x}")
        matrix=np.zeros((n,n),dtype=float)
        for i in range(n):
            term = sub_y[i]
            for j in range(n):
                if j!=i:
                    if j!=1:
                        matrix[i][j] = matrix[i][j-1]*(x-sub_x[j])/(sub_x[i]-sub_x[j])
                    else:
                        matrix[i][j] = term*(x-sub_x[j])/(sub_x[i]-sub_x[j])
                else:
                    matrix[i][j]=1
            datapoint += term
        return sum(sum(matrix))

    def Lagrange_Interpolation(self,to_interpolate):
        interpolated_set=[]
        for x in to_interpolate:
            interpolated_set.append(self.product(x))

        return interpolated_set

        