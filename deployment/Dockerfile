FROM phusion/passenger-ruby25:1.0.5
LABEL maintainer="Markus A. Kobold <markus.kobold@pnnl.gov>"
LABEL description="Production optimized docker image for Water Balance tool that is part of AssetScore"
ENV HOME /root
ENV RAILS_RELATIVE_URL_ROOT /
CMD ["/sbin/my_init"]

RUN apt-get update -qq && apt-get upgrade -qq -y -o Dpkg::Options::="--force-confold"
RUN apt-get install -qq -y build-essential nodejs npm libpq-dev tzdata
RUN rm -f /etc/service/nginx/down
RUN rm /etc/nginx/sites-enabled/default

ADD nginx-env.conf /etc/nginx/main.d/nginx-env.conf
ADD resolv.conf /etc/resolv.conf
COPY wb-rails-nginx.conf /etc/nginx/sites-enabled/webapp.conf

RUN mkdir -p /home/app/water-balance
ADD water-balance-app.tgz /home/app/water-balance

WORKDIR /home/app/water-balance
RUN gem uninstall -i /usr/local/rvm/gems/ruby-2.5.5@global bundler && gem install bundler --version 1.17.3
RUN bundle install --system --quiet
RUN rake assets:precompile webpacker:compile
RUN chown -R app:app /home/app/water-balance

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /home/app/water-balance/log/* /home/app/water-balance/tmp/*
