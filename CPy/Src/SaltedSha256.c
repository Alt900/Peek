#include <stdio.h.>
#include <string.h>
#include <openssl/sha.h>

char *Salted;
char *Hex;
char Generate_Hash(char *str, char *Quantumsalt){
    int strsize = strlen(str)+strlen(Quantumsalt);
    Salted = (char*) malloc(strsize);
    Hex = (char*) malloc(strsize);

    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, str, strlen(str));
    SHA256_Final(hash, &sha256);

    for (int i = 0; i<SHA256_DIGEST_LENGTH; i++){
        Hex[i]="%02x"
    }

    return Hex
}