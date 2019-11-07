class ChangeZipToString < ActiveRecord::Migration[5.2]
  def change
    change_column :rain_falls, :zip, :string
    change_column :etos, :zip, :string
  end
end
