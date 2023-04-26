from libqtile import qtile, widget, bar
from libqtile.lazy import lazy
from font import font, windowname
from color import colors
from layouts import MARGIN, BORDER_WIDTH
import os

CENTER_SPACERS = 100

fontinfo = dict(
    font=font["secondary"]["family"],
    padding=font["secondary"]["padding"],
    fontsize=font["secondary"]["fontsize"]
)

DEFAULT_FG = colors["fg"]
DEFAULT_BG = colors["bg"]
WIDTH=34

def launcher(qtile):
    lazy.spawn("sh " + os.path.expanduser("~/.scripts/rofi-launchpad.sh"))
    

groupbox = [widget.GroupBox, {
                "font" : font["clear"]["family"],
                "padding" : font["clear"]["padding"],
                "fontsize" : font["clear"]["fontsize"],
                "foreground": colors["cyan"],
                "highlight_method": "text",
                "block_highlight_text_color": colors["white"],
                "active": colors["fg"],
                "inactive": colors["cyan"],
                "rounded": False,
                "highlight_color": [colors["fg"], colors["yellow"]],
                "urgent_alert_method": "line",
                "urgent_text": colors["red"],
                "urgent_border": colors["red"],
                "disable_drag": True,
                "use_mouse_wheel": False,
                "hide_unused": False,
                "spacing": 5,
                "this_current_screen_border": colors["yellow"],
            }
        ]

windowname = [widget.WindowName, {
                "font": windowname,
                "fontsize": 16,
                "padding": 3,
                "format": '{name}',
                "background": colors["fg_gutter"],
                "center_aligned": True
            }
        ]

systray = [widget.Systray, {
        "background": colors["grey"],
        "foreground": colors["black"],
        }
    ]

spacer_small = [ widget.Spacer, {
        "length" : 5,
        # these values are used by style func, not qtile
        "is_spacer": True,
        "inheirit": True,
        "use_separator": False
    }
]

logo_image = [ widget.Image, {
        "background": colors["magenta"],
        "margin" : 3,
     #   "filename" : "~/.config/qtile/icon/artixlinux-logo-flat.png",
		"filename" : "~/.config/qtile/icon/archlinux-logo-flat.png",
        "mouse_callbacks":{
            "Button1": lazy.spawn("sh " + os.path.expanduser("~/.scripts/rofi-launchpad.sh"))
        },
    }
]

logo = [widget.TextBox, {
                "font" : font["clear"]["family"],
                "padding" : -2,
                "fontsize" : font["clear"]["fontsize"]*1.6,
                "text": " ",
                "background": colors["blue"],
                "foreground": colors["bg"],
                "mouse_callbacks":{
                    "Button1": lazy.spawn("sh " + os.path.expanduser("~/.scripts/rofi-launchpad.sh")) 
                },
            }
        ]                  

cpu = [widget.CPU, {
                **fontinfo,
                "format": " {freq_current}GHz {load_percent}%",
                "background": colors["yellow"],
                "foreground": colors["bg"]
            }
        ]
        

weather = [widget.OpenWeather, {
                **fontinfo,
                "cityid": 2169698,
                "format": "{icon} {main_temp} °{units_temperature} {weather_details} ",
                "metric": True,
                "background": colors["blue"],
                "foreground": colors["bg"],
                "mouse_callbacks":{"Button1": lambda: qtile.cmd_spawn('firefox https://openweathermap.org/city/2169698')},
            }
        ]
 

net = [widget.Net, {
                **fontinfo,
                "format": "\u2193 {down} \u2191 {up}",
                "interface": "enp42s0",
                "update_interval": 3,
                "background": colors["grey"]
            }
        ]

mem = [widget.Memory, {
                **fontinfo,
                "format": ": {MemUsed:.2f}/{MemTotal:.2f}{mm}",
                "update_interval": 1.0,
                "measure_mem": "G",
                "mouse_callbacks": {'Button1': lambda: qtile.cmd_spawn('alacritty -e htop')}, 
            }
        ]

updates = [widget.CheckUpdates, {
				**fontinfo,
                "update_interval": 800,
                "distro ": "Arch_checkupdates",
                "display_format": " {updates} Updates ",
                "background": colors["magenta"],
                "foreground": colors["bg"],
                "colour_have_updates": colors['black'],
                "colour_no_updates": colors['blue'],
                "mouse_callbacks": {'Button1': lambda: qtile.cmd_spawn('alacritty -e sudo pacman -Syu')}, 
            }
          ]        

layout = [widget.CurrentLayout, {
                **fontinfo,
                "background": colors["grey"]
            }
        ]

date = [widget.Clock, {
                **fontinfo,
                "format": ' %m/%d/%Y',
                "background": colors["grey"]
            }
        ]

time = [widget.Clock, {
                **fontinfo,
                "format": ' %I:%M %p ',
                "background": colors["fg_gutter"]
            }
        ]

def widgetlist():
    return [
        spacer_small,
        logo,
        groupbox,
        windowname,
        systray,
     #   cpu,
        updates,
        net,
        mem,
        layout,
        weather,
        date,
        time,
    ]

def style(widgetlist):
    # adds separator widgets in between the initial widget list
    styled = widgetlist[:]
    
    for index, wid in enumerate(widgetlist): 
        end_sep = {
            "font": "Iosevka Nerd Font",
            "text": " ",
            "fontsize": WIDTH,
            "padding": -1
        }

        if index < len(widgetlist)-1:
            end_sep["foreground"]=widgetlist[index+1][1].get("background", DEFAULT_BG)
            end_sep["background"]=wid[1].get("background", DEFAULT_BG)
            if wid[1].get("is_spacer") and wid[1].get("inheirit"):
                bg=widgetlist[index+1][1].get("background", DEFAULT_BG)
                wid[1]["background"] = bg
                end_sep["background"] = bg
            # insert separator before current
            if wid[1].get("use_separator", True):
                styled.insert(styled.index(wid)+1, (widget.TextBox, end_sep))
        
    return [w[0](**w[1]) for w in styled]

def my_bar():
    return bar.Bar(
        [
            *style(widgetlist())
        ],
        WIDTH,
        foreground=DEFAULT_FG,
        background=DEFAULT_BG,
        opacity=1.0,
        margin=[MARGIN, MARGIN, BORDER_WIDTH, MARGIN],

    )
