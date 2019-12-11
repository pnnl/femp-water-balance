class Account < ApplicationRecord
  devise(:database_authenticatable, :registerable, :recoverable, :rememberable, :validatable, :trackable, :jwt_authenticatable, jwt_revocation_strategy: JWTBlacklist)
  devise(:omniauthable, omniauth_providers: %i[google_oauth2])
  has_many(:account_roles, inverse_of: :account, dependent: :destroy)

  def self.from_omniauth(access_token)
    account = find_or_create_by!(provider: access_token.provider, uid: access_token.uid) do |account|
      account.oauth_meta = access_token.info
      account.email = access_token.info.email
      account.password = Devise.friendly_token[0,20]
      account.password_confirmation = account.password
      account.token = access_token.credentials.token
      account.expires = access_token.credentials.expires
      account.expires_at = access_token.credentials.expires_at
      account.refresh_token = access_token.credentials.refresh_token
    end
    account.update(oauth_meta: access_token.info)
    account
  end

  def role_implied?(role)
    return false if account_roles.empty?
    account_roles.where('role > :role_value',role_value: role.is_a?(Symbol) ? AccountRole.roles[role] : role)
  end

  def role?(role)
    return false if account_roles.empty?
    account_roles.where(role: role).count > 0
  end
end
