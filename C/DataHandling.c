#include <math.h>
#include <stdlib.h>
#include <string.h>

#define SIZEOF_DOUBLE (sizeof(double))

double *Array;
int size;

double **Windowed_Matrix;
double *Windowed_Labels;
int Row ;
int Windowsize;

double **Generate_Window_Matrix(){
    Windowed_Matrix = (double**)malloc(Row*sizeof(double*));
    for(int i = 0; i<Row; i++){
        Windowed_Matrix[i]=(double*)malloc(Windowsize*SIZEOF_DOUBLE);
        for(int j = 0; j<Windowsize; j++){
            Windowed_Matrix[i][j]=Array[i+j];
        }
    }
    return Windowed_Matrix;
}

double *Generate_Window_Labels(){
    Windowed_Labels = (double*)malloc(Row*SIZEOF_DOUBLE);
    for(int i = 0; i<Row; i++){
        Windowed_Labels[i]=Array[i+Windowsize+1];
    }
    return Windowed_Labels;
}

void FreeAll(){
    free(Windowed_Labels);
    free(Windowed_Labels);
    free(Array);
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
    float variance = Variance();
    return sqrt(variance);
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

//Normalization methods

void Logarithmic_Normalization(){
    for (int n=0; n<size; n++){
        *(Array+n)=log(*(Array+n));
    }
}

//with void *FlattenMatrix, works with 1 and 2 dimensional matrices
void* Z_Score_Normalization(){
    float STD = Standard_Deviation();
    float CMean = Mean();
    for (int n=0; n<size; n++){
        *(Array+n)=(*(Array+n)-CMean)/STD;
    }
}

void* Min_Max_Normalization(){
    float min = Min();
    float max = Max();
    for (int n=0; n<size; n++){
        *(Array+n)=(*(Array+n)-min)/(max-min);
    }
}

void* Difference_Normalization(){
    for (int n=0; n<size; n++){
        *(Array+n)=(*(Array+n)-*(Array+n-1));
    }
}