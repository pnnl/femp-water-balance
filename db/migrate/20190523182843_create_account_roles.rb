class CreateAccountRoles < ActiveRecord::Migration[5.2]
  def change
    create_table(:account_roles) do |t|
      t.belongs_to(:account, index: true)
      t.integer(:role, null: false, default: 0)
      t.timestamps(null: false)
    end
    add_index(:account_roles, [:role, :account_id], unique: true)
  end
end
