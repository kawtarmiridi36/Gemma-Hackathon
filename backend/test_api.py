import httpx
import json

headers = {
    "Authorization": "Bearer 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",
    "Content-Type": "application/json",
}

# Simple test first
messages = [
    {"role": "user", "content": "mrida diali 3ndha hri9 f kerchha"}
]

payload = {
    "model": "google/gemma-4-31b-it",
    "messages": messages,
    "temperature": 0.2,
    "max_tokens": 2048,
    "stream": False,
    "chat_template_kwargs": {"enable_thinking": False}
}

print("Sending simple test request...")
r = httpx.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload, timeout=120.0)
print("Status:", r.status_code)
data = r.json()
if "choices" in data:
    content = data["choices"][0]["message"]["content"]
    print("Content:", repr(content[:1000] if content else None))
else:
    print("Response:", json.dumps(data, indent=2)[:1000])
