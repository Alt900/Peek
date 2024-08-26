#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <windows.h>

int size = 0;
float *Array;
float *Normalized;
float **Matrix;

//element-wise exponentiate
DWORD WINAPI __EWE_DIVISION(float* PTA){
    for (int i=0; i<sizeof(PTA); i++){//fix sizeof pta
        *(PTA+i) = exp(*(PTA+i));
    }
    return 0;
}

void** EWE(float** DataFrame, int* Shape){
    int Columns = Shape[0];
    int Rows = Shape[1];

    HANDLE* threads = (HANDLE*)malloc(Columns*sizeof(HANDLE));
    int* ThreadNumber = (int*)malloc(Columns*sizeof(int));

    if (threads == NULL || ThreadNumber == NULL){
        printf("Failed to allocate memory for multithreading");
    }

    for (int i = 0; i<Columns; i++){
        ThreadNumber[i]=i+1;
        threads[i]=CreateThread(
            NULL,
            0,
            __EWE_DIVISION,
            DataFrame[i],//pass the pointer of the sub-array
            0,
            NULL
        );
        if (threads[i] == NULL){
            printf("Failed to create thread for column %d\n",i+1);
            for (int j = 0; j<i; j++){
                CloseHandle(threads[j]);
            }
            free(threads);
            free(ThreadNumber);
        }
    }

    WaitForMultipleObjects(Columns, threads, TRUE, INFINITE);

    for (int i = 0; i<ThreadNumber; i++){
        CloseHandle(threads[i]);
    }
    free(threads);
    free(ThreadNumber);
    **(DataFrame) = **(Matrix);
}

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

void* Logarithmic_Normalization(){
    for (int n=0; n<size; n++){
        *(Normalized+n)=log(*(Array+n));
    }
}

void* Z_Score_Normalization(){
    float STD = Standard_Deviation();
    float CMean = Mean();
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-CMean)/STD;
    }
}

void* Min_Max_Normalization(){
    float min = Min();
    float max = Max();
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-min)/(max-min);
    }
}

void* Difference_Normalization(){
    for (int n=0; n<size; n++){
        *(Normalized+n)=(*(Array+n)-*(Array));
    }
}