#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

#define MAX2(a,b) ((a)>(b)?(a):(b))
#define MAX3(a,b,c) (MAX2(MAX2(a,b),c))

//vars

int size;
double *Results;

struct OHLC {
    double *O;
    double *H;
    double *L;
    double *C;
};

struct OHLC *OHLC_PTR,OHLC_Struct;
OHLC_PTR=&OHLC_Struct;

//util funcs

double* GetArrayPointer(int Index){
    return (double*)((char*)&OHLC_Struct+(Index==0?0:sizeof(double)*Index));
}

void InitializeOHLC(double *ArrayPointer, double *NewArray){
    if (ArrayPointer!=NULL){
        free(ArrayPointer);
    }
    ArrayPointer = (double*) calloc(size,sizeof(double));
    memcpy(ArrayPointer,NewArray,size);
}

void FreeOHLC(double *ArrayPointer){
    free(ArrayPointer);
}

int compare(const void* a, const void* b){
    return (*(int*)a-*(int*)b);
}


//central tendancy

double Mean(double *ArrayPointer){
    double sum = .0;
    for (int i=0; i<size; i++){
        sum += ArrayPointer[i];
    }
    return sum/size;
}

double Mode(double *ArrayPointer){
    qsort(ArrayPointer, size, sizeof(int), compare);
    double mode = .0;
    int ModeCount = 0;
    int CurrentCount = 1;
    int CurrentValue = ArrayPointer[0];
    for(int i=1; i<size; i++){
        if(ArrayPointer[i]==CurrentValue){
            CurrentCount++;
        } else {
            CurrentValue=ArrayPointer[i];
            CurrentCount = 1;
        }
        if(CurrentCount>ModeCount){
            ModeCount=CurrentCount;
            mode=CurrentValue;
        }
    }
    return mode;
}

float Median(double *ArrayPointer){
    qsort(ArrayPointer, size, sizeof(int), compare);
    if(size % 2 != 0){
        return (float)ArrayPointer[size/2];
    } else {
        return (float)(ArrayPointer[(size-1)/2]+ArrayPointer[size/2])/2;
    }
}

//dispersion measurements

float Standard_Deviation(){
    float variance = Variance();
    return sqrt(variance);
}

//Moving averages 

void EMA(float Smoothing, double *ArrayPointer){
    double EMA_Today = .0;
    double EMA_Yesterday = .0;
    for (int i = 0; i<size; i++){
        EMA_Today = (ArrayPointer[i]*(Smoothing/1+size)) + (EMA_Yesterday*(1-(Smoothing/1+size)));
        EMA_Yesterday = EMA_Today;
        *(Results+i)=EMA_Today;
    }
}

//technical indicators

double ATR(){
    double sum = .0;
    for (int i = 0; i<size; i++){
        double TR=MAX3(
            OHLC_PTR -> O[i]- OHLC_PTR -> L[i],
            abs(
                OHLC_PTR -> H[i] - OHLC_PTR -> C[i-1]
            ),
            abs(
                OHLC_PTR -> L[i] - OHLC_PTR -> C[i-1]
            )
        );
        sum+=TR;
    }
    return (1/size)*sum;
}

double AMA(float Smoothing, double*ArrayPointer, int Nth_Lookback){
    double Efficiency_Ratio = .0;
    double Volatility = .0;
    double Direction = .0;
    float Fast = Smoothing/(Smoothing+1);
    float Slow = Smoothing/(size+1);
    float SC = .0;

    double EMA_Today = .0;
    double EMA_Yesterday = .0;
    Results[0] = ArrayPointer[0];

    for (int i = 0; i<size-1; i++){
        //calculate the exponential moving average
        EMA_Today = (Smoothing/size+1)*(ArrayPointer[i]-EMA_Yesterday)+EMA_Yesterday;
        EMA_Yesterday=EMA_Today;

        //find the smoothing constant
        Volatility = abs(ArrayPointer[i]-ArrayPointer[i-1]);
        Direction = ArrayPointer[i]-ArrayPointer[i-Nth_Lookback];
        Efficiency_Ratio = abs(Direction/Volatility);
        SC = pow(Efficiency_Ratio*(Fast-Slow)+Slow,2);

        //push results
        Results[i] = SC*(ArrayPointer[i]-Results[i-1])+Results[i-1];
    }
}