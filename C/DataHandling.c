#include <math.h>
#include <stdlib.h>
#include <string.h>

#define SIZEOF_DOUBLE (sizeof(double))

double *Array;
int size;

double*** Windowed_Matrix;
double** Windowed_Labels;
int Row = 0;
int Windowsize;


void Calc_Matrix_Shape(){
    Row = size/Windowsize;
    double intpart;
    float remainder = modf(Row,&intpart);
    float padding = 0;
    if(remainder!=0.0){
        for (int x = size; x<size+Windowsize; x++){
            if (size%Windowsize==0){
                padding=x;
                break;
            }
        }
    }
    Row = size/(Windowsize+padding);
}

void Window_Array(){
    *Windowed_Matrix=(double**)malloc(Row*sizeof(double*));
    *Windowed_Labels=(double*)malloc(Row*sizeof(double));

    for (int i = 0; i<Row; i++){
        (*Windowed_Matrix)[i]=(double*)malloc(Windowsize*sizeof(double));
        memcpy((*Windowed_Matrix)[i],&Array[i],Windowsize*sizeof(double));//#row i = Array elements from ith to ith+windowsize
        (*Windowed_Labels)[i]=Array[Windowsize+i+1];
    }
}

void *FreeArray(){
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