#
class AccountSerializer < ActiveSerializer
  attributes(%w(id email last_sign_in_at created_at updated_at oauth_meta roles))

  def roles
    object.account_roles.map {|v| {role: v.role}}
  end
end
