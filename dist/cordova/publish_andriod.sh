echo "coping app sources..."
cp -r ../../www ./

cordova build android --release

jarsigner -verbose -keystore neuronAppPad.keystore -signedjar platforms/android/build/outputs/apk/android-release-signed.apk platforms/android/build/outputs/apk/android-release-unsigned.apk neuronAppPad