import frida
import os
import time

def select_scripts(scripts_dir="./fscripts"):
    """
    List all JS scripts in the directory and let the user choose which ones to run.
    Returns a list of selected script filenames.
    Press Enter without input to select all scripts.
    """
    scripts = [f for f in os.listdir(scripts_dir) if f.endswith(".js")]
    if not scripts:
        print("[!] No scripts found in", scripts_dir)
        return []

    # Display scripts with indices
    print("Available scripts:")
    for i, script in enumerate(scripts, 1):
        print(f"{i}. {script}")

    choice = input("Enter numbers of scripts to run (comma-separated) or press Enter to run all: ").strip()
    if not choice:
        # Run all scripts if input is empty
        return scripts

    # Parse user input
    selected = []
    indices = choice.split(",")
    for idx in indices:
        idx = idx.strip()
        if idx.isdigit():
            num = int(idx) - 1
            if 0 <= num < len(scripts):
                selected.append(scripts[num])
            else:
                print(f"[!] Invalid script number: {idx}")
        else:
            print(f"[!] Invalid input: {idx}")

    return selected

def list_apps(device):
    """List all installed apps (like `frida-ps -Uai`)"""
    apps = device.enumerate_applications()
    apps_sorted = sorted(apps, key=lambda x: x.identifier.lower())
    for i, app in enumerate(apps_sorted, 1):
        print(f"{i}. {app.identifier} ({app.name})")
    return apps_sorted

def select_app(device):
    apps = list_apps(device)
    while True:
        choice = input("Enter the number of the app to attach Frida to: ").strip()
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(apps):
                return apps[idx].identifier
        print("[!] Invalid selection. Try again.")

def run_scripts(device=None, scripts_dir="./fscripts"):
    """
    Iterates over all scripts in ./fscripts.
    Spawns a fresh app instance for each script.
    Waits for Enter to continue to the next script.
    """
    if device is None:
        try:
            device = frida.get_usb_device(timeout=5)
        except frida.TimedOutError:
            print("[!] No USB device found.")
            return

    target_app = select_app(device)

    scripts = select_scripts()

    for script_file in scripts:
        script_path = os.path.join(scripts_dir, script_file)
        print(f"\n[+] Running script: {script_file}")

        # Spawn a fresh instance of the app
        try:
            pid = device.spawn([target_app])
            session = device.attach(pid)
        except Exception as e:
            print(f"[!] Failed to spawn or attach to {target_app}: {e}")
            continue

        # Load the Frida script
        try:
            with open(script_path, "r", encoding="utf-8") as f:
                js_code = f.read()

            frida_script = session.create_script(js_code)
            frida_script.on('message', lambda message, data: print(f"[FRIDA MESSAGE] {message}"))
            frida_script.load()

            # Resume the app
            try:
                device.resume(pid)
            except frida.InvalidArgumentError:
                print("[!] PID already resumed or invalid.")
            time.sleep(0.5)

            print(f"[+] Script {script_file} loaded. App is running.")

            if input("[*] Press Q to Quit or\n[*] Press Enter to continue to the next script...") == 'q':
                return

        except Exception as e:
            print(f"[!] Error running {script_file}: {e}")

        # Detach and kill the app before the next iteration
        try:
            session.detach()
            # Optionally, force-stop the app to clean state
            # On Android, use adb: os.system(f"adb shell am force-stop {target_app}")
        except Exception as e:
            print(f"[!] Failed to detach session: {e}")
