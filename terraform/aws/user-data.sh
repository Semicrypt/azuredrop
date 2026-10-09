#!/usr/bin/env bash

set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update

apt-get install -y \
  ca-certificates \
  curl \
  git \
  nginx \
  docker.io \
  docker-compose-v2

systemctl enable docker
systemctl start docker

systemctl enable nginx
systemctl start nginx

usermod -aG docker ubuntu

mkdir -p /opt/azuredrop

chown ubuntu:ubuntu \
  /opt/azuredrop
