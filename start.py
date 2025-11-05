import subprocess
import os
from time import sleep
from run_fscripts import run_scripts
import sys

DEBUG_MODE = False
UPDATE_MODE = False

def start_scripts():
        run_scripts()
        print("Shutting All Processes Safely, DO NOT CLOSE THE TERMINAL\nThank You For Running FridAuto!")
        sleep(1.15)
        print(r"""
       ___________      .__    .___ _____          __          
       \_   _____/______|__| __| _//  _  \  __ ___/  |_  ____  
        |   ___) \_  __ \  |/ __ |/  /_\  \|  |  \   __\/  _ \ 
        |  \      |  | \/  / /_/ /    |    \  |  /|  | (  <_> )
        \  /      |__|  |__\____ \____|__  /____/ |__|  \____/ 
        \/                     \/       \/                    
                Made By Taher
        """)
        sleep(2)


options = sys.argv

if "-h" in options or "--help" in options:
        print('''
              -d/--debug : Enables debug mode
              -u/--update : Fetches latest Github Updates and uses current version installed
              ''')
        
        sys.exit()

if "-d" in options or "--debug" in options:
        DEBUG_MODE = True

if "-u" in options or "--update" in options:
        UPDATE_MODE = True



print(r"""
___________      .__    .___ _____          __          
\_   _____/______|__| __| _//  _  \  __ ___/  |_  ____  
 |   ___) \_  __ \  |/ __ |/  /_\  \|  |  \   __\/  _ \ 
 |  \      |  | \/  / /_/ /    |    \  |  /|  | (  <_> )
 \  /      |__|  |__\____ \____|__  /____/ |__|  \____/ 
  \/                     \/       \/                    
          Made By Taher
""")

sleep(2)

print("\nChecking For Updates\n")

upd_script = os.path.join(os.path.dirname(__file__), "check_and_update.ps1")

if UPDATE_MODE:
        try:
                result = subprocess.run(
                ["powershell", "-ExecutionPolicy", "Bypass", "-File", upd_script,"-Quiet"],
                capture_output=True,
                text=True
                )
        except Exception as e:
                if DEBUG_MODE:
                        print(e)
                else:
                        print("An error Occured fetching latest file, Use -d in options to see what happened")

        if "STATUS:UP_TO_DATE" in result.stdout:
                print("Latest Version Already Installed")
        elif "STATUS:UPDATE_SUCCESS" in result.stdout:
                print("Installed Latest Update")
        elif "STATUS:COULD_NOT_CONNECT_TO_GITHUB" in result.stdout or result.returncode != 0:
                print("Unable to connect to github\nSkipping Version Update")
else:
        print("Skipped Version Check")

sleep(1)

path = __file__.removesuffix("\\start.py") + "\\frida-setup"

extra_path = path 
script_path = path + "\\frida-setup.ps1"

try:
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path, extra_path])
        sleep(1.5)
        start_scripts()
except Exception as e:
        if DEBUG_MODE:
                print(e)
        else:
                print("An error occured, most likely due to usb device not detected\nTry option -d for more info\n")


