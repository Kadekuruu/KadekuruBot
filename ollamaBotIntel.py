from pathlib import Path
import discord
from discord.ext import commands
import subprocess
import time
import json
from ollama import chat

currentFolder = Path(__file__).parent

with open(currentFolder / "config.json", "r") as f:
    config = json.load(f)

model = config["model"]

serve_command = "C:\\Users\\skekung\\miniforge3\\condabin\\conda.bat activate llm-cpp && ollama serve"

run_command = f"C:\\Users\\skekung\\miniforge3\\condabin\\conda.bat activate llm-cpp && ollama run {model}"

serve_process = subprocess.Popen(["start", "cmd", "/k", serve_command], shell=True)

time.sleep(10)

run_process = subprocess.Popen(["start", "cmd", "/k", run_command], shell=True)

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
intents.reactions = True

client = discord.Client(intents=intents)
bot = commands.Bot(command_prefix="/", intents=intents)

chatMemory = []

@bot.event
async def on_ready():
    await bot.tree.sync()
    print("Online!")

@bot.event
async def on_message(message):
    if bot.user in message.mentions and message.author != bot.user:
        try:      
            incomingMessage = message.content
            chatMemory.append({"role": "user", "content": incomingMessage})
            
            response = chat(model=model, messages=chatMemory)
            outgoingMessage = response['message']['content']

            chatMemory.append({"role": "assistant", "content": outgoingMessage})
            await message.reply(outgoingMessage)
        except Exception as e:
            await message.channel.send(f"Error:\n{e}")
    else:
        return

@bot.tree.command(name="system", description="Add system prompt")
async def System(ctx: discord.Interaction, prompt: str):
    try:
        await ctx.response.send_message("System prompted (* ^ ω ^)")
        chatMemory.append({"role": "system", "content": prompt})
    except Exception as e:
        await ctx.followup.send_message(f"Error:\n{e}")

@bot.tree.command(name="retrievemessage", description="Retrieve message with index")
async def Retrieve(ctx: discord.Interaction, index: int):
    try:
        if index < 0 or index >= len(chatMemory):
            await ctx.response.send_message("Error:\n{e}")
            return
        
        await ctx.response.send_message("Retrieving message...")
        retrievedMessage = chatMemory[index]
        await ctx.followup.send_message(retrievedMessage)
    except Exception as e:
        await ctx.followup.send_message(f"Error:\n{e}")

@bot.tree.command(name="ping", description="Ping!")
async def Ping(interaction: discord.Interaction):
    try:
        await interaction.response.send_message("Ping!")
    except Exception as e:
        await interaction.channel.send(f"Error:\n{e}")

bot.run(config["bot_token"])
