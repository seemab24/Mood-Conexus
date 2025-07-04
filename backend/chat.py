from flask import Blueprint, request, jsonify
import requests
import re
import os
from dotenv import load_dotenv  

#  Load environment variables from .env file
load_dotenv()

#  Securely get the API key from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

chat_bp = Blueprint('chat', __name__)


def format_reply(text):
    text = re.sub(r'\*\*\s+', '**', text)
    text = re.sub(r'(?<=\d)\.\s+', lambda m: f"{m.group()}\n", text)
    text = re.sub(r'\n(?=\d\.\s)', r'\n\n', text)
    text = re.sub(r'(?<!\n)(\*\*[^*]+\*\*)', r'\n\1', text)
    lines = [line.strip() for line in text.splitlines()]
    clean_text = '\n'.join([line for line in lines if line])
    return clean_text.strip()


@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message', '').strip()

    if not user_input:
        return jsonify({"reply": "Hi! How can I help with anime or book suggestions today?"})

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful and friendly assistant for an emotion-based recommendation website called MoodConexus.\n"
                            "- If a user expresses feeling sad, give a short 💡 motivational quote 🧠💪.\n"
                            "- If the user asks for a suggestion, give either an anime 🎥 or book 📚 (or both) based on the emotion in their message.\n"
                            "- Keep your replies short, clear, and kind.\n"
                            "- Be emotion-aware: respond differently for sadness 😢, happiness 😄, or excitement😊✨.\n"
                            "- Always respond naturally to what the user says without asking unnecessary questions.\n"
                            "- Format your reply cleanly using line breaks.\n"
                            "- When recommending anime, suggest they can watch it on https://9animetv.to/ 🎬.\n"
                            "- When recommending books, suggest they can download from https://oceanofpdf.com/ 📖.\n"
                        )
                    },
                    {
                        "role": "user",
                        "content": user_input
                    }
                ],
                "max_tokens": 200,
                "temperature": 0.7,
                "stop": None
            }
        )

        if response.status_code == 200:
            raw_reply = response.json()["choices"][0]["message"]["content"]
            reply = format_reply(raw_reply)
            return jsonify({"reply": reply})
        else:
            return jsonify({"reply": "MoodConexus Bot is temporarily unavailable. Please try again."}), 500

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"reply": "Something went wrong while generating response."}), 500
