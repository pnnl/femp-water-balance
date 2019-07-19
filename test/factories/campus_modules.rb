FactoryBot.define do
  factory :campus_module do |campus_module|
    campus_module.sequence(:name) {|n| "module_#{n}" }
  end
end
