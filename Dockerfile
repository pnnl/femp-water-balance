FROM ruby:2.5.5
MAINTAINER Markus A. Kobold <markus.kobold@pnnl.gov>
LABEL Description="This image is the test environment for the Water Balance tool that is part of AssetScore" Vendor="Pacific Northwest National Laboratory" Version="1.0"
RUN apt-get update -qq && \
    apt-get install -qq -y build-essential libpq-dev && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -qq -y nodejs && \
    mkdir -p /water-balance
RUN npm install --global yarn
RUN useradd -d "/water-balance" -u 1000 -m -s /bin/bash wbrails
RUN mkdir -p /water-balance/log
RUN chown -R wbrails:wbrails /water-balance/log
ADD . /water-balance
WORKDIR /water-balance
RUN bundle install --system --quiet && \
    yarn install --production && \
    rake assets:precompile webpacker:compile

