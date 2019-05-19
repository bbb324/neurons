echo "get current time"
newVersion=daily-`date '+%Y%m%d'`
echo $newVersion

oldVersion=`cat config.xml | grep widget | grep version | awk '{print $3;}' | cut -d \= -f 2 | sed 's/\"//g' `
echo $oldVersion

cmd='s/'$oldVersion'/'$newVersion'/g'
echo $cmd
`sed -i "" $cmd config.xml`
