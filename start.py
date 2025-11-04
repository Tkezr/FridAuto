import subprocess
import os
from time import sleep
from run_fscripts import run_scripts

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


subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", upd_script],
        capture_output=True,
        text=True
    )

print("Success")

path = __file__.removesuffix("\\start.py") + "\\frida-setup"

extra_path = path 
script_path = path + "\\frida-setup.ps1"

subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path, extra_path])
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
