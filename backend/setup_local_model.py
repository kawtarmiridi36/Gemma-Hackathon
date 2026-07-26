"""
Setup script for fine-tuned darija medical model.

Usage:
1. Run the Colab notebook to train the model
2. Upload the merged model to HuggingFace Hub
3. Run this script to download and set up the model locally

    python setup_local_model.py --repo YOUR_USERNAME/darija-medical-0.5b
"""
import argparse
import sys
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "models" / "darija-medical"


def download_model(repo_id: str):
    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("Installing huggingface_hub...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
        from huggingface_hub import snapshot_download

    print(f"Downloading model from {repo_id}...")
    snapshot_download(
        repo_id=repo_id,
        local_dir=str(MODEL_DIR),
        local_dir_use_symlinks=False,
    )
    print(f"Model saved to {MODEL_DIR}")


def verify_model():
    if not MODEL_DIR.exists():
        print("Model directory not found!")
        return False

    required_files = ["config.json"]
    has_weights = any(MODEL_DIR.glob("*.safetensors")) or any(MODEL_DIR.glob("*.bin"))

    for f in required_files:
        if not (MODEL_DIR / f).exists():
            print(f"Missing: {f}")
            return False

    if not has_weights:
        print("No model weights found!")
        return False

    print("Model files verified!")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup fine-tuned darija model")
    parser.add_argument("--repo", type=str, help="HuggingFace repo ID (e.g. user/darija-medical-0.5b)")
    parser.add_argument("--verify", action="store_true", help="Verify model files only")
    args = parser.parse_args()

    if args.verify:
        verify_model()
    elif args.repo:
        download_model(args.repo)
        verify_model()
    else:
        print("Usage:")
        print("  python setup_local_model.py --repo YOUR_USERNAME/darija-medical-0.5b")
        print("  python setup_local_model.py --verify")
