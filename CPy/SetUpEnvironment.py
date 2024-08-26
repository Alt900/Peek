import os

filesystem="\\" if os.name=="nt" else "/"

if not os.path.isdir(os.getcwd()+f"{filesystem}Src"):
    os.mkdir(os.getcwd()+f"{filesystem}Src")
    print("Created Src directory.")

if filesystem=="\\":#windows batch file
    with open("CraftDLL.bat","w",encoding='utf-8') as F:
        print(os.getcwd())
        F.write(f"x86_64-w64-mingw32-gcc -shared -O3 -o %2.dll %1")
else:#Linux bash file
    with open("CraftDLL.bash","w",encoding='utf-8') as F:
        F.write("")