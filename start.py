import subprocess
import sys
import os
import platform

def nodeCheck():
    try:
        subprocess.run(['node', '--version'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Checking for Nodejs...")
        return True
    except subprocess.CalledProcessError:
        return False
    
def install_node():
    system_platform = platform.system().lower()

    print("Installing Node.js...")

    if system_platform == "windows":    
        subprocess.run(['winget', 'install', 'Node.js', '--silent'], check=True)

    elif system_platform == "darwin":   
        subprocess.run(['brew', 'install', 'node'], check=True)

    elif system_platform == "linux":
        subprocess.run(['sudo', 'apt', 'update'], check=True)
        subprocess.run(['sudo', 'apt', 'install', 'nodejs', 'npm', '-y'], check=True)

    else:
        print("Unsupported OS.")
        sys.exit(1)

    print("Node.js installed successfully.")

def execute_start_js():
    subprocess.run(['node', 'start.js'], check=True)

def main():

    if not nodeCheck():
        install_node()

    execute_start_js()

if __name__ == "__main__":
    main()