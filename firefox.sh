SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

#firefox changes
echo ">> launching firefox without gui..."
firefox --headless &
# store most recently launched programs PID
FIREFOX_PID=$!
echo ">> sleeping to wait for process..."
sleep 5
echo ">> downloading arkenfox user.js..."
git clone https://git.nixnet.services/Narsil/desktop_user.js $SCRIPT_DIR/userjs
echo ">> installing arkenfox user.js..."
FDIR=~/.mozilla/firefox/*default-release*/
#cp -r $SCRIPT_DIR/userjs/* $FDIR
#rm -rf $SCRIPT_DIR/userjs
#echo ">> installing my user overrides..."
#cp $SCRIPT_DIR/Extra/Firefox/user-overrides.js $FDIR
#echo ">> appending user settings..."
#$FDIR/updater.sh
#echo ">> installing rose pine userchrome..."
#cp -r $SCRIPT_DIR/Extra/Firefox/chrome $FDIR
