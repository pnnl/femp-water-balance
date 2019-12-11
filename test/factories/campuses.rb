FactoryBot.define do
  factory :campus do |campus|
    campus.sequence(:name) {|n| "test-#{n} Campus" }
  end
end
