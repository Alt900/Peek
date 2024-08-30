#include <stdio.h>

long **A;
int A_D1;
int A_D2;

long **B;
int B_D1;
int B_D2;

//int AoB = transpose matrix A or matrix B
void *Transpose(int AoB){//yeet return from call stack, who needs returns anyway
    if (AoB==1){
        for (int D1 = 0; D1 < A_D1; D1++){//
            for (int D2 = 0; D2 < A_D2; D2++){
                A[D1][D2]=A[D2][D1];
            }
        }
    } else {
        for (int D1 = 0; D1 < B_D1; D1++){
            for (int D2 = 0; D2 < B_D2; D2++){
                B[D1][D2] = B[D2][D1];
            }
        }
    }
}

long **Matmul(long **Zeros){
    for (int D1 = 0; D1<A_D1; D1++){
        for (int D2 = 0; D2<B_D2; D2++){
            Zeros[D1*A_D1+D2]=0;
            for(int C1_R2 = 0; C1_R2 < A_D2; C1_R2++){
                Zeros[D1*B_D2+D2]+=A[D1*A_D1+D2][D1*C1_R2+D2]*B[D1*A_D1+D2][C1_R2*B_D2+D2];
            }
        }
    }
    return Zeros;
}