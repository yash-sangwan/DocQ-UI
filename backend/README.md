
## Installation

### Install requirements :
```bash
# Install the required packages from the requirements file
pip install -r req.txt
```

### Pytorch for cuda version 12.8

```bash
# Uninstall existing PyTorch packages
pip uninstall torch torchvision torchaudio torchtext -y
```

```bash
# Install PyTorch with CUDA 12.8 support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```