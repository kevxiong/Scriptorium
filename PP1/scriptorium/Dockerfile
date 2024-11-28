# Use Ubuntu 20.04 as the base image
FROM ubuntu:20.04

# Set noninteractive frontend to suppress prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# Set the working directory
WORKDIR /app

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        nodejs \
        npm \
        openjdk-11-jdk \
        gcc \
        g++ \
        ruby-full \
        golang-go \
        php \
        wget \
        curl \
        unzip && \
    ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# Install .NET SDK for C#
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y --no-install-recommends dotnet-sdk-5.0

# Install Swift
RUN wget https://swift.org/builds/swift-5.4-release/ubuntu2004/swift-5.4-RELEASE/swift-5.4-RELEASE-ubuntu20.04.tar.gz && \
    tar xzf swift-5.4-RELEASE-ubuntu20.04.tar.gz && \
    mv swift-5.4-RELEASE-ubuntu20.04 /usr/share/swift && \
    ln -s /usr/share/swift/usr/bin/swift /usr/bin/swift

# Clean up to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set the default command
CMD ["/bin/bash"]
