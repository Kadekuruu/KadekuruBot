import subprocess
import os

def main():
    js_file_path = os.path.join(os.getcwd(), 'run.js')
    subprocess.run(['node', js_file_path], check=True)

if __name__ == "__main__":
    main()
