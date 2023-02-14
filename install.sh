#!/bin/bash

#Post archinstall with qtile desktop
#

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# locations
SCRIPTS=$HOME/.scripts
CONFIG=$HOME/.config
SCREENSHOTS=$HOME/Screenshots
ICONS=$HOME/.icons
WALLPAPER=$HOME/.wallpaper
THEMES=$HOME/.themes


# create all directories

[ -d $CONFIG ] && echo "Directory Exists" || mkdir -p $CONFIG
[ -d $SCRIPTS ] && echo "Directory Exists" || mkdir -p $SCRIPTS
[ -d $WALLPAPER ] && echo "Directory Exists" || mkdir -p $WALLPAPER
[ -d $SCREENSHOTS ] && echo "Directory Exists" || mkdir -p $SCREENSHOTS
[ -d $ICONS ] && echo "Directory Exists" || mkdir -p $ICONS
[ -d $THEMES ] && echo "Directory Exists" || mkdir -p ~/.themes


# interactively copy this repo's contents

cp -ri $SCRIPT_DIR/Scripts/* $SCRIPTS
cp -ri $SCRIPT_DIR/Config/* $CONFIG
cp -ri $SCRIPT_DIR/Wallpaper/* $WALLPAPER
cp -ri $SCRIPT_DIR/Screenshots/* $SCREENSHOTS
cp -ri $SCRIPT_DIR/Icons/* $ICONS

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
sudo pacman -R lightdm lightdm-gtk-greeter

# install all my packages
echo "INSTALLING ALL SOFTWARE"
sudo pacman -S --noconfirm $(cat paclist)
paru -S --noconfirm $(cat parulist)

#Services
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
sudo npm i -g neovim

#converts to zsh
chsh -s $(which zsh)

#create theme link for sddm
echo "[Theme]" | sudo tee /etc/sddm.conf
echo "Current=archlinux" | sudo tee -a /etc/sddm.conf
sudo chmod 644 /etc/sddm.conf
sudo chown root /etc/sddm.conf

sudo chmod a+wr /opt/spotify
sudo chmod a+wr /opt/spotify/Apps -R

cd $HOME
git clone --depth=1 https://github.com/decaycs/decay-spicetify.git
cd decay-spicetify
test -d $HOME/.config/spicetify/Themes || mkdir -p $HOME/.config/spicetify/Themes 
cp -r ./Themes/* ~/.config/spicetify/Themes
spicetify config current_theme decayce
spicetify apply

read -r -p "Install dev environment? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
    echo "Installing dev library and applications"
    paru -S $(devpac)
    
    #python libraries
    sudo pip install pynvim black

    #php coding libraries
    wget -O phpcbf.phar https://squizlabs.github.io/PHP_CodeSniffer/phpcbf.phar
    chmod a+x phpcbf.phar
    sudo mv phpcbf.phar /usr/local/bin/phpcbf
   
fi


#Setup GTK, Icon and font
lxappearance

echo "reboot to complete installation"
