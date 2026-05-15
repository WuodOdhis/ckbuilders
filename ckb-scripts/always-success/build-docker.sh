#!/bin/bash

# This script builds the CKB script inside a Docker container
# so you don't need to install Clang 16+ or RISC-V tools locally.

PROJECT_NAME="always-success"
DOCKER_IMAGE="nervos/ckb-riscv-gnu-toolchain:gnu-bionic-20191012"

# Note: Modern templates might prefer a different image, 
# but this is the standard one for CKB-VM logic.
# Alternatively, we can use the rust-based one.

docker run --rm -v "$(pwd)":/code -w /code \
    rust:1.90-slim-bookworm \
    bash -c "apt-get update && apt-get install -y clang-16 llvm-16 make && make build"

# Wait, the above might still be slow due to apt-get.
# Let's use the optimized CKB script build pattern.
