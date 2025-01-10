import discord
import ollama
from ollama import chat
from ollama import ChatResponse 
from discord.ext import commands

Template='''
FROM dolphin-mistral
SYSTEM SampleText
'''

ollama.create(model='dolphin-mistral', modelfile=Template)

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
    if bot.user in message.mentions:
        try:
            await message.add_reaction("✅")
            incomingMessage = message.content
            chatMemory.append({"role": "user", "content": incomingMessage})
            
            response = chat(model='dolphin-mistral', messages=chatMemory)
            outgoingMessage = response['message']['content']

            chatMemory.append({"role": "assistant", "content": outgoingMessage})
            await message.channel.send(outgoingMessage)
            await message.clear_reaction("✅")
        except Exception as e:
            await message.channel.send(f"Error! (*. .)人\n{e}")


@bot.tree.command(name="ping", description="Ping!")
async def Log(interaction: discord.Interaction):
    try:
        await interaction.response.send_message("Ping!")
    except Exception as e:
        await interaction.channel.send(f"Error! (*. .)人\n{e}")

bot.run('Did you really think?')