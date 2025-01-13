from pathlib import Path
import discord
import ollama
from ollama import chat
from ollama import ChatResponse
from discord.ext import commands

currentFolder = Path(__file__).parent
filePath = currentFolder

with open(currentFolder / "mizukiPrompt.json", "r") as f:
    modelfile = f.read()

with open(currentFolder / "ollamaConfig.json", "r") as f:
    config = f.read()

ollama.create(model = 'hf.co/MaziyarPanahi/Llama-3.2-3B-Instruct-GGUF:Q8_0', modelfile = modelfile)

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
    if bot.user in message.mentions and message.author != bot:
        try:
            await message.add_reaction("✅")
            incomingMessage = message.content
            chatMemory.append({"role": "user", "content": incomingMessage})
            
            response = chat(model='hf.co/MaziyarPanahi/Llama-3.2-3B-Instruct-GGUF:Q8_0', messages=chatMemory)
            outgoingMessage = response['message']['content']

            chatMemory.append({"role": "assistant", "content": outgoingMessage})
            await message.channel.send(outgoingMessage)
            await message.clear_reaction("✅")
        except Exception as e:
            await message.channel.send(f"Error! (ノ_<。)\n{e}")
    else:
        return

@bot.tree.command(name="system", description="Add system prompt")
async def System(ctx: discord.Interaction, prompt: str):
    try:
        await ctx.response.send_message("System prompted (* ^ ω ^)")
        chatMemory.append({"role": "system", "content": prompt})
    except Exception as e:
        await ctx.followup.send_message(f"Error! (ノ_<。)\n{e}")

@bot.tree.command(name="retrievemessage", description="Retrieve message with index")
async def Retrieve(ctx: discord.Interaction, index: int):
    try:
        if index < 0 or index >= len(chatMemory):
            await ctx.response.send_message("Invalid index! (ノ_<。)")
            return
        
        await ctx.response.send_message("Retrieving message...")
        retrievedMessage = chatMemory[index]
        await ctx.followup.send_message(retrievedMessage)
    except Exception as e:
        await ctx.followup.send_message(f"Error! (ノ_<。)\n{e}")

@bot.tree.command(name="ping", description="Ping!")
async def Ping(interaction: discord.Interaction):
    try:
        await interaction.response.send_message("Ping!")
    except Exception as e:
        await interaction.channel.send(f"Error! (ノ_<。)\n{e}")

#@bot.tree.command(name="log", description="Send chatlog")
#async def Log(interaction: discord.Interaction):
#    for index in chatMemory:
#        try:
#            for index in chatMemory:
#                await interaction.channel.send(chatMemory[index])
#        except Exception as e:
#            await interaction.channel.send(f"Error! (*. .)人\n{e}")

#@bot.tree.command(name="kill", description="Kill the bot (ノ_<。)")
#async def Kill(interaction: discord.Interaction):
#    await interaction.response.send_message(f"Shutting down (ノ_<。)")
#    sys.exit

bot.run(config)