class Account < ApplicationRecord
  devise(:database_authenticatable, :registerable, :recoverable, :rememberable, :validatable, :trackable, :jwt_authenticatable, jwt_revocation_strategy: JWTBlacklist)
  has_many(:account_roles, inverse_of: :account, dependent: :destroy)

  def role_implied?(role)
    return false if account_roles.empty?
    account_roles.where('role > :role_value',role_value: role.is_a?(Symbol) ? AccountRole.roles[role] : role)
  end

  def role?(role)
    return false if account_roles.empty?
    account_roles.where(role: role).count > 0
  end
end
