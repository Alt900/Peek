#include "cJSON.h"
#include <stdio.h>
#include <stdlib.h>

char *Fetch(char *Filename){
    FILE *F = fopen(Filename,"r");
    if (F == NULL){
        return "Could not open the JSON file";
    }
    fseek(F,0,SEEK_END);
    long len = ftell(F);
    rewind(F);

    char *buffer = (char *)malloc(len+1);
    if(buffer==NULL){
        return "Could not allocated the memory required to store the JSON file.";
    }
    fread(buffer,1,len,F);
    buffer[len];
    fclose(F);
    return buffer;
}