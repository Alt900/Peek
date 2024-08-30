#include <math.h>
#include <omp.h>

float **Input;
float **Forget;
float **Output;
float **CellState;
float **Hidden_State;

struct HP {
    //weights
    double *W_i, *W_f, *W_o, *W_c;//input 
    double *H_i, *H_f, *H_o, *H_c;//hidden 
    //bias
    double *B_i, *B_f, *B_o, *B_c;
    //states
    double *C;//cell
    double *H; //hidden
};

struct ShapeInfo {
    int Input;
    int Forget;
    int Output;
    int Cell;
    int Hidden;
};

int batchsize;
int epochs;

struct HP *ptr, HP_I1;
struct ShapeInfo *ptr, SHAPE_I1;
HP_PTR = &HP_I1;
SHAPE_PTR = &SHAPE_I1;

//matrix operations
long **Matmul(long **Zeros, long **A, long **B, int*sizes){
    for (int D1 = 0; D1<sizes[0]; D1++){
        for (int D2 = 0; D2<sizes[3]; D2++){
            Zeros[D1*sizes[0]+D2]=0;
            for(int C1_R2 = 0; C1_R2 < sizes[1]; C1_R2++){
                Zeros[D1*sizes[3]+D2]+=A[D1*sizes[0]+D2][D1*C1_R2+D2]*B[D1*sizes[0]+D2][C1_R2*sizes[3]+D2];
            }
        }
    }
    return Zeros;
}
//activation functions
void Sigmoid(float **Matrix, int D1, int D2){
    #pragma omp parallel for
    for (int i = 0; i<D1; i++){
        for (int j = 0; j<D2; j++){
            #pragma omp critical
            Matrix[i][j]=1/(1+pow(2.71828,-Matrix[i][j]));
        }
    }
}

void** Forward(){
    for (int e = 0; e<epochs; e++){
        for (int ij = 0; ij < SHAPE_PTR->Input; ij++){

        }
    }
}