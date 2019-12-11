class AddOmniauthToAccounts < ActiveRecord::Migration[5.2]
  def change
    add_column :accounts, :provider, :string
    add_column :accounts, :uid, :string
    add_column :accounts, :token, :string
    add_column :accounts, :expires_at, :integer
    add_column :accounts, :expires, :boolean
    add_column :accounts, :refresh_token, :string
    add_column :accounts, :oauth_meta, :json
  end
end
