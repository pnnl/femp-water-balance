source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem('rails', '~> 5.2.0')
gem('active_model_serializers')
gem('activerecord-session_store')
# Use postgresql as the database for Active Record
gem('pg', '>= 0.18', '< 2.0')
# Use SCSS for stylesheets
gem('sass-rails', '~> 5.0')
# Use Uglifier as compressor for JavaScript assets
gem('uglifier', '>= 1.3.0')
# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem('webpacker')
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem('jbuilder', '~> 2.5')
# Reduces boot times through caching; required in config/boot.rb
gem('bootsnap', '>= 1.1.0', require: false)
gem('devise')
gem('devise-jwt')
gem('omniauth-google-oauth2')
gem('google-api-client')

group :development do
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem('spring')
  gem('spring-watcher-listen', '~> 2.0.0')
end

group :test do
  gem('rspec-rails', '~> 3.0')
  gem('rspec_junit_formatter', require: false)
  gem('factory_bot_rails')
  gem('simplecov', require: false)
  gem('database_cleaner')
  # code quality based gems
  gem('rubocop', require: false)
  gem('rubocop-rspec', require:  false)
  gem('rubocop-performance', require: false)
  gem('rubocop-checkstyle_formatter', require: false)
  gem('brakeman', require: false)

  # Adds support for Capybara system testing and selenium driver
  gem('capybara', '>= 2.15', '< 4.0')
  gem('selenium-webdriver')
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem('chromedriver-helper')
end
