class AddIndiciesToEtoAndRainfall < ActiveRecord::Migration[5.2]
  def change
    add_index :rain_falls, :zip, :unique => false
    add_index :etos, :zip, :unique => false
  end
end
