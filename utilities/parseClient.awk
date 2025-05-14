BEGIN {
    isAfterImports = 0
    isMaybeClient = 0
    fileName = ""
    system("mkdir -p ./highspellClient && mkdir -p ./highspellClient/babylonStuff")
}
/^    \( \(\) => \{$/ { # everything after this is past the imports
    isAfterImports = 1
}

/^[[:space:]]*class oF/ {
    isMaybeClient = 1
}

/^[[:space:]]*class/ {
    if (!isAfterImports){
        next
    }
    baseName = ""
    if (!printed[tolower($2)]) {
        printed[tolower($2)]++
        baseName = $2
    } else {
        baseName = $2 "$" printed[tolower($2)]
        printed[tolower($2)]++
    }

    if (isMaybeClient) {
        fileName = "./highspellClient/" baseName ".js"
    } else {
        fileName = "./highspellClient/babylonStuff/" baseName ".js"
    }
    if ($2 == "NI") {
        print "HERE!"
    }
    print "//Line Number: ", NR > fileName
}

{
    if (isAfterImports && fileName) {
        print $0 >> fileName
    }
}