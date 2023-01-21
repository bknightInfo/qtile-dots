#!/bin/bash

#Post archinstall with qtile desktop
#

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# locations
SCRIPTS=$HOME/.scripts
CONFIG=$HOME/.config
SCREENSHOTS=$HOME/Screenshots
LOCAL=$HOME/.local
ICONS=$HOME/.icons
WALLPAPER=$HOME/.wallpaper
THEMES=$HOME/.themes


# create all directories

[ -d $CONFIG ] && echo "Directory Exists" || mkdir -p $CONFIG
[ -d $SCRIPTS ] && echo "Directory Exists" || mkdir -p $SCRIPTS
[ -d $WALLPAPER ] && echo "Directory Exists" || mkdir -p $WALLPAPER
[ -d $SCREENSHOTS ] && echo "Directory Exists" || mkdir -p $SCREENSHOTS
[ -d $LOCAL ] && echo "Directory Exists" || mkdir -p $LOCAL
[ -d $ICONS ] && echo "Directory Exists" || mkdir -p $ICONS
[ -d $THEMES ] && echo "Directory Exists" || mkdir -p ~/.themes


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
cp .zshrc ~/.zshrc

echo "INSTALLING PARU"
git clone https://aur.archlinux.org/paru-bin.git
cd $SCRIPT_DIR/paru-bin
makepkg -si
cd $SCRIPT_DIR
rm -rf $SCRIPT_DIR/paru-bin

#remove lightdm
sudo systemctl disable lightdm
sudo pacman -R lightdm lightdm-gtk-greeterP

# install all my packages
echo "INSTALLING ALL SOFTWARE"
sudo pacman -S --noconfirm $(cat paclist)
paru -S --noconfirm  $(cat yaylist)


#SDDM service
sudo systemctl enable sddm

#change SDDM background
sudo cp -i background.jpg /usr/share/sddm/themes/archlinux/

git clone --depth=1 https://github.com/decaycs/decay-gtk
cd decay-gtk
cp -r ./Themes/Dark-decay ~/.themes
cp -r ./Themes/Decayce ~/.themes


echo ">> installing spicetify..."
sudo chmod a+wr /opt/spotify
sudo chmod a+wr /opt/spotify/Apps -R

# installing psutil for qtile widgets
sudo pip install psutil

#converts to zsh
chsh -s $(which zsh)

#create theme link for sddm
echo "[Theme]" | sudo tee /etc/sddm.conf
echo "Current=archlinux" | sudo tee -a /etc/sddm.conf
sudo chmod 644 /etc/sddm.conf
sudo chown root /etc/sddm.conf

sudo chmod a+wr /opt/spotify
sudo chmod a+wr /opt/spotify/Apps -R

spicetify config current_theme decayce
spicetify apply

echo "INSTALLING NEOVIM BASE CONFIG"
# base install from https://github.com/nvim-lua/kickstart.nvim
mkdir -p ~/.config/nvim
cp init.lua ~/.config/nvim
mkdir -p ~/.config/nvim/lua/custom
cp plugins.lua ~/.config/nvim/lua/custom
mkdir -p ~/.config/nvim/after/plugin
cp defaults.lua ~/.config/nvim/after/plugin