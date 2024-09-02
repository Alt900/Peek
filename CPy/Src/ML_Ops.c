long *FlattenMatrix(long **Matrix){
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
    return Array;
}

long **Transpose(long **Matrix, int D1, int D2){
    for (int i = 0; i < D1; i++){//
        for (int j = 0; j < D2; j++){
            Matrix[i][j]=Matrix[j][i];
        }
    }
    return Matrix;
}