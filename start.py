import subprocess
import os
from time import sleep
from run_fscripts import run_scripts

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


print(r"""
___________      .__    .___ _____          __          
\_   _____/______|__| __| _//  _  \  __ ___/  |_  ____  
 |   ___) \_  __ \  |/ __ |/  /_\  \|  |  \   __\/  _ \ 
 |  \      |  | \/  / /_/ /    |    \  |  /|  | (  <_> )
 \  /      |__|  |__\____ \____|__  /____/ |__|  \____/ 
  \/                     \/       \/                    
          Made By Taher
""")

#sleep(3.5)

print("\nChecking For Updates\n")

upd_script = os.path.join(os.path.dirname(__file__), "check_and_update.ps1")

try:
        result = subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", upd_script,"-Quiet"],
        capture_output=True,
        text=True
        )
except Exception as e:
        print("An error Occured fetching latest file")

print("Running Latest FridAuto Version")

path = __file__.removesuffix("\\start.py") + "\\frida-setup"

extra_path = path 
script_path = path + "\\frida-setup.ps1"

try:
        subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path, extra_path])
        start_scripts()
except Exception as e:
        print("An error occured, most likely due to usb device not detected\nTry option -d for more info\n")


