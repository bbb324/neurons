#!/bin/bash
for file in `ls -all ./code | awk {'print $9'}`
do
    if [ -d $file ]
    then
        nothing='todo'
    else
        #echo $file 
        fileArr=$(echo $file|tr "_" "\n")
        arr=($fileArr)
        type=${arr[1]}
        subtype=${arr[2]}
        typekey='_'$type'_'$subtype'_'
        echo '"'$typekey'":"'$file'",'
    fi
done