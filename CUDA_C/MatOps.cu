#include <stdio.h>
#include <math.h>

__global__ void MatMulKernel(double *A, double *B, double *C, int ACBR, int AR, int BC){
    int r = blockIdx.y * blockDim.y + threadIdx.y;
    int c = blockIdx.x * blockDim.x + threadIdx.x;
    double sum = .0;
    if (r < BC && c < AR){
        for(int i = 0; i<ACBR; i++){
            sum += A[r*ACBR+i]*B[i*ACBR+c];
        }
    }
    C[r*ACBR+c]=sum;
};

//# of matrix A columns === # of matrix b rows 
//ACBR (A Col B Row)
//AR A Row
//BC B Col

double **MatMul(double **A, double **B, int ACBR, int AR, int BC){

    double **Host_A = (double**)malloc(AR*sizeof(double*));
    double *Contig_Block_A = (double*) malloc(AR * ACBR * sizeof(double));
    for (int i = 0; i<AR; i++){
        Host_A[i] = &Contig_Block_A[i*ACBR];
    }

    double **Host_B = (double**)malloc(ACBR*sizeof(double*));
    double *Contig_Block_B = (double*)malloc(ACBR * BC *sizeof(double));
    for(int i = 0; i<ACBR; i++){
        Host_B[i] = &Contig_Block_B[i*BC];
    }

    double **Host_Result = (double**)malloc(AR*sizeof(double*));
    double *Contig_Block_Result = (double*)malloc(AR * BC *sizeof(double));
    for(int i = 0; i<AR; i++){
        Host_Result[i] = &Contig_Block_Result[i*BC];
    }

    double *GPU_A, *GPU_B, *GPU_Result;

    cudaMalloc(&GPU_A,AR*ACBR);
    cudaMalloc(&GPU_B,ACBR*BC);
    cudaMalloc(&GPU_Result,AR*BC);

    cudaMemcpy(GPU_A,Host_A,AR,cudaMemcpyHostToDevice);
    cudaMemcpy(GPU_B,Host_B,ACBR,cudaMemcpyHostToDevice);
    cudaMemcpy(GPU_Result,Host_Result,AR,cudaMemcpyHostToDevice);

    dim3 dimBlock(AR);
    dim3 dimGrid(1,1);

    MatMulKernel<<<dimGrid,dimBlock>>>(GPU_A,GPU_B,GPU_Result,ACBR,AR,BC);

    cudaMemcpy(GPU_Result,Host_Result,AR*BC,cudaMemcpyDeviceToHost);

    cudaFree(GPU_A);
    cudaFree(GPU_B);
    cudaFree(GPU_Result);

    free(Host_A);
    free(Contig_Block_A);
    free(Host_B);
    free(Contig_Block_B);

    return Host_Result;
}

