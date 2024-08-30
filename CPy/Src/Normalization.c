#include <math.h>
#include <stdlib.h>

long *Array;
int size;
int row_count;

void *FlattenMatrix(long **Matrix){
    Array = (long*)malloc(row_count*size*sizeof(long));
    int row = 0;
    int column = 0;
    for (int i = 0; i < size*row_count; i++){
        Array[i]=Matrix[row][column];
        column++;
        if(i%size==0){
            row++;
            column=0;
        }
    }
}

//prerequisite functions used by normalization methods

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

void* Logarithmic_Normalization(){
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
        *(Array+n)=(*(Array+n)-*(Array));
    }
}