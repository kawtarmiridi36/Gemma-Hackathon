# %% [markdown]
# # Dar Al Oumouma AI - Darija Medical Fine-Tuning (Gemma 4 12B)
#
# This notebook fine-tunes the new Gemma 4 12B Unified model for Darija medical triage.
# Run this on Google Colab with an A100 GPU (12B model requires more VRAM than T4).
#
# ## Steps:
# 1. Upload `medical_darija_dataset.json` to Colab
# 2. Run all cells
# 3. The fine-tuned model will be saved to your HuggingFace Hub
# 4. Download the adapter and merge locally

# %% [markdown]
# ## 1. Install Dependencies

# %%
!pip install -q transformers peft datasets accelerate trl bitsandbytes

# %% [markdown]
# ## 2. Upload Dataset
# Upload `medical_darija_dataset.json` from `backend/app/ml/`

# %%
from google.colab import files
import json

uploaded = files.upload()
dataset_path = list(uploaded.keys())[0]
print(f"Dataset uploaded: {dataset_path}")

# %%
with open(dataset_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

print(f"Loaded {len(raw_data)} examples")
print(f"Example instruction: {raw_data[0]['instruction'][:100]}...")

# %% [markdown]
# ## 3. Format Dataset for Training

# %%
from datasets import Dataset

def format_example(example):
    instruction = example["instruction"]
    response = example["response"]

    messages = [
        {
            "role": "system",
            "content": """Nta m3awen medical dial l-mra l-7amla. Jwb f darija (l-3arbiya dyal maghrib).
Koul jawab khass ykoun f JSON format:
{
  "clarifying_questions": ["..."],
  "urgency_level": "green|orange|red",
  "red_flags_detected": ["..."],
  "summary": "...",
  "differential_hypotheses": ["..."],
  "draft_prescription": [{"medication": "...", "dosage": "...", "duration": "..."}],
  "recommendation": "..."
}
Jwb ghir f darija. Matjwbch f frança wla English."""
        },
        {"role": "user", "content": instruction},
        {"role": "assistant", "content": response}
    ]
    return {"messages": messages}

formatted = [format_example(ex) for ex in raw_data]
dataset = Dataset.from_list(formatted)
dataset = dataset.train_test_split(test_size=0.1, seed=42)

print(f"Train: {len(dataset['train'])}, Test: {len(dataset['test'])}")

# %% [markdown]
# ## 4. Load Model (Gemma-4-12B-it with LoRA)

# %%
import torch
from transformers import AutoModelForMultimodalLM, AutoProcessor, BitsAndBytesConfig

# Choose model size according to your GPU:
# - "google/gemma-2-2b-it"  -> Free Colab T4 GPU (Fast & light)
# - "google/gemma-2-9b-it"  -> Free Colab T4 GPU (with CPU offload)
# - "google/gemma-4-12B-it" -> Colab A100 / L4 GPU (Colab Pro)
model_id = "google/gemma-2-2b-it"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    llm_int8_enable_fp32_cpu_offload=True,
)

processor = AutoProcessor.from_pretrained(model_id)
tokenizer = processor.tokenizer # For SFTTrainer text processing
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForMultimodalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map={"": 0}, # Force all modules on GPU 0 to prevent CPU spillover error
)
model.config.use_cache = False

print(f"Model loaded: {model_id}")
print(f"Parameters: {model.num_parameters():,}")

# %% [markdown]
# ## 5. Apply LoRA

# %%
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# %% [markdown]
# ## 6. Train

# %%
from trl import SFTTrainer, SFTConfig

training_config = SFTConfig(
    output_dir="./darija-medical-lora",
    num_train_epochs=3,
    per_device_train_batch_size=1,        # VERY IMPORTANT: Set to 1 for Free T4 GPU
    gradient_accumulation_steps=16,       # Increased to compensate for small batch size
    learning_rate=2e-4,
    weight_decay=0.01,
    warmup_ratio=0.1,
    lr_scheduler_type="cosine",
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,
    dataset_text_field=None,
    packing=False,
)

trainer = SFTTrainer(
    model=model,
    args=training_config,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    processing_class=tokenizer,
    max_seq_length=512,                   # Moved here for trl compatibility
)

print("Starting training...")
trainer.train()

# %% [markdown]
# ## 7. Save LoRA Adapter

# %%
trainer.save_model("./darija-medical-lora-final")
tokenizer.save_pretrained("./darija-medical-lora-final")
print("LoRA adapter saved!")

# %% [markdown]
# ## 8. Merge and Export (Optional - for GGUF conversion)

# %%
from peft import PeftModel

# Load base model without quantization for merging
base_model = AutoModelForMultimodalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
)

merged_model = PeftModel.from_pretrained(base_model, "./darija-medical-lora-final")
merged_model = merged_model.merge_and_unload()

merged_model.save_pretrained("./darija-medical-merged")
tokenizer.save_pretrained("./darija-medical-merged")
print("Merged model saved!")

# %% [markdown]
# ## 9. Test the Model

# %%
def test_model(prompt):
    messages = [
        {
            "role": "system",
            "content": "Nta m3awen medical dial l-mra l-7amla. Jwb f darija."
        },
        {"role": "user", "content": prompt}
    ]

    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = processor(text=text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
        )

    input_len = inputs["input_ids"].shape[-1]
    response = processor.decode(outputs[0][input_len:], skip_special_tokens=True)
    return response

# Test
print("Test 1:")
print(test_model("Patient diali 3andha sda3 f rass w dghya w hiya f chhar 7"))
print("\n" + "="*50 + "\n")
print("Test 2:")
print(test_model("Patient diali kanha kat3ani mn ri2a w 9iyan w hiya f chhar 4"))

# %% [markdown]
# ## 10. Upload to HuggingFace Hub (Optional)
# %%
# from huggingface_hub import login
# login()  # Enter your HF token
#
# merged_model.push_to_hub("YOUR_USERNAME/darija-medical-0.5b")
# tokenizer.push_to_hub("YOUR_USERNAME/darija-medical-0.5b")
# print("Model uploaded to HuggingFace Hub!")
