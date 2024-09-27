import statsmodels
import statsmodels.api as api
from statsmodels.tsa.forecasting.theta import ThetaModel
from statsmodels.tsa.arima.model import ARIMA
from .API_Interface import data
from . import np
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
    
    def Z_Score(self,std,mean,row):
        for x in range(len(row)):
            row[x]=(row[x]-mean)/std

class Regression_Models():
    def __init__(self,dependent, independent):
        self.diagnostics = Diagnostics()
        self.dependent = dependent
        self.independent = independent
        self.quick_regression = lambda : np.poly1d(np.polyfit(dependent.index,dependent.values,1))

    def Ordinary_least_squares(self,missing,hasconst):
        dependent = api.add_constant(self.dependent)
        independent = api.add_constant(self.independent)
        self.model=api.OLS(endog=self.dependent,exog=self.independent,missing=missing,hasconst=hasconst).fit()
        return self.model.summary()
    
    def Theta(self,period,future_steps,deseasonalize,use_test,method,difference):
        if period=="None":
            self.model = ThetaModel(
                self.dependent,
                deseasonalize=deseasonalize,
                use_test=use_test,
                method=method,
                difference=difference
            ).fit()
        else:
            self.model = ThetaModel(
                self.dependent,
                period=period,
                deseasonalize=deseasonalize,
                use_test=use_test,
                method=method,
                difference=difference
            ).fit()
        return self.model
    
    def ARIMA(self,order,seasonal_order,trend,enforce_stationarity,enforce_invertibility,concentrate_scale,trend_offset,validate_specification,missing,frequency):
        
        if frequency=="None":
            self.model = ARIMA(
                self.dependent,
                exog=self.independent,
                order=order,
                seasonal_order=seasonal_order,
                trend=trend,
                enforce_stationarity=enforce_stationarity,
                enforce_invertibility=enforce_invertibility,
                concentrate_scale=concentrate_scale,
                trend_offset=trend_offset,
                validate_specification=validate_specification,
                missing=missing
            )
        else:
            self.model = ARIMA(
                self.dependent,
                exog=self.independent,
                order=order,
                seasonal_order=seasonal_order,
                trend=trend,
                enforce_stationarity=enforce_stationarity,
                enforce_invertibility=enforce_invertibility,
                concentrate_scale=concentrate_scale,
                trend_offset=trend_offset,
                validate_specification=validate_specification,
                missing=missing,
                freq=frequency
            )
        return self.model.fit()

    def __setattr__(self, name: str, value):
        super().__setattr__(name,value)
        if name!="diagnostics":
            setattr(self.diagnostics,name,value)