FactoryBot.define do
  factory :account do |user|
    user.sequence(:email) {|n| "test-#{n}-account@test.pnnl.gov" }
    user.password { 'password' }
  end
end
