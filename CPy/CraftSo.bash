if ["$#" -ne 2]; then
    echo "Need full C source filename and shared object filename $0 <C-src> <Output-SO>"
    exit 1
fi

cd "./Src" || {echo "Could not find the Src dir";exit1;}

gcc -shared -o "$2" "$1" -fPIC

if [$? -eq 0]; then
    echo "Shared object created as $1"
else
    echo "Could not create the shared object file"
    exit 1
fi