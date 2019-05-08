FROM ruby:2.5.5
MAINTAINER Markus A. Kobold <markus.kobold@pnnl.gov>
LABEL Description="This image is the test environment for the Water Balance tool that is part of AssetScore" Vendor="Pacific Northwest National Laboratory" Version="1.0"
ENV RAILS_ENV="test" NODE_ENV="production"
RUN apt-get update -qq && \
    apt-get install -qq -y build-essential libpq-dev && \
    curl -sL https://deb.nodesource.com/setup_11.x | bash - && \
    apt-get install -qq -y nodejs && \
    mkdir -p /water-balance
RUN npm install --global yarn
RUN mkdir -p /water-balance/log && mkdir -p /water-balance/node_modules
ADD . /water-balance
WORKDIR /water-balance
RUN bundle install --system --quiet && \
    yarn install --silent --ignore-optional --production --no-progress && \
    rake assets:precompile webpacker:compile
