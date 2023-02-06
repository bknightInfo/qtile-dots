#!/bin/bash

#enable polkit
/usr/bin/polkit-dumb-agent &

# enable dunst
killall -SIGUSR2 dunst
dunst &

blueman-applet &
nm-applet &
xfce4-clipman &
numlockx on &

xsuspender &
xmousepasteblock &
xclip &

# start picom
picom --config ~/.config/qtile/config/picom.conf &

#delay application launch
( sleep 30; volumeicon) &
