#
module Api
  module V1
    module Admin
      class AccountSerializer < ActiveSerializer
        attributes(Account.column_names)
        has_many(:account_roles)
      end
    end
  end
end
