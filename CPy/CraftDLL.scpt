tell application "Terminal"
    activate
    do script "cd Src && pwd"
    do script "clang compile here"
end tell