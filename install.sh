#!/bin/bash

#install post running archinstall with qtile desktop
#

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# locations
SCRIPTS=$HOME/.scripts
CONFIG=$HOME/.config
SCREENSHOTS=$HOME/Screenshots
LOCAL=$HOME/.local
ICONS=$HOME/.icons
WALLPAPER=$HOME/.wallpaper

# create all directories

mkdir -p $CONFIG
mkdir -p $SCRIPTS
mkdir -p $WALLPAPER
mkdir -p $SCREENSHOTS
mkdir -p $LOCAL
mkdir -p $ICONS

# interactively copy this repo's contents

cp -ri $SCRIPT_DIR/Scripts/* $SCRIPTS
cp -ri $SCRIPT_DIR/Config/* $CONFIG
cp -ri $SCRIPT_DIR/Wallpaper/* $WALLPAPER
cp -ri $SCRIPT_DIR/Screenshots/* $SCREENSHOTS
cp -ri $SCRIPT_DIR/Local/* $LOCAL
cp -ri $SCRIPT_DIR/Icons/* $ICONS

# misc stuff
cp -i $SCRIPT_DIR/.aliases ~/.aliases
cp -i $SCRIPT_DIR/.gtkrc-2.0 ~/.gtkrc-2.0

#zshrc base file
cp .zshrc ~

echo "INSTALLING PARU"
git clone https://aur.archlinux.org/paru-bin.git
cd $SCRIPT_DIR/paru-bin
makepkg -si
cd $SCRIPT_DIR
rm -rf $SCRIPT_DIR/paru-bin

# install all my packages
echo "INSTALLING ALL SOFTWARE"
sudo pacman -S --noconfirm $(cat paclist)
paru -S --noconfirm  $(cat yaylist)

echo "INSTALLING ROSE-PINE-GTK"
wget https://github.com/rose-pine/gtk/releases/download/v2.0.0/AllRosePineThemesGTK.tar.gz
wget https://github.com/rose-pine/gtk/releases/download/v2.0.0/AllRosePineThemesIcons.tar.gz

tar xf AllRosePineThemesGTK.tar.gz
tar xf AllRosePineThemesIcons.tar.gz
rm AllRosePineThemesGTK.tar.gz
rm AllRosePineThemesIcons.tar.gz

sudo cp -r AllRosePineThemesGTK/rose-pine-gtk /usr/share/themes
sudo cp -r AllRosePineThemesIcons/rose-pine-icons /usr/share/icons

rm -rf AllRosePineThemesGTK
rm -rf AllRosePineThemesIcons

echo ">> installing spicetify..."
sudo chmod a+wr /opt/spotify
sudo chmod a+wr /opt/spotify/Apps -R

#spicetify backup
#BACK=$(pwd)
#SC="$(dirname "$(spicetify -c)")"
#cd $SC
#cd CustomApps
#echo ">> installing spicetify marketplace"
#git clone https://github.com/spicetify/spicetify-marketplace
#spicetify config custom_apps spicetify-marketplace
#cd ../Themes
#git clone https://github.com/spicetify/spicetify-themes
#cp spicetify-themes/* . -r
#rmdir spicetify-themes
#cd $BACK
#echo ">> installing dribbblish theme for spotify"
#$SCRIPT_DIR/Scripts/spicetify/dribbblish/install.sh

# installing psutil for qtile widgets
pip install psutil

#converts to zsh
chsh -s $(which zsh)