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

sleep(3.5)

path = __file__.removesuffix("\\start.py") + "\\frida-setup"

extra_path = path 
script_path = path + "\\frida-setup.ps1"

subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", script_path, extra_path])

script_name, session = run_scripts()
if script_name:
    print(f"[+] Script {script_name} is running!")
else:
    print("[!] No script ran successfully.")