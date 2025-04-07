from setuptools import setup, find_packages

setup(
    name="your_app",
    version="1.0.0",  # Directly specify the version here
    packages=find_packages(),
    install_requires=[
        "flask",
        "facenet-pytorch",
        "pillow",
        "torch",
        "torchvision",
        "pycryptodome"
    ],
)