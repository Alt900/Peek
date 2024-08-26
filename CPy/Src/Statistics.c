#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int size = 0;
float *Array;
float *Normalized;

void SetGlobals(float *NewArray, int NewSize){
    Array = NewArray;
    size = NewSize;
    Normalized = (float *)malloc(size*sizeof(float));
}

void FreeGlobals(){
    free(Normalized);
    free(Array);
}

float Min(){

    float Minimum = Array[0];
    for(int n=0; n<size; n++){
        if(*(Array+n)<Minimum){
            Minimum=*(Array+n);
        }
    }
    return Minimum;
}


float Max(){
    float Maximum = Array[0];
    for(int n=0; n<size; n++){
        if(*(Array+n)>Maximum){
            Maximum=*(Array+n);
        }
    }
    return Maximum;
}

int compare(const void* a, const void* b){
    return (*(int*)a-*(int*)b);
}

float Mean(){
    float sum = 0.0;
    for (int i=0; i<size; i++){
        sum += Array[i];
    }
    return sum/size;
}

float Variance(){
    float sum = 0.0;
    float Cmean = Mean();
    for (int i=0; i<size; i++){
        float diff = Array[i]-Cmean;
        sum += diff*diff;
    }
    return sum/size;
}

float Standard_Deviation(){
    float variance = Variance(Array,size,Mean());
    return sqrt(variance);
}

float Mode(){
    qsort(Array, size, sizeof(int), compare);
    int mode = 0;
    int ModeCount = 0;
    int CurrentCount = 1;
    int CurrentValue = Array[0];
    for(int i=1; i<size; i++){
        if(Array[i]==CurrentValue){
            CurrentCount++;
        } else {
            CurrentValue=Array[i];
            CurrentCount = 1;
        }
        if(CurrentCount>ModeCount){
            ModeCount=CurrentCount;
            mode=CurrentValue;
        }
    }
    return mode;
}

float Median(){
    qsort(Array, size, sizeof(int), compare);
    if(size % 2 != 0){
        return (float)Array[size/2];
    } else {
        return (float)(Array[(size-1)/2]+Array[size/2])/2;
    }
}

float* Logarithmic_Normalization(){
    for (int n=0; n<size; n++){
        *(Normalized+n)=log(*(Array+n));
    }
    return Normalized;
}

float* Z_Score_Normalization(){
    float STD = Standard_Deviation();
    float CMean = Mean();
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-CMean)/STD;
    }
    return Normalized;
}

float* Min_Max_Normalization(){
    float min = Min();
    float max = Max();
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-min)/(max-min);
    }
    return Normalized;
}

float* Difference_Normalization(){
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-*(Array));
    }
    return Normalized;
}