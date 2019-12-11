class AccountRole < ApplicationRecord
  enum( role: [:reviewer, :creator, :editor, :campus_admin, :administrator])
  belongs_to(:account, inverse_of: :account_roles)
end
