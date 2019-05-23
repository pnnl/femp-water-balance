FactoryBot.define do
  factory :account do |user|
    user.sequence(:email) {|n| "test-#{n}-account@test.pnnl.gov" }
    user.password { 'password' }

    factory :administrator do
      transient do
        role_count { 1 }
      end
      after(:create) do |account, evaluator|
        create_list(:account_role, evaluator.role_count, account: account, role: :administrator)
      end
    end
  end
end
